import { Heart, Star, X } from 'lucide-react';
import { useApp, useFavorites, useProgress } from '../store/AppStore.jsx';

// Persistent lesson header: quit button, global progress bar and hearts.
export function LessonHeader({ onQuit, showQuit = true }) {
  const { percent, flash } = useProgress();
  const { state } = useApp();

  return (
    <header className="p-4 max-w-md mx-auto w-full flex items-center justify-between gap-4">
      {showQuit ? (
        <button onClick={onQuit} className="text-gray-400 hover:text-gray-600 font-black" aria-label="Quit lesson">
          <X className="w-6 h-6" strokeWidth={3} />
        </button>
      ) : (
        <div className="w-6" />
      )}
      <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
        <div
          className={`progress-bar-fill bg-[#58CC02] h-full rounded-full ${flash ? 'gold-flash' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-[#FF4B4B] font-extrabold">
        <Heart className="w-6 h-6 fill-[#FF4B4B]" />
        <span>{state.hearts}</span>
      </div>
    </header>
  );
}

// Title row of an exercise with a favorite toggle.
export function ExerciseTitle({ id, children, className = 'mb-6' }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(id);
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <h1 className="text-2xl font-extrabold text-gray-800">{children}</h1>
      <button
        onClick={() => toggle(id)}
        aria-pressed={fav}
        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        className="mt-1 shrink-0"
      >
        <Star className={`w-6 h-6 ${fav ? 'fill-[#FFC800] text-[#FFC800]' : 'text-gray-300'}`} />
      </button>
    </div>
  );
}
