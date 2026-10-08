import { useApp } from './store/AppStore.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import { LessonHeader } from './components/Header.jsx';
import { LoginSuccess, Passcode, Splash, Terms, Username } from './screens/Login.jsx';
import { Brilliant, Q1, Q2 } from './screens/Quiz.jsx';
import { Chat, Q3, Q4, Wait, Wish } from './screens/Exercises.jsx';
import Custom from './screens/Custom.jsx';
import { DailyQuest, LessonComplete, Stats } from './screens/Rewards.jsx';
import Ending from './screens/Ending.jsx';

// stage -> { Screen, theme, lesson }. `lesson` screens render inside the persistent progress header.
const STAGES = {
  splash: { Screen: Splash, theme: 'green' },
  username: { Screen: Username, theme: 'green' },
  passcode: { Screen: Passcode, theme: 'green' },
  terms: { Screen: Terms, theme: 'green' },
  success: { Screen: LoginSuccess, theme: 'green' },
  q1: { Screen: Q1, theme: 'white', lesson: true },
  q2: { Screen: Q2, theme: 'white', lesson: true },
  brilliant: { Screen: Brilliant, theme: 'white', lesson: true },
  q3: { Screen: Q3, theme: 'white', lesson: true },
  q4: { Screen: Q4, theme: 'white', lesson: true },
  wait: { Screen: Wait, theme: 'white', lesson: true },
  chat: { Screen: Chat, theme: 'white', lesson: true },
  custom: { Screen: Custom, theme: 'white', lesson: true },
  wish: { Screen: Wish, theme: 'white', lesson: true },
  lessonComplete: { Screen: LessonComplete, theme: 'green' },
  stats: { Screen: Stats, theme: 'white' },
  dailyQuest: { Screen: DailyQuest, theme: 'cream' },
  ending: { Screen: Ending, theme: 'white' },
};

export default function App() {
  const { state, dispatch } = useApp();
  const { Screen, theme, lesson } = STAGES[state.stage];

  return (
    <div className={`theme-${theme} min-h-screen flex flex-col`}>
      <AdminPanel />
      {/* header lives outside the keyed wrapper so the progress bar animates between exercises */}
      {lesson && (
        <LessonHeader showQuit={state.stage !== 'brilliant'} onQuit={() => dispatch({ type: 'RESTART' })} />
      )}
      {/* key re-mounts the screen (restarting its animations/timers) on every stage change */}
      <div key={`${state.stage}-${state.customIndex}`} className="fade-in flex flex-col flex-1">
        {lesson ? (
          <main className="flex-1 max-w-md mx-auto w-full px-5 py-2 flex flex-col">
            <Screen />
          </main>
        ) : (
          <Screen />
        )}
      </div>
    </div>
  );
}
