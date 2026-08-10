export default function StatusBadge({ status }) {
  const cls =
    status === 'Confirmed' || status === 'Active' || status === 'IN'
      ? 'badge badge-success'
      : status === 'Draft' || status === 'Lead'
        ? 'badge badge-warning'
        : status === 'Cancelled' || status === 'Inactive' || status === 'OUT'
          ? 'badge badge-danger'
          : 'badge';
  return <span className={cls}>{status}</span>;
}
