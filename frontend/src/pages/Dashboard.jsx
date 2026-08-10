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
          <h1>Dashboard</h1>
          <p className="muted">Welcome back, {user.name} ({user.role})</p>
        </div>
      </header>

      <div className="stat-grid">
        <Link to="/customers" className="stat-card">
          <div className="stat-value">{data.customers}</div>
          <div className="stat-label">Customers</div>
        </Link>
        <Link to="/products" className="stat-card">
          <div className="stat-value">{data.products}</div>
          <div className="stat-label">Products</div>
        </Link>
        <Link to="/challans" className="stat-card">
          <div className="stat-value">{data.challans}</div>
          <div className="stat-label">Challans</div>
        </Link>
        <Link to="/products?lowStock=true" className="stat-card stat-card-warn">
          <div className="stat-value">{data.lowStock.length}</div>
          <div className="stat-label">Low stock items</div>
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
                    <td><Link to={`/products/${p.id}`}>{p.name}</Link></td>
                    <td>{p.sku}</td>
                    <td className="num text-danger">{p.current_stock}</td>
                    <td className="num">{p.min_stock_alert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <td><Link to={`/challans/${c.id}`}>{c.challan_number}</Link></td>
                    <td>{c.customer_name}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
