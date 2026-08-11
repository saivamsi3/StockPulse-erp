export default function StatusBadge({ status }) {
  const isSuccess = status === 'Confirmed' || status === 'Active' || status === 'IN';
  const isWarning = status === 'Draft' || status === 'Lead';
  const isDanger = status === 'Cancelled' || status === 'Inactive' || status === 'OUT';

  const cls = isSuccess
    ? 'badge badge-success'
    : isWarning
      ? 'badge badge-warning'
      : isDanger
        ? 'badge badge-danger'
        : 'badge';

  const dotCls = isSuccess
    ? 'dot-pulse dot-success'
    : isWarning
      ? 'dot-pulse dot-warning'
      : isDanger
        ? 'dot-pulse dot-danger'
        : 'dot-pulse';

  return (
    <span className={cls}>
      <span className={dotCls} />
      <span>{status}</span>
    </span>
  );
}
