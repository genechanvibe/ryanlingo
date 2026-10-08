import { useEffect, useRef, useState } from 'react';
import { CircleCheck, Clock, Crown, Gift, Heart, Sparkles, Star, Zap } from 'lucide-react';
import { useApp, useFavorites, useNavigate, useProgress } from '../store/AppStore.jsx';
import { questionTitle } from '../data/questions.js';
import { sfx } from '../lib/sfx.js';
import { launchExplosion } from '../lib/confetti.js';
import { Owl } from '../components/Mascots.jsx';

const BLUE_BTN =
  'btn-blue-3d w-full bg-[#1CB0F6] text-white font-extrabold text-lg py-4 rounded-2xl uppercase tracking-widest text-center shadow-md';

// ================= Lesson complete (green) =================
export function LessonComplete() {
  const go = useNavigate();

  useEffect(() => {
    sfx.fanfare();
    const id = setTimeout(() => go('stats'), 1800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 text-center">
      <div className="owl-jumping mb-6">
        <Owl className="scale-150 mx-auto" />
      </div>
      <h1 className="text-4xl font-black tracking-tight">Lesson complete!</h1>
    </div>
  );
}

// ================= Well done / stats =================
export function Stats() {
  const go = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const cancel = launchExplosion(canvasRef.current);
    const pops = [150, 450, 750].map((ms) => setTimeout(sfx.pop, ms));
    return () => {
      cancel();
      pops.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col justify-between px-6 py-8">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 w-full h-full" />

      <div className="max-w-md mx-auto w-full text-center pt-4 z-10 relative">
        <div className="owl-jumping mb-4 inline-block">
          <Owl className="scale-110" />
        </div>
        <h1 className="text-3xl font-black text-gray-800 mb-1 tracking-tight">Well done!</h1>
        <p className="text-gray-400 font-bold text-sm">Every lesson gets you closer to your goals</p>
      </div>

      <div className="max-w-md mx-auto w-full my-auto space-y-6 z-10 relative">
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="stat-box stat-box-1 bg-white border-2 border-red-400 rounded-2xl p-3 text-center shadow-sm">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-0.5">
              <span>TOTAL</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </div>
            <div className="flex items-center justify-center gap-1 text-gray-800 font-black text-xl">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span>90%</span>
            </div>
          </div>

          <div className="stat-box stat-box-2 bg-white border-2 border-cyan-400 rounded-2xl p-3 text-center shadow-sm">
            <div className="text-[10px] font-black text-cyan-500 uppercase tracking-wider mb-1">PERFECT</div>
            <div className="flex items-center justify-center gap-1.5 text-gray-800 font-black text-xl">
              <CircleCheck className="w-5 h-5 text-cyan-500 fill-cyan-100" />
              <span>100%</span>
            </div>
          </div>

          <div className="stat-box stat-box-3 bg-white border-2 border-emerald-400 rounded-2xl p-3 text-center shadow-sm">
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1">TIME</div>
            <div className="flex items-center justify-center gap-1.5 text-gray-800 font-black text-xl">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span>29YO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full pt-4 z-10 relative">
        <button onClick={() => go('dailyQuest')} className={BLUE_BTN}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}

// ================= Daily quest =================
function QuestCard({ title, value, shown, max, animate, bonus, Icon, iconClass = 'text-[#FF8800]' }) {
  const pct = (value / max) * 100;
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-gray-800 text-base mb-2">{title}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 h-4 rounded-full relative overflow-visible flex items-center">
            <div
              className="bg-[#FF9600] h-full rounded-full relative"
              style={{ width: `${pct}%`, transition: 'width 1200ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {animate && (
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 pointer-events-none transition-opacity duration-300 flex items-center justify-center ${
                    animate === 'running' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-[#FFC800]/60 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-white shadow-[0_0_12px_#FF9600] flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF9600]" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <span
            className={`font-black text-sm min-w-[32px] text-right transition-transform ${
              animate ? 'text-[#FF9600]' : 'text-gray-400'
            } ${bonus ? 'pop-scale' : ''}`}
          >
            {shown}/{max}
          </span>
        </div>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] border-2 border-[#FFE885] flex items-center justify-center flex-shrink-0">
        <Icon className={`w-6 h-6 ${iconClass}`} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export function DailyQuest() {
  const go = useNavigate();
  const { state } = useApp();
  const { completed, total } = useProgress();
  const { favorites } = useFavorites();

  // staged animation: each bar fills one after the other
  const [stage, setStage] = useState(0); // 0 idle, 1 bar1 running, 2 bar1 done, 3 bar2 running, 4 bar2 done

  useEffect(() => {
    const timers = [
      setTimeout(() => { setStage(1); sfx.powerup(); }, 300),
      setTimeout(() => { setStage(2); sfx.pop(); }, 1500),
      setTimeout(() => { setStage(3); sfx.powerup(); }, 1800),
      setTimeout(() => { setStage(4); sfx.correct(); }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // bar fills while running; the numeric label updates once the bar lands
  const q1 = stage >= 1 ? completed : 0;
  const q1Shown = stage >= 2 ? completed : 0;
  const q2 = stage >= 3 ? 3 : 0;
  const q2Shown = stage >= 4 ? 3 : 0;
  const state1 = stage === 1 ? 'running' : 'idle';
  const state2 = stage === 3 ? 'running' : 'idle';

  return (
    <div className="flex-1 relative overflow-y-auto flex flex-col justify-between px-5 py-6">
      <div className="max-w-md mx-auto w-full space-y-5 my-auto">
        <div className="flex items-center gap-2 text-[#FF9600] font-black text-xl tracking-wide">
          <Zap className="w-6 h-6 fill-[#FF9600] text-[#FF9600]" />
          <span>+1 Quest Point!</span>
        </div>

        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Daily Quest update!</h1>

        <div className="space-y-3.5">
          <QuestCard
            title={`Answer in ${total} exercises`}
            value={q1}
            shown={q1Shown}
            max={total}
            animate={state1}
            bonus={stage === 2}
            Icon={Gift}
          />
          <QuestCard
            title="Score 100% in 3 answers"
            value={q2}
            shown={q2Shown}
            max={3}
            animate={state2}
            bonus={stage === 4}
            Icon={Crown}
          />

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-800 text-base mb-2">Having quality time with Gene</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 h-4 rounded-full relative overflow-hidden flex items-center">
                  <div className="bg-[#FF9600] h-full rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="font-black text-sm text-gray-400 min-w-[32px] text-right">0/1</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6D6] border-2 border-[#FFE885] flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-[#FF4B4B] fill-[#FF4B4B]" />
            </div>
          </div>

          <div className="bg-[#F0F9FF] border-2 border-[#BFE6FF] rounded-2xl p-4 shadow-sm relative">
            <div className="flex items-center gap-1.5 text-[#1CB0F6] font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>RYAN BIRTHDAY WISH</span>
            </div>
            <p className="text-gray-800 font-extrabold text-lg italic leading-relaxed break-words max-h-32 overflow-y-auto">
              &quot;{state.wish || 'A'}&quot;
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="bg-[#FFFBEA] border-2 border-[#FFE885] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[#E5A000] font-black text-xs uppercase tracking-wider mb-2">
                <Star className="w-4 h-4 fill-[#FFC800] text-[#FFC800]" />
                <span>FAVORITE QUESTIONS</span>
              </div>
              <ul className="space-y-1">
                {favorites.map((id) => (
                  <li key={id} className="text-gray-800 font-extrabold text-base">
                    {questionTitle(id, state.customQuestions)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto w-full pt-4 pb-2 z-10 relative">
        <button
          onClick={() => {
            sfx.fanfare();
            go('ending');
          }}
          className={BLUE_BTN}
        >
          OPEN CHEST
        </button>
      </div>
    </div>
  );
}
