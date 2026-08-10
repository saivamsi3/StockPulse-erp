import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCustomers } from '../../api/customers';
import { listProducts } from '../../api/products';
import { createChallan } from '../../api/challans';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

export default function ChallanForm() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([]);
  const [notes, setNotes] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      listCustomers({ limit: 100, search: customerSearch }),
      listProducts({ limit: 100, search: productSearch }),
    ])
      .then(([cRes, pRes]) => {
        setCustomers(cRes.data);
        setProducts(pRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [customerSearch, productSearch]);

  const filteredProducts = useMemo(
    () => products.filter((p) => !lines.some((l) => l.product_id === p.id)),
    [products, lines]
  );

  function addProduct(product) {
    if (lines.some((l) => l.product_id === product.id)) return;
    setLines((ls) => [...ls, { product_id: product.id, product, quantity: 1 }]);
    setShowProductPicker(false);
  }

  function updateQuantity(productId, quantity) {
    setLines((ls) =>
      ls.map((l) =>
        l.product_id === productId ? { ...l, quantity: Math.max(1, Number(quantity) || 1) } : l
      )
    );
  }

  function removeLine(productId) {
    setLines((ls) => ls.filter((l) => l.product_id !== productId));
  }

  const totalQuantity = lines.reduce((s, l) => s + l.quantity, 0);

  async function handleSaveDraft(e) {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    if (lines.length === 0) {
      setError('Add at least one product.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await createChallan({
        customer_id: Number(customerId),
        notes: notes || null,
        items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
      });
      navigate(`/challans/${res.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>New sales challan</h1>
          <p className="muted">Saved as Draft. Stock is only deducted when you confirm.</p>
        </div>
      </header>

      <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

      {loading ? (
        <div className="center-page"><Spinner /> Loading...</div>
      ) : (
        <form className="card form" onSubmit={handleSaveDraft}>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer *</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.business_name ? ` (${c.business_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Customer search</label>
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Filter customer list..."
              />
            </div>
          </div>

          <section className="challan-lines">
            <div className="card-header">
              <h2>Products</h2>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowProductPicker((v) => !v)}
              >
                {showProductPicker ? 'Hide picker' : '+ Add product'}
              </button>
            </div>

            {showProductPicker && (
              <div className="product-picker">
                <input
                  className="input"
                  placeholder="Search products to add..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  autoFocus
                />
                <div className="product-picker-list">
                  {filteredProducts.length === 0 && (
                    <div className="muted">No matching products.</div>
                  )}
                  {filteredProducts.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      className="product-pick-item"
                      disabled={!p.is_active}
                      onClick={() => addProduct(p)}
                    >
                      <div>
                        <div className="product-pick-name">{p.name}</div>
                        <div className="product-pick-meta">{p.sku} · {p.category || '—'}</div>
                      </div>
                      <div className="product-pick-stock">
                        <div className="num">₹{Number(p.unit_price).toLocaleString()}</div>
                        <div className={`num ${p.current_stock <= p.min_stock_alert ? 'text-danger' : ''}`}>
                          Stock: {p.current_stock}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lines.length === 0 ? (
              <p className="muted">No products added yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th className="num">Unit price</th>
                      <th className="num">Qty</th>
                      <th className="num">Line total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={l.product_id}>
                        <td>{l.product.name}</td>
                        <td>{l.product.sku}</td>
                        <td className="num">₹{Number(l.product.unit_price).toLocaleString()}</td>
                        <td className="num" style={{ width: 110 }}>
                          <input
                            type="number"
                            min="1"
                            className="input input-sm"
                            value={l.quantity}
                            onChange={(e) => updateQuantity(l.product_id, e.target.value)}
                          />
                        </td>
                        <td className="num">
                          ₹{(Number(l.product.unit_price) * l.quantity).toLocaleString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => removeLine(l.product_id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="num text-bold">Total quantity</td>
                      <td className="num text-bold">{totalQuantity}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navigate('/challans')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
