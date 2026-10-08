import { useState } from 'react';
import { Database, ListPlus, Settings, X } from 'lucide-react';
import { useApp } from '../store/AppStore.jsx';
import QuestionsDashboard from './QuestionsDashboard.jsx';

const inputClass =
  'w-full bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#1CB0F6]';
const labelClass = 'block text-xs font-bold text-gray-500 uppercase mb-1';

function readAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Hidden unless the page is opened with ?admin=true
export default function AdminPanel() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [dashboard, setDashboard] = useState(false);
  const [form, setForm] = useState(state.config);

  if (!window.location.search.includes('admin=true')) return null;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const upload = (key) => async (e) => {
    const file = e.target.files[0];
    if (file) set(key)(await readAsDataURL(file));
  };

  const toggle = () => {
    setForm(state.config);
    setOpen((o) => !o);
  };

  const save = () => {
    const next = {
      faceUrl: form.faceUrl.trim() || state.config.faceUrl,
      brilliantMediaUrl: form.brilliantMediaUrl.trim(),
      cloudApiUrl: form.cloudApiUrl.trim(),
    };
    dispatch({ type: 'SET_CONFIG', config: next });
    setOpen(false);
    if (next.cloudApiUrl) {
      fetch(next.cloudApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(() => {});
    }
  };

  const reset = () => {
    dispatch({ type: 'RESET_CONFIG' });
    setOpen(false);
  };

  return (
    <>
      <div className="fixed top-2 right-2 z-[100] flex gap-2">
        <button
          onClick={() => setDashboard(true)}
          className="bg-gray-900 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-lg border border-gray-700 flex items-center gap-1"
        >
          <ListPlus className="w-4 h-4 text-yellow-400" /> Questions
        </button>
        <button
          onClick={toggle}
          className="bg-gray-900 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-lg border border-gray-700 flex items-center gap-1"
        >
          <Settings className="w-4 h-4 text-yellow-400" /> Admin Settings
        </button>
      </div>

      {dashboard && <QuestionsDashboard onClose={() => setDashboard(false)} />}

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1CB0F6]" /> Cloud &amp; Media Config
              </h3>
              <button onClick={toggle} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div>
              <label className={labelClass}>Ryan&apos;s Face Image URL</label>
              <input
                type="text"
                className={inputClass}
                placeholder="https://... or upload below"
                value={form.faceUrl}
                onChange={(e) => set('faceUrl')(e.target.value)}
              />
              <input type="file" accept="image/*" className="mt-2 text-xs text-gray-500 w-full" onChange={upload('faceUrl')} />
            </div>

            <div>
              <label className={labelClass}>&quot;Brilliant!&quot; Animation Media (Video / GIF / Image URL)</label>
              <input
                type="text"
                className={inputClass}
                placeholder="URL for Brilliant media"
                value={form.brilliantMediaUrl}
                onChange={(e) => set('brilliantMediaUrl')(e.target.value)}
              />
              <input
                type="file"
                accept="image/*,video/*"
                className="mt-2 text-xs text-gray-500 w-full"
                onChange={upload('brilliantMediaUrl')}
              />
            </div>

            <div>
              <label className={labelClass}>Cloud / Database API Endpoint (Optional)</label>
              <input
                type="text"
                className={inputClass}
                placeholder="https://api.myjson.com/or-firebase..."
                value={form.cloudApiUrl}
                onChange={(e) => set('cloudApiUrl')(e.target.value)}
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button onClick={save} className="btn-green flex-1 py-3 rounded-xl font-black text-sm uppercase">
                Save &amp; Sync
              </button>
              <button onClick={reset} className="bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl text-sm">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
