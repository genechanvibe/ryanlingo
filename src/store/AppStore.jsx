import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { TOTAL_QUESTIONS } from '../data/questions.js';
import bundledQuestions from '../data/customQuestions.json';

const CONFIG_KEY = 'ryanlingo_config';
const FAVORITES_KEY = 'ryanlingo_favorites';
const QUESTIONS_KEY = 'ryanlingo_custom_questions';

export const DEFAULT_CONFIG = {
  faceUrl: "https://placehold.co/150x150/f0f0f0/a0a0a0?text=Ryan's+Face",
  brilliantMediaUrl: '',
  cloudApiUrl: '',
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / unavailable (e.g. large data-URL uploads) - state still works in memory
  }
};

const initialState = () => ({
  stage: 'splash', // which screen is showing
  completed: [], // ids of exercises answered correctly -> drives the progress bar
  hearts: 5,
  progressFlash: false, // gold flash on the progress bar (combo)
  favorites: readJSON(FAVORITES_KEY, []), // ids of favorited exercises
  wish: '', // Ryan's birthday wish
  customQuestions: readJSON(QUESTIONS_KEY, bundledQuestions), // questions added from the admin dashboard
  customIndex: 0, // which custom question is showing
  config: { ...DEFAULT_CONFIG, ...readJSON(CONFIG_KEY, {}) },
});

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, stage: action.stage };
    case 'COMPLETE_QUESTION':
      return state.completed.includes(action.id)
        ? state
        : { ...state, completed: [...state.completed, action.id] };
    case 'FLASH_PROGRESS':
      return { ...state, progressFlash: action.on };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id],
      };
    case 'SET_CUSTOM_QUESTIONS':
      return { ...state, customQuestions: action.questions };
    case 'PREVIEW_CUSTOM':
      return { ...state, stage: 'custom', customIndex: action.index };
    case 'START_CUSTOM': // after the chat: first custom question, or straight to the wish
      return state.customQuestions.length
        ? { ...state, stage: 'custom', customIndex: 0 }
        : { ...state, stage: 'wish' };
    case 'NEXT_CUSTOM':
      return state.customIndex + 1 < state.customQuestions.length
        ? { ...state, customIndex: state.customIndex + 1 }
        : { ...state, stage: 'wish' };
    case 'SET_WISH':
      return { ...state, wish: action.wish };
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.config } };
    case 'RESET_CONFIG':
      return { ...state, config: { ...DEFAULT_CONFIG } };
    case 'RESTART':
      // back to the splash screen; favorites and config are kept
      return { ...initialState(), favorites: state.favorites, config: state.config, customQuestions: state.customQuestions };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => writeJSON(FAVORITES_KEY, state.favorites), [state.favorites]);
  useEffect(() => writeJSON(CONFIG_KEY, state.config), [state.config]);
  useEffect(() => writeJSON(QUESTIONS_KEY, state.customQuestions), [state.customQuestions]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

// ---- Convenience selectors / actions -------------------------------------

export function useProgress() {
  const { state, dispatch } = useApp();
  const { completed, progressFlash } = state;
  const total = TOTAL_QUESTIONS + state.customQuestions.length;
  return {
    completed: completed.length,
    total,
    remaining: total - completed.length,
    percent: Math.round((completed.length / total) * 100),
    flash: progressFlash,
    complete: (id) => dispatch({ type: 'COMPLETE_QUESTION', id }),
    setFlash: (on) => dispatch({ type: 'FLASH_PROGRESS', on }),
  };
}

export function useFavorites() {
  const { state, dispatch } = useApp();
  return {
    favorites: state.favorites,
    isFavorite: (id) => state.favorites.includes(id),
    toggle: (id) => dispatch({ type: 'TOGGLE_FAVORITE', id }),
  };
}

export function useNavigate() {
  const { dispatch } = useApp();
  return (stage) => dispatch({ type: 'NAVIGATE', stage });
}

export const useConfig = () => useApp().state.config;
