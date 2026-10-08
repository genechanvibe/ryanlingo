import { Check, X } from 'lucide-react';
import { ActionButton } from './Buttons.jsx';

const THEME = {
  success: {
    sheet: 'bg-[#D7FFB8] border-[#B8F28B]',
    title: 'text-[#58A700]',
    badge: 'bg-[#58A700]',
    body: 'text-[#468202]',
    button: 'green',
    Icon: Check,
  },
  wrong: {
    sheet: 'bg-[#FFDFE0] border-[#FFC1C1]',
    title: 'text-[#EA2B2B]',
    badge: 'bg-[#EA2B2B]',
    body: 'text-[#EA2B2B]',
    button: 'red',
    Icon: X,
  },
};

// Bottom feedback sheet. `explanation` renders under an "Explanation:" label, `message` as plain text.
export function Banner({ type, title, message, explanation, onContinue }) {
  const t = THEME[type];
  return (
    <div className={`fixed bottom-0 left-0 right-0 border-t-2 p-6 slide-up z-50 ${t.sheet}`}>
      <div className="max-w-md mx-auto">
        <div className={`flex items-center gap-3 mb-3 ${t.title}`}>
          <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black ${t.badge}`}>
            <t.Icon className="w-5 h-5" strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-black">{title}</h3>
        </div>

        {explanation && (
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-wider mb-1 text-[#58A700]">Explanation:</p>
            <p className={`text-base font-bold leading-snug ${t.body}`}>{explanation}</p>
          </div>
        )}
        {message && <p className={`text-base font-extrabold mb-6 ${t.body}`}>{message}</p>}

        <ActionButton variant={t.button} onClick={onContinue}>
          Continue
        </ActionButton>
      </div>
    </div>
  );
}

export const WrongBanner = ({ onContinue, title = "Oops, that's not correct", message = 'Give it another try.' }) => (
  <Banner type="wrong" title={title} message={message} onContinue={onContinue} />
);
