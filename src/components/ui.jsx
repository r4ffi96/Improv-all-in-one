import { useEffect, useId, useState } from 'react';
import { IconCheck, IconChevron, IconClose } from './Icons.jsx';

export function Card({ children, className = '', ...rest }) {
  return <div className={`card ${className}`} {...rest}>{children}</div>;
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Tag({ children, tone }) {
  return <span className={`tag${tone ? ` tag--${tone}` : ''}`}>{children}</span>;
}

export function TimePill({ children }) {
  return <span className="pill-time">{children}</span>;
}

export function Switch({ checked, onChange, label, hint }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__track"><span className="switch__thumb" /></span>
      <span style={{ minWidth: 0 }}>
        <span className="bold">{label}</span>
        {hint ? <span className="small muted" style={{ display: 'block' }}>{hint}</span> : null}
      </span>
    </label>
  );
}

export function Field({ label, hint, children }) {
  const id = useId();
  return (
    <div className="field">
      {label ? <label className="label" htmlFor={id}>{label}</label> : null}
      {typeof children === 'function' ? children(id) : children}
      {hint ? <span className="tiny faint">{hint}</span> : null}
    </div>
  );
}

export function TextInput({ label, hint, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => <input id={id} className="input" {...rest} />}
    </Field>
  );
}

export function TextArea({ label, hint, rows = 4, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => <textarea id={id} className="textarea" rows={rows} {...rest} />}
    </Field>
  );
}

export function CheckBox({ checked, onChange, ariaLabel }) {
  return (
    <span
      role="checkbox"
      tabIndex={0}
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`pick__box${checked ? ' is-on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          onChange(!checked);
        }
      }}
    >
      {checked ? <IconCheck /> : null}
    </span>
  );
}

export function Disclosure({ title, subtitle, defaultOpen = false, right, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="disclosure">
      <button
        type="button"
        className={`disclosure__btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <IconChevron className="chev" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="bold">{title}</span>
          {subtitle ? <span className="small muted" style={{ display: 'block' }}>{subtitle}</span> : null}
        </span>
        {right}
      </button>
      {open ? <div className="disclosure__body">{children}</div> : null}
    </div>
  );
}

export function Sheet({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__grabber" />
        <div className="row" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sheet__title">{title}</div>
            {subtitle ? <div className="small muted">{subtitle}</div> : null}
          </div>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        {children}
        {footer ? <div style={{ marginTop: 18 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

export function Meter({ value, max, tone = 'accent' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const colors = { accent: 'var(--accent)', good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' };
  return (
    <div className="meter">
      <div className="meter__fill" style={{ width: `${pct}%`, background: colors[tone] || colors.accent }} />
    </div>
  );
}

export function ConfirmButton({ children, onConfirm, className = 'btn btn--danger btn--sm', confirmLabel = 'Sure?' }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const id = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (armed) { onConfirm(); setArmed(false); } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
