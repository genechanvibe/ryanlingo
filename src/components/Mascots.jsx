import { useConfig } from '../store/AppStore.jsx';

const GENE_FACE = "https://placehold.co/150x150/f0f0f0/a0a0a0?text=Gene's+Face";

// Duo-style owl wearing Ryan's face. `className` is applied to the outer container (e.g. scale-125).
export function Owl({ className = '' }) {
  const { faceUrl } = useConfig();
  return (
    <div className={`owl-mascot-container ${className}`}>
      <div className="owl-body">
        <div className="owl-wing-left" />
        <div className="owl-wing-right" />
        <div className="owl-face-slot">
          <img src={faceUrl} alt="Ryan's Face" className="w-full h-full object-cover" />
        </div>
        <div className="owl-beak" />
        <div className="owl-foot-left" />
        <div className="owl-foot-right" />
      </div>
    </div>
  );
}

// Small bear (Gene) shown beside a speech bubble.
export function Bear() {
  return (
    <div className="bear-mascot-container">
      <div className="bear-body">
        <div className="bear-ear-left" />
        <div className="bear-ear-right" />
        <div className="bear-face-slot">
          <img src={GENE_FACE} alt="Gene's Face" className="w-full h-full object-cover" />
        </div>
        <div className="bear-scarf" />
        <div className="bear-arm-left" />
        <div className="bear-arm-right" />
      </div>
    </div>
  );
}

// Big, waving bear for the cheering page.
export function CheerBear() {
  return (
    <div className="cheer-bear-container">
      <div className="cheer-bear-body">
        <div className="cheer-bear-ear-left" />
        <div className="cheer-bear-ear-right" />
        <div className="cheer-bear-face-slot">
          <img src={GENE_FACE} alt="Gene's Face" className="w-full h-full object-cover" />
        </div>
        <div className="cheer-bear-scarf" />
        <div className="cheer-bear-arm-left" />
        <div className="cheer-bear-arm-right" />
      </div>
    </div>
  );
}

export function SpeechBubble({ children, textClass = 'text-lg font-bold text-gray-700 leading-snug' }) {
  return (
    <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm flex-1 mb-2">
      <div className="absolute -left-2.5 bottom-4 w-4 h-4 bg-white border-l-2 border-b-2 border-gray-200 rotate-45" />
      <p className={textClass}>{children}</p>
    </div>
  );
}
