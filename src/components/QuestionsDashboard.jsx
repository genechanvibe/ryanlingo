import { useState } from 'react';
import { ArrowDown, ArrowUp, Download, Pencil, Play, Plus, Trash2, Upload, X } from 'lucide-react';
import { useApp } from '../store/AppStore.jsx';
import { QUESTIONS } from '../data/questions.js';

const TYPES = {
  choice: 'Multiple choice',
  pairs: 'Matching pairs',
  words: 'Build the sentence',
  text: 'Free text',
};

const input =
  'w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#1CB0F6] select-text';
const label = 'block text-xs font-bold text-gray-500 uppercase mb-1';
const btn = 'font-extrabold text-sm px-4 py-2 rounded-xl';

const split = (str) => str.split(',').map((w) => w.trim()).filter(Boolean);

const blankForm = (type) => ({
  type,
  prompt: '',
  explanation: '',
  options: ['', ''],
  correct: 0,
  pairs: [{ left: '', right: '' }, { left: '', right: '' }],
  answer: '', // comma separated, in the right order
  extra: '', // comma separated wrong words
});

const toForm = (q) => ({
  ...blankForm(q.type),
  ...q,
  answer: q.answer?.join(', ') ?? '',
  extra: q.extra?.join(', ') ?? '',
});

// Form -> stored question (or an error message)
function build(form, id) {
  const base = { id, type: form.type, explanation: form.explanation.trim() };
  const prompt = form.prompt.trim();

  if (form.type === 'choice') {
    const options = form.options.map((o) => o.trim());
    if (!prompt) return { error: 'Enter the question text.' };
    if (options.length < 2 || options.some((o) => !o)) return { error: 'Fill in every option (at least 2).' };
    if (new Set(options).size !== options.length) return { error: 'Options must be different from each other.' };
    return { q: { ...base, prompt, options, correct: form.correct } };
  }

  if (form.type === 'pairs') {
    const pairs = form.pairs.map((p) => ({ left: p.left.trim(), right: p.right.trim() }));
    if (pairs.length < 2 || pairs.some((p) => !p.left || !p.right)) return { error: 'Fill in every pair (at least 2).' };
    const all = pairs.flatMap((p) => [p.left, p.right]);
    if (new Set(all).size !== all.length) return { error: 'Every tile must be unique across both columns.' };
    return { q: { ...base, prompt: 'Tap the matching pairs', pairs } };
  }

  if (form.type === 'words') {
    const answer = split(form.answer);
    if (!prompt) return { error: 'Enter the sentence start, e.g. "Ryan is a".' };
    if (!answer.length) return { error: 'Enter the correct words, in order, separated by commas.' };
    return { q: { ...base, prompt, answer, extra: split(form.extra) } };
  }

  if (!prompt) return { error: 'Enter the question text.' };
  return { q: { ...base, prompt } };
}

function Form({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setAt = (key, i, value) => set({ [key]: form[key].map((v, idx) => (idx === i ? value : v)) });

  const save = () => {
    const { q, error: err } = build(form, initial.id ?? `c_${Date.now()}`);
    if (err) return setError(err);
    onSave(q);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-4">
      <div>
        <label className={label}>Type</label>
        <select
          className={input}
          value={form.type}
          disabled={!!initial.id}
          onChange={(e) => setForm(blankForm(e.target.value))}
        >
          {Object.entries(TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {initial.id && <p className="text-xs text-gray-400 mt-1">Type can&apos;t change when editing.</p>}
      </div>

      {form.type !== 'pairs' && (
        <div>
          <label className={label}>{form.type === 'words' ? 'Sentence start' : 'Question'}</label>
          <input className={input} value={form.prompt} onChange={(e) => set({ prompt: e.target.value })} />
        </div>
      )}

      {form.type === 'choice' && (
        <div>
          <label className={label}>Options (select the correct one)</label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" checked={form.correct === i} onChange={() => set({ correct: i })} />
                <input className={input} value={opt} onChange={(e) => setAt('options', i, e.target.value)} />
                {form.options.length > 2 && (
                  <button
                    onClick={() =>
                      set({
                        options: form.options.filter((_, idx) => idx !== i),
                        correct: form.correct === i ? 0 : form.correct > i ? form.correct - 1 : form.correct,
                      })
                    }
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Remove option"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.options.length < 5 && (
            <button onClick={() => set({ options: [...form.options, ''] })} className="mt-2 text-sm font-bold text-[#1CB0F6]">
              + Add option
            </button>
          )}
        </div>
      )}

      {form.type === 'pairs' && (
        <div>
          <label className={label}>Pairs (left ↔ right)</label>
          <div className="space-y-2">
            {form.pairs.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={input}
                  placeholder="Left"
                  value={p.left}
                  onChange={(e) => set({ pairs: form.pairs.map((x, idx) => (idx === i ? { ...x, left: e.target.value } : x)) })}
                />
                <input
                  className={input}
                  placeholder="Right"
                  value={p.right}
                  onChange={(e) => set({ pairs: form.pairs.map((x, idx) => (idx === i ? { ...x, right: e.target.value } : x)) })}
                />
                {form.pairs.length > 2 && (
                  <button
                    onClick={() => set({ pairs: form.pairs.filter((_, idx) => idx !== i) })}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Remove pair"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.pairs.length < 6 && (
            <button onClick={() => set({ pairs: [...form.pairs, { left: '', right: '' }] })} className="mt-2 text-sm font-bold text-[#1CB0F6]">
              + Add pair
            </button>
          )}
        </div>
      )}

      {form.type === 'words' && (
        <>
          <div>
            <label className={label}>Correct words, in order (comma separated)</label>
            <input className={input} placeholder="Evil, Pervert, Puppy" value={form.answer} onChange={(e) => set({ answer: e.target.value })} />
          </div>
          <div>
            <label className={label}>Extra wrong words (comma separated, optional)</label>
            <input className={input} placeholder="Lamb, Wolf, Fox" value={form.extra} onChange={(e) => set({ extra: e.target.value })} />
          </div>
        </>
      )}

      {form.type !== 'text' && (
        <div>
          <label className={label}>Explanation shown when correct (optional)</label>
          <input className={input} value={form.explanation} onChange={(e) => set({ explanation: e.target.value })} />
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <div className="flex gap-2">
        <button onClick={save} className={`${btn} bg-[#58CC02] text-white`}>Save question</button>
        <button onClick={onCancel} className={`${btn} bg-gray-200 text-gray-700`}>Cancel</button>
      </div>
    </div>
  );
}

const summary = (q) => (q.type === 'pairs' ? q.pairs.map((p) => `${p.left}↔${p.right}`).join(', ') : q.prompt);

export default function QuestionsDashboard({ onClose }) {
  const { state, dispatch } = useApp();
  const questions = state.customQuestions;
  const [editing, setEditing] = useState(null); // null | form (new or existing)
  const [importError, setImportError] = useState('');

  const save = (next) => dispatch({ type: 'SET_CUSTOM_QUESTIONS', questions: next });

  const saveForm = (q) => {
    const exists = questions.some((x) => x.id === q.id);
    save(exists ? questions.map((x) => (x.id === q.id ? q : x)) : [...questions, q]);
    setEditing(null);
  };

  const move = (i, dir) => {
    const next = questions.slice();
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    save(next);
  };

  const remove = (q) => {
    if (window.confirm(`Delete "${summary(q)}"?`)) save(questions.filter((x) => x.id !== q.id));
  };

  const exportJSON = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'customQuestions.json' });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || data.some((q) => !q.id || !q.type)) throw new Error();
      save(data);
      setImportError('');
    } catch {
      setImportError('That file is not a valid questions export.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-gray-50 overflow-y-auto text-gray-800 select-text">
      <div className="max-w-2xl mx-auto p-5 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-black">Questions dashboard</h2>
          <div className="flex gap-2">
            <button onClick={exportJSON} className={`${btn} bg-white border-2 border-gray-200 flex items-center gap-1`}>
              <Download className="w-4 h-4" /> Export
            </button>
            <label className={`${btn} bg-white border-2 border-gray-200 flex items-center gap-1 cursor-pointer`}>
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept="application/json" className="hidden" onChange={importJSON} />
            </label>
            <button onClick={onClose} className={`${btn} bg-gray-900 text-white`}>Close</button>
          </div>
        </div>
        {importError && <p className="text-red-500 text-sm font-bold">{importError}</p>}

        <p className="text-sm text-gray-500 font-semibold">
          Your questions play after the built-in ones and before the birthday wish. They are saved in this browser
          only — use Export to back them up or move them to another device (Import there).
        </p>

        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase text-gray-500">Your questions ({questions.length})</h3>
          {questions.length === 0 && <p className="text-gray-400 font-bold">None yet.</p>}
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl border-2 border-gray-200 p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase bg-[#DDF4FF] text-[#1CB0F6] rounded-md px-2 py-0.5">
                  {TYPES[q.type] ?? q.type}
                </span>
                <p className="font-bold mt-1 break-words">{summary(q)}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <button disabled={i === 0} onClick={() => move(i, -1)} className="p-1 disabled:opacity-30" aria-label="Move up"><ArrowUp className="w-5 h-5" /></button>
                <button disabled={i === questions.length - 1} onClick={() => move(i, 1)} className="p-1 disabled:opacity-30" aria-label="Move down"><ArrowDown className="w-5 h-5" /></button>
                <button onClick={() => { onClose(); dispatch({ type: 'PREVIEW_CUSTOM', index: i }); }} className="p-1 text-[#58CC02]" aria-label="Preview"><Play className="w-5 h-5" /></button>
                <button onClick={() => setEditing(toForm(q))} className="p-1" aria-label="Edit"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => remove(q)} className="p-1 hover:text-red-500" aria-label="Delete"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}

          {editing ? (
            <Form key={editing.id ?? 'new'} initial={editing} onSave={saveForm} onCancel={() => setEditing(null)} />
          ) : (
            <button onClick={() => setEditing(blankForm('choice'))} className={`${btn} bg-[#1CB0F6] text-white flex items-center gap-1`}>
              <Plus className="w-4 h-4" /> Add question
            </button>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase text-gray-500">Built-in questions (read-only)</h3>
          {QUESTIONS.map((q, i) => (
            <p key={q.id} className="text-sm font-semibold text-gray-500">{i + 1}. {q.title}</p>
          ))}
        </section>
      </div>
    </div>
  );
}
