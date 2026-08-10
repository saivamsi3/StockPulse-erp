import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listCustomers } from '../../api/customers';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const typeFilters = ['', 'Retail', 'Wholesale', 'Distributor'];
const statusFilters = ['', 'Lead', 'Active', 'Inactive'];

export default function CustomerList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(params.get('page') || 1);
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const customerType = params.get('customer_type') || '';

  useEffect(() => {
    setLoading(true);
    setError(null);
    listCustomers({ page, search, status, customer_type: customerType })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, status, customerType]);

  function updateParams(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    p.set('page', '1');
    setParams(p);
  }

  const canWrite = user?.role === 'Admin' || user?.role === 'Sales';

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="muted">{data ? `${data.pagination.total} customers` : ' '}</p>
        </div>
        {canWrite && (
          <Link to="/customers/new" className="btn btn-primary">+ Add customer</Link>
        )}
      </header>

      <div className="filters">
        <input
          className="input search-input"
          placeholder="Search name, mobile, email, business..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
        />
        <select
          className="input"
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
        >
          {statusFilters.map((s) => (
            <option key={s || 'all-status'} value={s}>{s || 'All statuses'}</option>
          ))}
        </select>
        <select
          className="input"
          value={customerType}
          onChange={(e) => updateParams({ customer_type: e.target.value })}
        >
          {typeFilters.map((t) => (
            <option key={t || 'all-type'} value={t}>{t || 'All types'}</option>
          ))}
        </select>
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
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No customers found.</td></tr>
                )}
                {data.data.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/customers/${c.id}`} className="table-link">{c.name}</Link></td>
                    <td>{c.business_name || '—'}</td>
                    <td>{c.mobile || '—'}</td>
                    <td>{c.customer_type || '—'}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString() : '—'}</td>
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
