import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteCustomer, getCustomer, listFollowUps, addFollowUp } from '../../api/customers';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const canWrite = user?.role === 'Admin' || user?.role === 'Sales';

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getCustomer(id), listFollowUps(id)])
      .then(([cRes, fRes]) => {
        setCustomer(cRes.data);
        setFollowUps(fRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete customer '${customer.name}'? This also removes follow-up notes.`)) return;
    try {
      await deleteCustomer(id);
      navigate('/customers');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await addFollowUp(id, note.trim());
      setNote('');
      const res = await listFollowUps(id);
      setFollowUps(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingNote(false);
    }
  }

  if (loading) {
    return <div className="center-page"><Spinner /> Loading...</div>;
  }
  if (!customer) return <div className="alert alert-error">{error || 'Customer not found'}</div>;

  const infoRows = [
    ['Business name', customer.business_name],
    ['Mobile', customer.mobile],
    ['Email', customer.email],
    ['GST number', customer.gst_number],
    ['Customer type', customer.customer_type],
    ['Follow-up date', customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '—'],
    ['Created by', customer.created_by_name],
    ['Created at', new Date(customer.created_at).toLocaleString()],
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/customers" className="back-link">← Back to customers</Link>
          <h1>{customer.name}</h1>
          <p className="muted">
            <StatusBadge status={customer.status} />{' '}
            {customer.customer_type || 'No type'}
          </p>
        </div>
        {canWrite && (
          <div className="header-actions">
            <Link to={`/customers/${id}/edit`} className="btn">Edit</Link>
            <button className="btn btn-danger-outline" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </header>

      <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

      <div className="grid-2">
        <section className="card">
          <h2>Details</h2>
          <dl className="detail-list">
            {infoRows.map(([label, value]) => (
              <div className="detail-row" key={label}>
                <dt>{label}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
            <div className="detail-row">
              <dt>Address</dt>
              <dd>{customer.address || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2>Notes & follow-ups</h2>
          {canWrite && (
            <form className="inline-form" onSubmit={handleAddNote}>
              <input
                className="input"
                placeholder="Add a follow-up note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button className="btn btn-primary" disabled={addingNote || !note.trim()}>
                {addingNote ? 'Adding...' : 'Add'}
              </button>
            </form>
          )}
          {followUps.length === 0 ? (
            <p className="muted">No follow-ups yet.</p>
          ) : (
            <ul className="timeline">
              {followUps.map((f) => (
                <li key={f.id} className="timeline-item">
                  <p className="timeline-note">{f.note}</p>
                  <span className="timeline-meta">
                    {f.created_by_name || 'Unknown'} · {new Date(f.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}


// stockflow
