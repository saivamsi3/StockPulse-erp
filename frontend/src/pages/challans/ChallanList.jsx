import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listChallans } from '../../api/challans';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const statusFilters = ['', 'Draft', 'Confirmed', 'Cancelled'];

export default function ChallanList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(params.get('page') || 1);
  const search = params.get('search') || '';
  const status = params.get('status') || '';

  useEffect(() => {
    setLoading(true);
    setError(null);
    listChallans({ page, search, status })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  function updateParams(next) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    p.set('page', '1');
    setParams(p);
  }

  const canCreate = user?.role === 'Admin' || user?.role === 'Sales';

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Sales Challans</h1>
          <p className="muted">{data ? `${data.pagination.total} challans` : ' '}</p>
        </div>
        {canCreate && <Link to="/challans/new" className="btn btn-primary">+ New challan</Link>}
      </header>

      <div className="filters">
        <input
          className="input search-input"
          placeholder="Search challan # or customer..."
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
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th className="num">Total qty</th>
                  <th>Status</th>
                  <th>Created by</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No challans found.</td></tr>
                )}
                {data.data.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/challans/${c.id}`} className="table-link">{c.challan_number}</Link></td>
                    <td>{c.customer_name}</td>
                    <td className="num">{c.total_quantity}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.created_by_name || '—'}</td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
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
