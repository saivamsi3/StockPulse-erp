import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listCustomers } from '../api/customers';
import { listProducts } from '../api/products';
import { listChallans } from '../api/challans';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      listCustomers({ limit: 1 }),
      listProducts({ limit: 1 }),
      listChallans({ limit: 1 }),
      listProducts({ lowStock: true, limit: 5 }),
      listChallans({ status: 'Draft', limit: 5 }),
    ])
      .then(([cust, prod, chl, lowStock, drafts]) =>
        setData({
          customers: cust.pagination.total,
          products: prod.pagination.total,
          challans: chl.pagination.total,
          lowStock: lowStock.data,
          drafts: drafts.data,
        })
      )
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) {
    return (
      <div className="center-page">
        <Spinner /> Loading...
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Operations Dashboard</h1>
          <p className="muted">Welcome back, {user.name} &bull; System Role: <strong style={{ color: '#4f46e5' }}>{user.role}</strong></p>
        </div>
        <div className="header-actions">
          <Link to="/challans/new" className="btn btn-primary">
            + New Delivery Challan
          </Link>
        </div>
      </header>

      <div className="stat-grid">
        <Link to="/customers" className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Customers</span>
            <div className="stat-icon-wrap icon-cyan">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div className="stat-value">{data.customers}</div>
          <span className="stat-trend trend-up">Active Accounts</span>
        </Link>

        <Link to="/products" className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon-wrap icon-indigo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
          </div>
          <div className="stat-value">{data.products}</div>
          <span className="stat-trend trend-up">Catalog Inventory</span>
        </Link>

        <Link to="/challans" className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Challans</span>
            <div className="stat-icon-wrap icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div className="stat-value">{data.challans}</div>
          <span className="stat-trend trend-up">Issued Operations</span>
        </Link>

        <Link to="/products?lowStock=true" className="stat-card stat-card-warn">
          <div className="stat-card-header">
            <span className="stat-label">Low Stock Alerts</span>
            <div className="stat-icon-wrap icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div className="stat-value text-danger">{data.lowStock.length}</div>
          <span className="stat-trend trend-warn">Action Required</span>
        </Link>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <h2>Low stock alerts</h2>
            <Link to="/products?lowStock=true" className="btn btn-sm btn-outline">View all</Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="muted">All products are above their minimum stock levels.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th className="num">Stock</th>
                    <th className="num">Min</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStock.map((p) => (
                    <tr key={p.id}>
                      <td><Link to={`/products/${p.id}`} className="table-link">{p.name}</Link></td>
                      <td><code>{p.sku}</code></td>
                      <td className="num text-danger text-bold">{p.current_stock}</td>
                      <td className="num">{p.min_stock_alert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Open drafts</h2>
            <Link to="/challans?status=Draft" className="btn btn-sm btn-outline">View all</Link>
          </div>
          {data.drafts.length === 0 ? (
            <p className="muted">No draft challans.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.drafts.map((c) => (
                    <tr key={c.id}>
                      <td><Link to={`/challans/${c.id}`} className="table-link">{c.challan_number}</Link></td>
                      <td>{c.customer_name}</td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
