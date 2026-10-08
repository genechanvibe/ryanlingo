import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sfx.js';
import { launchBurst } from '../lib/confetti.js';
import { useLater } from '../lib/hooks.js';

const STAR_PATH = 'M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z';
const GOLD = 'url(#goldGradient)';

function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="white">
      <path d={STAR_PATH} />
    </svg>
  );
}

// Flame shapes are given as offsets from (cx, top). `tall` is the larger middle flame.
const FLAME_SHAPES = {
  small: {
    glowDy: 14,
    outer: [[-6, 10], [-7, 18], [0, 24], [7, 18], [6, 10]],
    mid: [6, [-4, 12], [-5, 17], [0, 22], [5, 17], [4, 12]],
    inner: [12, [-2, 15], [-2, 18], [0, 21], [2, 18], [2, 15]],
  },
  tall: {
    glowDy: 16,
    outer: [[-7, 12], [-8, 21], [0, 28], [8, 21], [7, 12]],
    mid: [7, [-5, 15], [-6, 21], [0, 26], [6, 21], [5, 15]],
    inner: [14, [-3, 18], [-3, 22], [0, 25], [3, 22], [3, 18]],
  },
};

function flamePath(cx, top, startDy, pts) {
  const [c1, c2, end, c3, c4] = pts;
  const p = ([dx, dy]) => `${cx + dx} ${top + dy}`;
  return `M ${cx} ${top + startDy} C ${p(c1)}, ${p(c2)}, ${p(end)} C ${p(c3)}, ${p(c4)}, ${cx} ${top + startDy} Z`;
}

function Flame({ cx, top, className, glowR, tall = false }) {
  const shape = FLAME_SHAPES[tall ? 'tall' : 'small'];
  return (
    <g className={className}>
      <circle cx={cx} cy={top + shape.glowDy} r={glowR} fill="url(#flameGlowYellow)" />
      <path d={flamePath(cx, top, 0, shape.outer)} fill="#FFC800" />
      <path d={flamePath(cx, top, shape.mid[0], shape.mid.slice(1))} fill="#FF5500" />
      <path d={flamePath(cx, top, shape.inner[0], shape.inner.slice(1))} fill="#FFFDE7" />
    </g>
  );
}

function Candle({ x, y, h }) {
  const cx = x + 9;
  return (
    <g>
      <rect x={x} y={y} width="18" height={h} rx="4" fill="#DCE0ED" />
      <rect x={x + 2} y={y} width="14" height={h - 2} rx="3" fill="#FFFFFF" />
      <ellipse cx={cx} cy={y} rx="7" ry="2.5" fill="#EEF0F8" />
      <line x1={cx} y1={y} x2={cx} y2={y - 9} stroke="#333333" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function PartyPopper({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <polygon points="12,52 38,36 28,26" fill="#FFC800" stroke="#E5A000" strokeWidth="2" />
      <path d="M12,52 L20,38 L30,44 Z" fill="#FF4B4B" />
      <circle cx="44" cy="22" r="3" fill="#58CC02" />
      <circle cx="52" cy="32" r="2.5" fill="#1CB0F6" />
      <circle cx="36" cy="14" r="2" fill="#FF4B4B" />
      <path d="M 38 28 Q 48 20 54 12" fill="none" stroke="#FF4B4B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 32 22 Q 42 12 48 4" fill="none" stroke="#1CB0F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 42 34 Q 52 30 60 26" fill="none" stroke="#FFC800" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// The lid is a separate <g> so it can be animated open; rendered inside the same <svg> by ChestWithLid.
function ChestWithLid({ open }) {
  return (
    <svg className="w-64 h-56 md:w-72 md:h-64 drop-shadow-xl overflow-visible" viewBox="0 0 300 250">
      <defs>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF5252" />
          <stop offset="100%" stopColor="#E03838" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFDF00" />
          <stop offset="100%" stopColor="#FFB100" />
        </linearGradient>
        <radialGradient id="chestShadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C26A00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF9600" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="150" cy="225" rx="115" ry="16" fill="url(#chestShadowGrad)" />
      <path d="M 42 195 C 40 222, 60 224, 75 222 L 225 222 C 240 224, 260 222, 258 195 Z" fill={GOLD} />

      <g>
        <rect x="48" y="132" width="204" height="74" rx="16" fill="url(#redGradient)" />
        <rect x="52" y="136" width="196" height="10" rx="5" fill="#B32424" opacity="0.25" />
        <rect x="74" y="132" width="36" height="74" rx="6" fill={GOLD} />
        <rect x="190" y="132" width="36" height="74" rx="6" fill={GOLD} />
        <rect x="46" y="130" width="208" height="20" rx="9" fill={GOLD} />
      </g>

      <g className={`transition-transform duration-700 ease-out origin-[150px_130px] ${open ? 'lid-open' : ''}`}>
        <path d="M 46 130 C 44 65, 85 45, 150 45 C 215 45, 256 65, 254 130 Z" fill="url(#redGradient)" />
        <path d="M 72 130 C 72 75, 98 52, 118 50 L 72 130 Z" fill={GOLD} />
        <path d="M 228 130 C 228 75, 202 52, 182 50 L 228 130 Z" fill={GOLD} />
        <path d="M 70 130 C 70 65, 110 48, 150 48 C 190 48, 230 65, 230 130 C 205 130, 180 66, 150 66 C 120 66, 95 130, 70 130 Z" fill={GOLD} />
        <rect x="42" y="118" width="216" height="18" rx="8" fill={GOLD} stroke="#E59E00" strokeWidth="1" />
        <g transform="translate(150, 126)">
          <path d="M 0 -22 C -20 -38 -38 -12 0 20 C 38 -12 20 -38 0 -22 Z" fill={GOLD} stroke="#D89200" strokeWidth="2" />
          <path d="M 0 -17 C -15 -30 -29 -9 0 15 C 29 -9 15 -30 0 -17 Z" fill="#FFFFFF" />
          <path d="M -6 -10 C -12 -16 -16 -8 -6 2 Z" fill="#EAEAEA" opacity="0.8" />
        </g>
      </g>
    </svg>
  );
}

function Cake() {
  return (
    <svg className="w-64 h-64 md:w-72 md:h-72 drop-shadow-2xl overflow-visible" viewBox="0 0 320 320">
      <defs>
        <radialGradient id="cakePlateShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#431375" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7828C8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameGlowYellow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF59D" stopOpacity="1" />
          <stop offset="50%" stopColor="#FF9800" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#E65100" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="160" cy="275" rx="125" ry="22" fill="url(#cakePlateShadow)" />
      <ellipse cx="160" cy="258" rx="116" ry="22" fill="#E2E4F0" />
      <ellipse cx="160" cy="254" rx="110" ry="18" fill="#FFFFFF" />

      <path d="M 52 178 C 52 208, 268 208, 268 178 L 268 238 C 268 258, 52 258, 52 238 Z" fill="#EEF0F8" />
      <path d="M 54 178 C 54 206, 266 206, 266 178 L 266 236 C 266 254, 54 254, 54 236 Z" fill="#FFFFFF" />

      <path
        d="M 52 174 C 52 195, 268 195, 268 174 Q 246 194, 226 182 Q 206 198, 186 182 Q 166 199, 146 182 Q 126 198, 106 182 Q 86 194, 66 179 Q 58 186, 52 174 Z"
        fill="#FF4B4B"
      />

      {[
        [72, 170, 10],
        [116, 178, 10],
        [160, 181, 10.5],
        [204, 178, 10],
        [248, 170, 10],
      ].map(([cx, cy, r]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={r} fill="#D32F2F" />
          <circle cx={cx + 1} cy={cy - 2} r={r - 2} fill="#FF3B3B" />
          <circle cx={cx - 2} cy={cy - 4} r="2.5" fill="#FFFFFF" opacity="0.85" />
        </g>
      ))}

      <Candle x={100} y={112} h={52} />
      <Candle x={151} y={98} h={66} />
      <Candle x={202} y={112} h={52} />

      <Flame cx={109} top={77} glowR={16} className="animate-flame" />
      <Flame cx={160} top={60} glowR={18} tall className="animate-flame-delay-1" />
      <Flame cx={211} top={77} glowR={16} className="animate-flame-delay-2" />
    </svg>
  );
}

export default function Ending() {
  const later = useLater();
  const confettiRef = useRef(null);
  const [scene, setScene] = useState('chest'); // 'chest' | 'cake'
  const [phase, setPhase] = useState('idle'); // idle | shake1 | shake2 | shake3 | open
  const [washed, setWashed] = useState(false);
  const [modal, setModal] = useState(false);

  const opening = phase !== 'idle';
  const opened = phase === 'open';

  const startOpening = () => {
    if (opening) return;
    setPhase('shake1');
    sfx.click();
    sfx.rumble(1);

    later(() => { setPhase('shake2'); sfx.rumble(1.5); }, 500);
    later(() => { setPhase('shake3'); sfx.rumble(2.2); }, 1000);
    later(() => { setPhase('open'); sfx.chestOpen(); sfx.victory(); }, 1500);
    later(() => setWashed(true), 3500);
    later(() => {
      setScene('cake');
      later(() => setWashed(false), 150);
    }, 4200);
  };

  // confetti once the cake scene shows
  useEffect(() => {
    if (scene !== 'cake') return;
    const id = setTimeout(() => launchBurst(confettiRef.current), 200);
    return () => clearTimeout(id);
  }, [scene]);

  const reset = () => {
    sfx.click();
    setPhase('idle');
    setWashed(false);
    setScene('chest');
  };

  const hint = opened ? 'HAPPY BIRTHDAY!' : opening ? 'Opening...' : 'Tap to open!';
  const shakeClass = { shake1: 'animate-shake-1', shake2: 'animate-shake-2', shake3: 'animate-shake-3' }[phase] ?? '';

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden font-nunito select-none">
      <div className="relative w-full max-w-md h-screen md:h-[840px] md:max-h-[92vh] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300">
        {/* SCENE 1: chest */}
        <div
          className={`absolute inset-0 bg-[#FF9600] flex flex-col items-center justify-between py-12 px-6 transition-opacity duration-300 ${
            scene === 'chest' ? 'z-10' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="pt-8 text-center z-10">
            <h1 className="text-white text-3xl md:text-4xl font-black tracking-widest drop-shadow-md uppercase">MEGA</h1>
          </div>

          <div
            onClick={startOpening}
            className="relative flex flex-col items-center justify-center cursor-pointer my-auto w-full max-w-[320px]"
          >
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 scale-125 z-0 ${
                opened ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <svg className="w-[420px] h-[420px] animate-spin-rays opacity-90" viewBox="0 0 200 200">
                <g fill="#FFE169">
                  <path d="M100,100 L90,0 L110,0 Z" />
                  <path d="M100,100 L200,90 L200,110 Z" />
                  <path d="M100,100 L110,200 L90,200 Z" />
                  <path d="M100,100 L0,110 L0,90 Z" />
                  <path d="M100,100 L163,36 L177,50 Z" />
                  <path d="M100,100 L163,163 L150,177 Z" />
                  <path d="M100,100 L36,163 L23,150 Z" />
                  <path d="M100,100 L36,36 L50,23 Z" />
                </g>
              </svg>
            </div>

            <div className="absolute inset-0 pointer-events-none z-20">
              <Star className="absolute top-2 left-16 w-6 h-6 sparkle-1" />
              <Star className="absolute top-20 right-4 w-7 h-7 sparkle-2" />
              <Star className="absolute bottom-6 right-10 w-8 h-8 sparkle-3" />
            </div>

            <div className={`relative z-10 transition-transform duration-200 ${shakeClass}`}>
              <ChestWithLid open={opened} />
            </div>
          </div>

          <div className="pb-8 text-center z-10">
            <p className="text-white text-xl font-extrabold tracking-wide animate-pulse-text drop-shadow">{hint}</p>
          </div>
        </div>

        {/* SCENE 2: cake */}
        <div
          className={`absolute inset-0 bg-[#7828C8] flex flex-col justify-between py-6 px-6 transition-opacity duration-300 ${
            scene === 'cake' ? 'z-10' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between text-white text-2xl px-2 pt-2 z-20">
            <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95" aria-label="Back">
              <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95" aria-label="Options">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2.5" />
                <circle cx="12" cy="12" r="2.5" />
                <circle cx="19" cy="12" r="2.5" />
              </svg>
            </button>
          </div>

          <canvas ref={confettiRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

          <div className="flex flex-col items-center justify-center my-auto z-20 w-full">
            <div className="relative mb-8">
              <Cake />
            </div>

            <div className="relative flex items-center justify-center w-full px-4 max-w-sm">
              <div className="mr-2 md:mr-4 shrink-0 transform -rotate-12 scale-110 md:scale-125">
                <PartyPopper className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
              </div>
              <div className="text-center">
                <h2 className="text-[#FFC800] text-3xl md:text-4xl font-black leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  Happy 29th<br />Birthday!
                </h2>
              </div>
              <div className="ml-2 md:ml-4 shrink-0 transform rotate-12 scale-x-[-1] scale-110 md:scale-125">
                <PartyPopper className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
              </div>
            </div>
          </div>

          <div className="w-full pt-4 pb-4 z-20">
            <button
              onClick={() => { sfx.click(); setModal(true); }}
              className="w-full py-4 text-center text-white text-lg md:text-xl font-extrabold tracking-wider rounded-2xl btn-3d-green uppercase transition-all duration-150"
            >
              CALL FOR ADMIN
            </button>
          </div>
        </div>

        {/* white wash transition */}
        <div
          className={`fixed inset-0 bg-white pointer-events-none z-40 transition-opacity duration-700 ease-in-out ${
            washed ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* admin popup */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-opacity duration-300 ${
            modal ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`bg-white rounded-3xl w-full max-w-sm p-6 text-center transform transition-transform duration-300 shadow-2xl flex flex-col items-center ${
              modal ? 'scale-100' : 'scale-90'
            }`}
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-duoRed" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,6 H16.25 C16.73,5.27 17,4.42 17,3.5 C17,1.57 15.43,0 13.5,0 C12.21,0 11.08,0.7 10.5,1.74 C9.92,0.7 8.79,0 7.5,0 C5.57,0 4,1.57 4,3.5 C4,4.42 4.27,5.27 4.75,6 H1 C0.45,6 0,6.45 0,7 V10 C0,10.55 0.45,11 1,11 H2 V20 C2,21.1 2.9,22 4,22 H20 C21.1,22 22,21.1 22,20 V11 H23 C23.55,11 24,10.55 24,10 V7 C24,6.45 23.55,6 23,6 H20 Z M13.5,2 C14.33,2 15,2.67 15,3.5 C15,4.33 14.33,5 13.5,5 C12.67,5 12,4.33 12,3.5 C12,2.67 12.67,2 13.5,2 Z M7.5,2 C8.33,2 9,2.67 9,3.5 C9,4.33 8.33,5 7.5,5 C6.67,5 6,4.33 6,3.5 C6,2.67 6.67,2 7.5,2 Z M11,20 H4 V11 H11 V20 Z M11,9 H2 V8 H11 V9 Z M20,20 H13 V11 H20 V20 Z M22,9 H13 V8 H22 V9 Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Birthday Present!</h3>
            <p className="text-gray-600 font-bold text-base md:text-lg leading-snug mb-6">
              Go find admin to redeem your birthday present! 🎉
            </p>
            <button
              onClick={() => { sfx.click(); setModal(false); }}
              className="w-full py-3.5 text-white text-lg font-extrabold tracking-wide rounded-2xl btn-3d-green uppercase transition-all"
            >
              GOT IT!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
