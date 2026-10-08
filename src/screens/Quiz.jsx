import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useConfig, useNavigate, useProgress } from '../store/AppStore.jsx';
import { sfx } from '../lib/sfx.js';
import { useLater } from '../lib/hooks.js';
import { ExerciseTitle } from '../components/Header.jsx';
import { Bear, Owl, SpeechBubble } from '../components/Mascots.jsx';
import { Banner, WrongBanner } from '../components/Banner.jsx';
import { CheckButton } from '../components/Buttons.jsx';

const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
const OPTION = 'option-card w-full py-4 px-5 rounded-2xl text-left text-lg font-extrabold text-gray-700';

// ================= Q1: fill in the blank =================
const Q1_OPTIONS = ['take a shit', 'fart', 'be stubborn', 'eat rice and sweets'];
const Q1_ANSWER = 'eat rice and sweets';

export function Q1() {
  const go = useNavigate();
  const progress = useProgress();
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null

  const check = () => {
    if (selected === Q1_ANSWER) {
      sfx.correct();
      progress.complete('q1');
      setResult('correct');
    } else {
      sfx.wrong();
      setResult('wrong');
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between">
      <div>
        <ExerciseTitle id="q1">Fill in the blank</ExerciseTitle>

        <div className="flex items-end gap-3 mb-8">
          <Owl />
          <SpeechBubble>
            Ryan likes to <span className="blank-underline">{selected}</span>
          </SpeechBubble>
        </div>

        <div className="flex flex-col gap-3">
          {Q1_OPTIONS.map((opt) => (
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
        <Banner
          type="success"
          title="Good job!"
          explanation="Even though Ryan often farts, takes a shit, and frequently being stubborn, doesn’t mean that he likes to do (or does he?🤔)"
          onContinue={() => go('q2')}
        />
      )}
      {result === 'wrong' && <WrongBanner onContinue={() => setResult(null)} />}
    </div>
  );
}

// ================= Q2: matching pairs =================
const PAIRS = [
  { left: 'Kiss', right: 'Head' },
  { left: 'Hold', right: 'Hand' },
  { left: 'Hug', right: 'Body' },
  { left: 'Protect', right: 'Feeling' },
  { left: 'Call', right: 'Baby' },
];

export function Q2() {
  const go = useNavigate();
  const progress = useProgress();
  const later = useLater();
  const [columns] = useState(() => ({
    left: shuffle(PAIRS.map((p) => p.left)),
    right: shuffle(PAIRS.map((p) => p.right)),
  }));
  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [matched, setMatched] = useState([]); // tile labels already paired
  const [wrong, setWrong] = useState([]); // tiles flashing red
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
    if (PAIRS.some((p) => p.left === left && p.right === right)) {
      sfx.correct();
      const next = [...matched, left, right];
      setMatched(next);
      if (next.length === PAIRS.length * 2) {
        progress.complete('q2');
        later(() => setDone(true), 300);
      }
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
        <ExerciseTitle id="q2">Tap the matching pairs</ExerciseTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">{columns.left.map((v) => tile('left', v))}</div>
          <div className="flex flex-col gap-3">{columns.right.map((v) => tile('right', v))}</div>
        </div>
      </div>

      <div className="pt-4 pb-6 text-center">
        <p className="text-gray-400 font-bold text-sm">Tap two items to form a match</p>
      </div>

      {done && (
        <Banner
          type="success"
          title="Great!"
          message="Ryan always knows to treat his girlfriend☺️"
          onContinue={() => go('brilliant')}
        />
      )}
    </div>
  );
}

// ================= Brilliant transition =================
export function Brilliant() {
  const go = useNavigate();
  const { brilliantMediaUrl } = useConfig();

  // fanfare on arrival, then auto-advance
  useEffect(() => {
    sfx.brilliant();
    const id = setTimeout(() => go('q3'), 2800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVideo = /\.(mp4|webm)$/i.test(brilliantMediaUrl);

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center">
      <h1 className="text-4xl font-black text-[#58CC02] mb-8 tracking-tight flex items-center justify-center gap-2">
        <span>Brilliant!</span>
        <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400 sparkle-icon" />
      </h1>

      <div className="relative my-4">
        {brilliantMediaUrl ? (
          isVideo ? (
            <video src={brilliantMediaUrl} autoPlay loop muted playsInline className="w-48 h-48 rounded-3xl object-cover shadow-lg" />
          ) : (
            <img src={brilliantMediaUrl} alt="" className="w-48 h-48 rounded-3xl object-cover shadow-lg owl-jumping" />
          )
        ) : (
          <div className="owl-jumping">
            <Owl className="scale-125" />
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto w-full">
        <button
          onClick={() => go('q3')}
          className="btn-green w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
