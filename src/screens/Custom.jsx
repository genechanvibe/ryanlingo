import { useEffect, useState } from 'react';
import { useApp, useProgress } from '../store/AppStore.jsx';
import { sfx } from '../lib/sfx.js';
import { useLater } from '../lib/hooks.js';
import { ExerciseTitle } from '../components/Header.jsx';
import { Bear, Owl, SpeechBubble } from '../components/Mascots.jsx';
import { Banner, WrongBanner } from '../components/Banner.jsx';
import { CheckButton } from '../components/Buttons.jsx';

// Renders the question that the admin dashboard created, based on its `type`.
// Shapes (see QuestionsDashboard):
//   choice: { prompt, options[], correct, explanation }
//   pairs:  { pairs: [{ left, right }], explanation }
//   words:  { prompt, answer[], extra[], explanation }
//   text:   { prompt }
const OPTION = 'option-card w-full py-4 px-5 rounded-2xl text-left text-lg font-extrabold text-gray-700';
const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);

function useQuestionFlow(q) {
  const { dispatch } = useApp();
  const progress = useProgress();
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  return {
    result,
    clear: () => setResult(null),
    next: () => dispatch({ type: 'NEXT_CUSTOM' }),
    grade: (ok) => {
      if (ok) {
        sfx.correct();
        progress.complete(q.id);
      } else sfx.wrong();
      setResult(ok ? 'correct' : 'wrong');
    },
  };
}

function Feedback({ flow, q }) {
  return (
    <>
      {flow.result === 'correct' && (
        <Banner type="success" title="Good job!" explanation={q.explanation} onContinue={flow.next} />
      )}
      {flow.result === 'wrong' && <WrongBanner onContinue={flow.clear} />}
    </>
  );
}

function Choice({ q }) {
  const flow = useQuestionFlow(q);
  const [selected, setSelected] = useState(null);
  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id={q.id}>Choose the correct answer</ExerciseTitle>
        <div className="flex items-end gap-3 mb-6">
          <Owl />
          <SpeechBubble>{q.prompt}</SpeechBubble>
        </div>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)} className={`${OPTION} ${selected === i ? 'selected' : ''}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
      <CheckButton enabled={selected !== null} onClick={() => flow.grade(selected === q.correct)} />
      <Feedback flow={flow} q={q} />
    </div>
  );
}

function Pairs({ q }) {
  const flow = useQuestionFlow(q);
  const later = useLater();
  const [columns] = useState(() => ({
    left: shuffle(q.pairs.map((p) => p.left)),
    right: shuffle(q.pairs.map((p) => p.right)),
  }));
  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);

  const pick = (side, val) => {
    if (matched.includes(val) || wrong.includes(val)) return;
    const left = side === 'left' ? val : selLeft;
    const right = side === 'right' ? val : selRight;
    if (!left || !right) {
      (side === 'left' ? setSelLeft : setSelRight)(val);
      return;
    }
    setSelLeft(null);
    setSelRight(null);
    if (q.pairs.some((p) => p.left === left && p.right === right)) {
      sfx.correct();
      const next = [...matched, left, right];
      setMatched(next);
      if (next.length === q.pairs.length * 2) later(() => { flow.grade(true); setDone(true); }, 300);
    } else {
      sfx.wrong();
      setWrong([left, right]);
      later(() => setWrong([]), 500);
    }
  };

  const tile = (side, val) => {
    const state = matched.includes(val)
      ? 'matched'
      : wrong.includes(val)
        ? 'wrong'
        : (side === 'left' ? selLeft : selRight) === val
          ? 'selected'
          : '';
    return (
      <button
        key={val}
        onClick={() => pick(side, val)}
        className={`option-card w-full py-4 px-4 rounded-2xl text-center text-lg font-extrabold text-gray-700 ${state}`}
      >
        {val}
      </button>
    );
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id={q.id}>Tap the matching pairs</ExerciseTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">{columns.left.map((v) => tile('left', v))}</div>
          <div className="flex flex-col gap-3">{columns.right.map((v) => tile('right', v))}</div>
        </div>
      </div>
      <div className="pt-4 pb-6 text-center">
        <p className="text-gray-400 font-bold text-sm">Tap two items to form a match</p>
      </div>
      {done && <Feedback flow={flow} q={q} />}
    </div>
  );
}

function Words({ q }) {
  const flow = useQuestionFlow(q);
  const [bank] = useState(() => shuffle([...q.answer, ...q.extra]));
  const [sentence, setSentence] = useState([]); // indexes into bank, in tap order
  const check = () => {
    const words = sentence.map((i) => bank[i]);
    flow.grade(words.length === q.answer.length && words.every((w, i) => w === q.answer[i]));
  };
  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id={q.id}>Complete the sentence</ExerciseTitle>
        <div className="flex items-end gap-3 mb-6">
          <Bear />
          <SpeechBubble textClass="text-lg font-extrabold text-[#4B4B4B] leading-snug">
            {q.prompt} <span className="text-[#AFAFAF] font-black tracking-[2px]">………. &nbsp; ………</span>
          </SpeechBubble>
        </div>
        <div className="drop-zone-container">
          {sentence.map((i) => (
            <button key={i} className="word-bubble" onClick={() => setSentence((s) => s.filter((x) => x !== i))}>
              {bank[i]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {bank.map((word, i) => (
            <button
              key={i}
              className={`word-bubble ${sentence.includes(i) ? 'placeholder' : ''}`}
              onClick={() => setSentence((s) => [...s, i])}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
      <CheckButton enabled={sentence.length > 0} onClick={check} />
      <Feedback flow={flow} q={q} />
    </div>
  );
}

function FreeText({ q }) {
  const flow = useQuestionFlow(q);
  const [text, setText] = useState('');
  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id={q.id} className="mb-4">Type your answer.</ExerciseTitle>
        <div className="flex items-end gap-3 mb-6">
          <Owl className="scale-90" />
          <SpeechBubble textClass="text-base font-extrabold text-gray-700 leading-snug">{q.prompt}</SpeechBubble>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm focus-within:border-[#1CB0F6] transition-colors">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-transparent text-gray-800 font-bold text-base focus:outline-none resize-none select-text"
            placeholder="type here"
          />
        </div>
      </div>
      {/* any non-empty answer counts */}
      <CheckButton enabled={text.trim().length > 0} onClick={() => flow.grade(true)}>Submit</CheckButton>
      <Feedback flow={flow} q={q} />
    </div>
  );
}

const BY_TYPE = { choice: Choice, pairs: Pairs, words: Words, text: FreeText };

export default function Custom() {
  const { state, dispatch } = useApp();
  const q = state.customQuestions[state.customIndex];
  const Question = q && BY_TYPE[q.type];

  // question was deleted / has an unknown type: skip ahead
  useEffect(() => {
    if (!Question) dispatch({ type: 'NEXT_CUSTOM' });
  }, [Question, dispatch]);

  return Question ? <Question q={q} /> : null;
}
