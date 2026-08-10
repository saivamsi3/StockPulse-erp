import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listProducts } from '../../api/products';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function ProductList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(params.get('page') || 1);
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const lowStock = params.get('lowStock') === 'true';

  useEffect(() => {
    setLoading(true);
    setError(null);
    listProducts({ page, search, category, lowStock: lowStock || undefined })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, category, lowStock]);

  function updateParams(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v === true) p.set('lowStock', 'true');
      else if (v) p.set(k, v);
      else p.delete(k);
    });
    p.set('page', '1');
    setParams(p);
  }

  const canWrite = user?.role === 'Admin' || user?.role === 'Warehouse';

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Products</h1>
          <p className="muted">{data ? `${data.pagination.total} products` : ' '}</p>
        </div>
        {canWrite && <Link to="/products/new" className="btn btn-primary">+ Add product</Link>}
      </header>

      <div className="filters">
        <input
          className="input search-input"
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
        />
        <select
          className="input"
          value={category}
          onChange={(e) => updateParams({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {data && [...new Set(data.data.map((p) => p.category).filter(Boolean))].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="check-label">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => updateParams({ lowStock: e.target.checked })}
          />
          Low stock only
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="center-page"><Spinner /> Loading...</div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th className="num">Price</th>
                  <th className="num">Stock</th>
                  <th className="num">Min alert</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 && (
                  <tr><td colSpan="8" className="empty-cell">No products found.</td></tr>
                )}
                {data.data.map((p) => (
                  <tr key={p.id} className={p.is_low_stock ? 'row-warn' : ''}>
                    <td><Link to={`/products/${p.id}`} className="table-link">{p.name}</Link></td>
                    <td>{p.sku}</td>
                    <td>{p.category || '—'}</td>
                    <td className="num">₹{Number(p.unit_price).toLocaleString()}</td>
                    <td className={`num ${p.is_low_stock ? 'text-danger text-bold' : ''}`}>
                      {p.current_stock} {p.is_low_stock && '⚠'}
                    </td>
                    <td className="num">{p.min_stock_alert}</td>
                    <td>{p.location || '—'}</td>
                    <td>{p.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(p) => {
              const q = new URLSearchParams(params);
              q.set('page', String(p));
              setParams(q);
            }}
          />
        </>
      )}
    </div>
  );
}
