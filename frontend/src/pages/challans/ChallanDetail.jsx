import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelChallan, confirmChallan, getChallan } from '../../api/challans';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function ChallanDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null);

  const canConfirm = user?.role === 'Admin' || user?.role === 'Sales' || user?.role === 'Warehouse';
  const canCancel = user?.role === 'Admin' || user?.role === 'Sales';

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getChallan(id);
      setChallan(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleConfirm() {
    if (!window.confirm(`Confirm challan ${challan.challan_number}? Stock will be deducted.`)) return;
    setAction('confirm');
    setError(null);
    try {
      await confirmChallan(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAction(null);
    }
  }

  async function handleCancel() {
    if (!window.confirm(`Cancel challan ${challan.challan_number}? This cannot be undone.`)) return;
    setAction('cancel');
    setError(null);
    try {
      await cancelChallan(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAction(null);
    }
  }

  if (loading) {
    return <div className="center-page"><Spinner /> Loading...</div>;
  }
  if (!challan) return <div className="alert alert-error">{error || 'Challan not found'}</div>;

  const total = challan.items.reduce((s, i) => s + Number(i.line_total), 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/challans" className="back-link">← Back to challans</Link>
          <h1>{challan.challan_number}</h1>
          <p className="muted">
            <StatusBadge status={challan.status} /> · Created {new Date(challan.created_at).toLocaleString()}
          </p>
        </div>
        {challan.status === 'Draft' && (
          <div className="header-actions">
            {canCancel && (
              <button
                className="btn btn-danger-outline"
                onClick={handleCancel}
                disabled={action === 'cancel'}
              >
                {action === 'cancel' ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
            {canConfirm && (
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={action === 'confirm'}
              >
                {action === 'confirm' ? 'Confirming...' : 'Confirm & deduct stock'}
              </button>
            )}
          </div>
        )}
      </header>

      <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

      <div className="grid-2">
        <section className="card">
          <h2>Customer</h2>
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Name</dt>
              <dd>{challan.customer_name}</dd>
            </div>
            <div className="detail-row">
              <dt>Business</dt>
              <dd>{challan.customer_business_name || '—'}</dd>
            </div>
            <div className="detail-row">
              <dt>Mobile</dt>
              <dd>{challan.customer_mobile || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2>Challan info</h2>
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Status</dt>
              <dd><StatusBadge status={challan.status} /></dd>
            </div>
            <div className="detail-row">
              <dt>Total quantity</dt>
              <dd>{challan.total_quantity}</dd>
            </div>
            <div className="detail-row">
              <dt>Created by</dt>
              <dd>{challan.created_by_name || '—'}</dd>
            </div>
            <div className="detail-row">
              <dt>Confirmed by</dt>
              <dd>{challan.confirmed_by_name || '—'}</dd>
            </div>
            <div className="detail-row">
              <dt>Confirmed at</dt>
              <dd>{challan.confirmed_at ? new Date(challan.confirmed_at).toLocaleString() : '—'}</dd>
            </div>
            <div className="detail-row">
              <dt>Notes</dt>
              <dd>{challan.notes || '—'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <h2>Items</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="num">Unit price</th>
                <th className="num">Qty</th>
                <th className="num">Line total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.product_name}
                    <div className="cell-sub">
                      <Link to={`/products/${i.product_id}`}>view product</Link>
                    </div>
                  </td>
                  <td>{i.product_sku}</td>
                  <td className="num">₹{Number(i.unit_price).toLocaleString()}</td>
                  <td className="num">{i.quantity}</td>
                  <td className="num">₹{Number(i.line_total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="num text-bold">Total</td>
                <td className="num text-bold">₹{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="muted note-small">
          Line items store a product snapshot (name, SKU, price at sale time), so the challan is
          correct even if product details change later.
        </p>
      </section>
    </div>
  );
}
