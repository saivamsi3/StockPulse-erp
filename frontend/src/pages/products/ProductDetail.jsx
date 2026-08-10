import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adjustStock, getProduct, listProductMovements } from '../../api/products';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ movement_type: 'IN', quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const canAdjust = user?.role === 'Admin' || user?.role === 'Warehouse';

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getProduct(id), listProductMovements(id)])
      .then(([pRes, mRes]) => {
        setProduct(pRes.data);
        setMovements(mRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdjust(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adjustStock(id, {
        movement_type: adjustForm.movement_type,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });
      setShowAdjust(false);
      const [pRes, mRes] = await Promise.all([getProduct(id), listProductMovements(id)]);
      setProduct(pRes.data);
      setMovements(mRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="center-page"><Spinner /> Loading...</div>;
  }
  if (!product) return <div className="alert alert-error">{error || 'Product not found'}</div>;

  const isLow = product.current_stock <= product.min_stock_alert;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/products" className="back-link">← Back to products</Link>
          <h1>{product.name}</h1>
          <p className="muted">
            {product.sku} · {product.category || 'No category'} · {product.location || 'No location'}
          </p>
        </div>
        <div className="header-actions">
          <Link to={`/products/${id}/edit`} className="btn">Edit</Link>
          {canAdjust && (
            <button className="btn btn-primary" onClick={() => setShowAdjust(true)}>Adjust stock</button>
          )}
        </div>
      </header>

      <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

      {isLow && (
        <div className="alert alert-warning">
          Low stock: current {product.current_stock} is at or below the minimum alert level of {product.min_stock_alert}.
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className={`stat-value ${isLow ? 'text-danger' : ''}`}>{product.current_stock}</div>
          <div className="stat-label">Current stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">₹{Number(product.unit_price).toLocaleString()}</div>
          <div className="stat-label">Unit price</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{product.min_stock_alert}</div>
          <div className="stat-label">Min alert level</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{product.is_active ? 'Active' : 'Inactive'}</div>
          <div className="stat-label">Status</div>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h2>Stock movement history</h2>
        </div>
        {movements.length === 0 ? (
          <p className="muted">No stock movements recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="num">Qty</th>
                  <th>Reason</th>
                  <th>Challan</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                    <td><StatusBadge status={m.movement_type} /></td>
                    <td className="num">
                      {m.movement_type === 'IN' ? '+' : '−'}{m.quantity_changed}
                    </td>
                    <td>{m.reason}</td>
                    <td>
                      {m.challan_number ? (
                        <Link to={`/challans/${m.challan_id}`}>{m.challan_number}</Link>
                      ) : '—'}
                    </td>
                    <td>{m.created_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showAdjust && (
        <Modal
          title={`Adjust stock - ${product.name}`}
          onClose={() => setShowAdjust(false)}
          footer={
            <>
              <button className="btn" onClick={() => setShowAdjust(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdjust} disabled={saving}>
                {saving ? 'Saving...' : 'Apply adjustment'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAdjust} className="form">
            <div className="form-group">
              <label>Movement type</label>
              <select
                value={adjustForm.movement_type}
                onChange={(e) => setAdjustForm((f) => ({ ...f, movement_type: e.target.value }))}
              >
                <option value="IN">IN (add stock)</option>
                <option value="OUT">OUT (remove stock)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="e.g. damaged stock, receiving purchase"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
