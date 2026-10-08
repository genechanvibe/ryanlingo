import { useState } from 'react';
import { Delete, Heart, PartyPopper } from 'lucide-react';
import { useApp, useConfig, useNavigate } from '../store/AppStore.jsx';
import { sfx } from '../lib/sfx.js';
import { useLater, useShake } from '../lib/hooks.js';

const TARGET_USERNAME = 'ryansun_97';
const TARGET_PASSCODE = '091097';

export function Splash() {
  const go = useNavigate();
  const { faceUrl } = useConfig();
  return (
    <div className="flex-1 flex flex-col justify-center items-center cursor-pointer" onClick={() => go('username')}>
      <div className="relative w-48 h-48 mb-6 flex justify-center items-center">
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-[#78E22E]" fill="currentColor">
          <path d="M 30 50 Q 50 10 90 40 Q 110 10 170 50 L 170 100 Q 170 170 100 170 Q 30 170 30 100 Z" />
        </svg>
        <div className="relative z-10 w-28 h-28 bg-white rounded-full border-4 border-[#78E22E] overflow-hidden flex justify-center items-center shadow-inner">
          <img src={faceUrl} alt="Ryan's Face" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-4 z-20 w-8 h-8 bg-orange-400 rounded-b-full rounded-t-sm shadow-md" />
      </div>
      <h1 className="text-5xl font-black tracking-tight mt-4 drop-shadow-md">ryanlingo</h1>
      <p className="text-green-200 mt-4 text-sm font-bold opacity-80 animate-pulse">Tap anywhere to start</p>
    </div>
  );
}

export function Username() {
  const go = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shaking, shake] = useShake();

  const submit = () => {
    if (value.trim() === TARGET_USERNAME) {
      setError(false);
      go('passcode');
    } else {
      sfx.wrong();
      setError(true);
      shake();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6">
      <div className={`bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-gray-800 flex flex-col items-center ${shaking ? 'shake' : ''}`}>
        <h2 className="text-2xl font-extrabold mb-6 text-center">Log in to Ryanlingo</h2>

        <div className="w-full mb-2">
          <label className="block text-gray-500 font-bold mb-2 uppercase text-sm tracking-wider">Username</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl px-4 py-4 font-bold text-lg focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-colors"
            placeholder="Enter your username"
            autoComplete="off"
          />
        </div>

        <div className={`text-red-500 font-bold text-sm h-6 mb-4 transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}>
          Oops! Incorrect username.
        </div>

        <button
          onClick={submit}
          className="btn-3d w-full bg-[#58CC02] text-white font-extrabold text-lg py-4 rounded-2xl uppercase tracking-widest mt-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}

const KEYPAD_BTN =
  'keypad-btn w-20 h-20 rounded-full text-3xl font-bold flex justify-center items-center mx-auto shadow-md';

export function Passcode() {
  const go = useNavigate();
  const later = useLater();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shaking, shake] = useShake();

  const validate = (entered) => {
    if (entered === TARGET_PASSCODE) {
      setError(false);
      go('terms');
    } else {
      sfx.wrong();
      setError(true);
      shake();
      later(() => setCode(''), 400);
    }
  };

  const add = (digit) => {
    if (code.length >= 6) return;
    const next = code + digit;
    setCode(next);
    if (next.length === 6) later(() => validate(next), 150);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6">
      <div className="flex flex-col items-center w-full max-w-sm">
        <Heart className="text-red-400 w-8 h-8 mb-4 fill-red-400" />
        <h2 className="text-2xl font-bold mb-2">{TARGET_USERNAME}</h2>
        <p className="text-green-100 font-bold mb-8">Enter Passcode</p>

        <div className={`flex space-x-4 mb-12 ${shaking ? 'shake' : ''}`}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`pass-dot ${i < code.length ? 'filled' : ''}`} />
          ))}
        </div>

        <div className={`text-red-300 font-bold mb-4 h-6 transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}>
          Wrong passcode! Try again.
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 w-full px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className={KEYPAD_BTN} onClick={() => add(n)}>
              {n}
            </button>
          ))}
          <div className="w-20 h-20" />
          <button className={KEYPAD_BTN} onClick={() => add(0)}>
            0
          </button>
          <button
            className="w-20 h-20 rounded-full text-xl font-bold flex justify-center items-center mx-auto text-green-100 hover:text-white transition-colors"
            onClick={() => setCode((c) => c.slice(0, -1))}
            aria-label="Delete"
          >
            <Delete />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Terms() {
  const go = useNavigate();
  const [checks, setChecks] = useState([false, false, false]);
  const allChecked = checks.every(Boolean);
  const flip = (i) => setChecks((c) => c.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-gray-800 flex flex-col">
        <h2 className="text-xl font-extrabold mb-6 pb-4 border-b-2 border-gray-100">
          Please confirm that you’re ryansun_97
        </h2>

        <div className="flex flex-col space-y-4 mb-6">
          <label className="flex items-center space-x-4 cursor-pointer group">
            <input type="checkbox" className="duo-checkbox" checked={checks[0]} onChange={() => flip(0)} />
            <span className="font-bold text-gray-600 group-hover:text-gray-800 transition-colors">
              Confirmed that you’re Hing Yat Sun
            </span>
          </label>

          <label className="flex items-center space-x-4 cursor-pointer group">
            <input type="checkbox" className="duo-checkbox" checked={checks[1]} onChange={() => flip(1)} />
            <span className="font-bold text-gray-600 group-hover:text-gray-800 transition-colors">
              You are officially 29 years old
            </span>
          </label>

          <label className="flex items-start space-x-4 cursor-pointer bg-[#F2FAED] border-2 border-[#D7F0C8] p-4 rounded-2xl group">
            <input type="checkbox" className="duo-checkbox mt-1" checked={checks[2]} onChange={() => flip(2)} />
            <span className="font-bold text-[#58a700] text-sm leading-relaxed">
              I read and agreed to terms and conditions. Warning: be careful of your heart, contents may be extremely
              cute. Admin is too lazy to input link for terms and conditions, please contact admin in person for more
              details.
            </span>
          </label>
        </div>

        <button
          disabled={!allChecked}
          onClick={() => go('success')}
          className={`btn-3d w-full text-white font-extrabold text-lg py-4 rounded-2xl uppercase tracking-widest mt-auto ${
            allChecked ? 'bg-[#58CC02]' : 'bg-[#1CB0F6]'
          }`}
        >
          Log In
        </button>
      </div>
    </div>
  );
}

export function LoginSuccess() {
  const { dispatch } = useApp();
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
        <PartyPopper className="w-16 h-16 text-[#FFC800] mx-auto mb-4" />
        <h1 className="text-3xl font-black text-gray-800 mb-2">Happy Birthday!</h1>
        <h2 className="text-xl font-bold text-[#1CB0F6] mb-6">Ryan!</h2>
        <p className="text-gray-500 font-bold mb-6">You&apos;ve successfully unlocked your birthday app.</p>

        <button
          onClick={() => dispatch({ type: 'NAVIGATE', stage: 'q1' })}
          className="btn-3d w-full bg-[#58CC02] text-white font-extrabold text-lg py-4 rounded-2xl uppercase tracking-widest"
        >
          START PLAYING
        </button>
      </div>
    </div>
  );
}
