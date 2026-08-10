import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../../api/products';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  unit_price: '',
  current_stock: '',
  min_stock_alert: '',
  location: '',
  is_active: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          sku: p.sku,
          category: p.category || '',
          unit_price: p.unit_price,
          current_stock: p.current_stock,
          min_stock_alert: p.min_stock_alert,
          location: p.location || '',
          is_active: p.is_active,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      ['category', 'location'].forEach((k) => {
        if (payload[k] === '') payload[k] = null;
      });
      if (!isEdit) {
        payload.unit_price = Number(payload.unit_price || 0);
        payload.current_stock = Number(payload.current_stock || 0);
        payload.min_stock_alert = Number(payload.min_stock_alert || 0);
        await createProduct(payload);
      } else {
        await updateProduct(id, {
          name: payload.name,
          category: payload.category,
          unit_price: Number(payload.unit_price || 0),
          min_stock_alert: Number(payload.min_stock_alert || 0),
          location: payload.location,
          is_active: payload.is_active,
        });
      }
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="center-page"><Spinner /> Loading...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{isEdit ? 'Edit product' : 'Add product'}</h1>
          <p className="muted">
            {isEdit ? 'Stock is adjusted separately to keep an audit trail.' : 'Opening stock will be logged as an IN movement.'}
          </p>
        </div>
      </header>

      <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

      <form className="card form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Product name *</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>SKU / code *</label>
            <input
              value={form.sku}
              onChange={(e) => setField('sku', e.target.value)}
              disabled={isEdit}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input value={form.category} onChange={(e) => setField('category', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Unit price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.unit_price}
              onChange={(e) => setField('unit_price', e.target.value)}
            />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label>Opening stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.current_stock}
                onChange={(e) => setField('current_stock', e.target.value)}
              />
            </div>
          )}
          <div className="form-group">
            <label>Min stock alert</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.min_stock_alert}
              onChange={(e) => setField('min_stock_alert', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Location / warehouse</label>
            <input value={form.location} onChange={(e) => setField('location', e.target.value)} />
          </div>
          {isEdit && (
            <div className="form-group">
              <label>Active</label>
              <select
                value={form.is_active}
                onChange={(e) => setField('is_active', e.target.value === 'true')}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
}
