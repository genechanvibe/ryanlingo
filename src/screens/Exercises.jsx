import { useMemo, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { useApp, useNavigate, useProgress } from '../store/AppStore.jsx';
import { sfx } from '../lib/sfx.js';
import { useLater } from '../lib/hooks.js';
import { ExerciseTitle } from '../components/Header.jsx';
import { Bear, CheerBear, Owl, SpeechBubble } from '../components/Mascots.jsx';
import { Banner, WrongBanner } from '../components/Banner.jsx';
import { ActionButton, CheckButton } from '../components/Buttons.jsx';

const OPTION = 'option-card w-full py-4 px-5 rounded-2xl text-left text-lg font-extrabold text-gray-700';
const NUMBER_WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' };

// ================= Q3: choose the correct answer =================
const Q3_OPTIONS = ['China room', 'Stairs', 'Finance room', '7th Fl. Walkup', 'Soi29 Wanchai'];
const Q3_ANSWER = 'Soi29 Wanchai';

export function Q3() {
  const go = useNavigate();
  const progress = useProgress();
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null);

  const check = () => {
    if (selected === Q3_ANSWER) {
      sfx.correct();
      progress.complete('q3');
      setResult('correct');
    } else {
      sfx.wrong();
      setResult('wrong');
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id="q3">Choose the correct answer</ExerciseTitle>

        <div className="flex items-end gap-3 mb-6">
          <Owl />
          <SpeechBubble>The most dangerous place on earth for Ryan</SpeechBubble>
        </div>

        <div className="flex flex-col gap-3">
          {Q3_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              className={`${OPTION} ${selected === opt ? 'selected' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <CheckButton enabled={!!selected} onClick={check} />

      {result === 'correct' && (
        <Banner type="success" title="Good job!" explanation="No explanation needed😤" onContinue={() => go('q4')} />
      )}
      {result === 'wrong' && <WrongBanner onContinue={() => setResult(null)} />}
    </div>
  );
}

// ================= Q4: complete the sentence (+ combo animation) =================
const Q4_WORDS = ['Lamb', 'Puppy', 'Wolf', 'Teerak', 'Evil', 'Pervert', 'Fox', 'Koshka', 'Good boy', 'Sugar'];
const Q4_ANSWER = ['Evil', 'Pervert', 'Puppy'];
const SPARKLE_COUNT = 14;

function ComboOverlay() {
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => {
        const angle = (i / SPARKLE_COUNT) * Math.PI * 2;
        const dist = 70 + Math.random() * 60;
        return { '--dx': `${Math.cos(angle) * dist}px`, '--dy': `${Math.sin(angle) * dist}px` };
      }),
    [],
  );

  return (
    <div className="combo-overlay">
      <svg className="lightning-bolt-svg" viewBox="0 0 400 800" preserveAspectRatio="none">
        <path
          d="M 180, 20 L 250, 20 L 190, 160 L 270, 160 L 140, 420 L 230, 420 L 110, 780 L 180, 450 L 120, 450 L 210, 220 L 140, 220 Z"
          fill="#FFE500"
          opacity="0.4"
        />
        <path
          d="M 190, 30 L 240, 30 L 195, 170 L 260, 170 L 150, 410 L 220, 410 L 120, 760 L 175, 440 L 130, 440 L 205, 230 L 150, 230 Z"
          fill="#FFC700"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
      <div className="duo-combo-text">COMBO x10</div>
      {sparkles.map((style, i) => (
        <div key={i} className="combo-sparkle" style={style} />
      ))}
    </div>
  );
}

export function Q4() {
  const go = useNavigate();
  const progress = useProgress();
  const later = useLater();
  const [sentence, setSentence] = useState([]); // indexes into Q4_WORDS, in tap order
  const [result, setResult] = useState(null);
  const [combo, setCombo] = useState(false);

  const check = () => {
    const words = sentence.map((i) => Q4_WORDS[i]);
    const ok = words.length === Q4_ANSWER.length && words.every((w, i) => w === Q4_ANSWER[i]);
    if (!ok) {
      sfx.wrong();
      setResult('wrong');
      return;
    }
    sfx.correct();
    progress.complete('q4');
    setResult('correct');
    setCombo(true);
    progress.setFlash(true);
    later(() => progress.setFlash(false), 800);
    later(() => setCombo(false), 1400);
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id="q4" className="mb-4">Complete the sentence</ExerciseTitle>

        <div className="flex items-end gap-3 mb-4">
          <Bear />
          <SpeechBubble textClass="text-lg font-extrabold text-[#4B4B4B] leading-snug">
            Ryan is a{' '}
            <span className="text-[#AFAFAF] font-black tracking-[2px]">………. &nbsp; ……… &nbsp; ………</span>
          </SpeechBubble>
        </div>

        <div className="drop-zone-container">
          {sentence.map((wordIdx) => (
            <button
              key={wordIdx}
              className="word-bubble"
              onClick={() => setSentence((s) => s.filter((i) => i !== wordIdx))}
            >
              {Q4_WORDS[wordIdx]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {Q4_WORDS.map((word, idx) => (
            <button
              key={word}
              className={`word-bubble ${sentence.includes(idx) ? 'placeholder' : ''}`}
              onClick={() => setSentence((s) => [...s, idx])}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <CheckButton enabled={sentence.length > 0} onClick={check} />

      {combo && <ComboOverlay />}
      {result === 'correct' && (
        <Banner type="success" title="Nicely done!" explanation="Ryan has great self awareness." onContinue={() => go('wait')} />
      )}
      {result === 'wrong' && <WrongBanner onContinue={() => setResult(null)} />}
    </div>
  );
}

// ================= Cheering wait page =================
export function Wait() {
  const go = useNavigate();
  const { remaining } = useProgress();

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center py-5 relative">
      <div className="float-particle" style={{ top: '8%', left: '15%', color: '#FFC700', fontSize: 26 }}>★</div>
      <div className="float-particle" style={{ top: '12%', right: '15%', color: '#FF4B4B', fontSize: 22 }}>✦</div>
      <div className="float-particle" style={{ top: '2%', left: '50%', color: '#1CB0F6', fontSize: 24 }}>★</div>

      <CheerBear />

      <h1 className="text-[28px] font-black text-[#58CC02] mt-6 mb-2">Amazing job so far!</h1>
      <p className="text-lg font-extrabold text-[#777777] mb-6">
        only {NUMBER_WORDS[remaining] ?? remaining} question{remaining === 1 ? '' : 's'} left :)
      </p>

      <div className="flex gap-2 justify-center mt-4">
        <div className="sparkle-dot" />
        <div className="sparkle-dot" />
        <div className="sparkle-dot" />
      </div>

      <div className="w-full mt-9">
        <ActionButton onClick={() => go('chat')}>Continue</ActionButton>
      </div>
    </div>
  );
}

// ================= Complete the chat =================
const CHAT_TEXT = {
  A: 'Ok I will accept your cold hands',
  B: 'Ok I will touch you and comfort you',
};

export function Chat() {
  const { dispatch } = useApp();
  const progress = useProgress();
  const [active, setActive] = useState(1);
  const [answers, setAnswers] = useState({ 1: null, 2: null }); // slot -> 'A' | 'B'
  const [result, setResult] = useState(null);

  const choose = (key) => {
    const next = { ...answers, [active]: key };
    setAnswers(next);
    // jump to the other slot if it is still empty
    const other = active === 1 ? 2 : 1;
    if (!next[other]) setActive(other);
  };

  const check = () => {
    if (answers[1] === 'A' && answers[2] === 'B') {
      sfx.correct();
      progress.complete('chat');
      setResult('correct');
    } else {
      sfx.wrong();
      setResult('wrong');
    }
  };

  const slot = (n) => (
    <div
      onClick={() => setActive(n)}
      className={`chat-bubble-right-slot ${active === n ? 'active-slot' : ''} ${answers[n] ? 'filled' : ''}`}
    >
      {answers[n] ? (
        <span className="text-[15px] font-extrabold text-[#1CB0F6]">{CHAT_TEXT[answers[n]]}</span>
      ) : (
        <div className="slot-line" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id="chat" className="mb-4">Complete the chat</ExerciseTitle>

        <div className="flex flex-col gap-3 mb-5">
          <div className="chat-bubble-left">
            <p className="text-[15px] font-extrabold text-[#4B4B4B] leading-snug">
              even in the heat of argument and not yet fully dissolved, No need to talk about solutions yet because
              sometimes it takes time to think and comes to conclusions.
            </p>
          </div>
          <div className="chat-bubble-left">
            <p className="text-[15px] font-extrabold text-[#4B4B4B] leading-snug">I will put my cold hands in yours.</p>
          </div>
          {slot(1)}
          {slot(2)}
        </div>

        <div className="mt-2">
          {Object.entries(CHAT_TEXT).map(([key, text]) => (
            <button key={key} onClick={() => choose(key)} className="option-choice-card">
              {text}
            </button>
          ))}
        </div>
      </div>

      <CheckButton enabled={!!(answers[1] && answers[2])} onClick={check} />

      {result === 'correct' && (
        <Banner type="success" title="Nicely done!" message="You completed the chat conversation!" onContinue={() => dispatch({ type: 'START_CUSTOM' })} />
      )}
      {result === 'wrong' && (
        <WrongBanner
          title="Oops, that's not right"
          message="Check the correct order for your responses!"
          onContinue={() => setResult(null)}
        />
      )}
    </div>
  );
}

// ================= Birthday wish (hard exercise) =================
export function Wish() {
  const { state, dispatch } = useApp();
  const go = useNavigate();
  const progress = useProgress();
  const [text, setText] = useState(state.wish);

  const submit = () => {
    dispatch({ type: 'SET_WISH', wish: text.trim() });
    progress.complete('wish');
    sfx.correct();
    go('lessonComplete');
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#FF4B4B] text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="text-[#FF4B4B] font-black text-xs tracking-wider uppercase">Hard Exercise</span>
        </div>

        <ExerciseTitle id="wish" className="mb-4">Type your answer.</ExerciseTitle>

        <div className="flex items-end gap-3 mb-6">
          <Owl className="scale-90" />
          <SpeechBubble textClass="text-base font-extrabold text-gray-700 leading-snug">
            What is your birthday wish Ryan Sun?
          </SpeechBubble>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm focus-within:border-[#1CB0F6] transition-colors">
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-transparent text-gray-800 font-bold text-base focus:outline-none resize-none select-text"
            placeholder="type here. I will keep it a secret."
          />
        </div>
      </div>

      <CheckButton enabled={text.trim().length > 0} onClick={submit}>
        Submit
      </CheckButton>
    </div>
  );
}
