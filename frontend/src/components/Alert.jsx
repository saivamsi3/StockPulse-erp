import { useEffect } from 'react';

export default function Alert({ kind = 'error', children, onDismiss }) {
  useEffect(() => {
    if (!children || !onDismiss) return;
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [children, onDismiss]);

  if (!children) return null;
  return (
    <div className={`alert alert-${kind}`} role="alert">
      <div className="alert-body">{children}</div>
      {onDismiss && (
        <button className="btn btn-ghost btn-sm" onClick={onDismiss}>×</button>
      )}
    </div>
  );
}
