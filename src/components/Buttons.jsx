const BASE = 'w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all';
const VARIANTS = { green: 'btn-green', red: 'btn-red', disabled: 'btn-disabled' };

// Primary action button. `variant="disabled"` also sets the native disabled attribute.
export function ActionButton({ variant = 'green', className = '', children, ...props }) {
  return (
    <button
      disabled={variant === 'disabled'}
      className={`${VARIANTS[variant]} ${BASE} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// "Check" button that is greyed out until `enabled`.
export function CheckButton({ enabled, onClick, children = 'Check' }) {
  return (
    <div className="pt-4 pb-6">
      <ActionButton variant={enabled ? 'green' : 'disabled'} onClick={onClick}>
        {children}
      </ActionButton>
    </div>
  );
}
