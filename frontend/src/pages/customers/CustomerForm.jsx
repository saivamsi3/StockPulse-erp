import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, getCustomer, updateCustomer } from '../../api/customers';
import Alert from '../../components/Alert';
import Spinner from '../../components/Spinner';

const emptyForm = {
  name: '',
  mobile: '',
  email: '',
  business_name: '',
  gst_number: '',
  customer_type: '',
  address: '',
  status: 'Lead',
  follow_up_date: '',
  notes: '',
};

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getCustomer(id)
      .then((res) => {
        const c = res.data;
        setForm({
          name: c.name,
          mobile: c.mobile || '',
          email: c.email || '',
          business_name: c.business_name || '',
          gst_number: c.gst_number || '',
          customer_type: c.customer_type || '',
          address: c.address || '',
          status: c.status,
          follow_up_date: c.follow_up_date ? c.follow_up_date.slice(0, 10) : '',
          notes: c.notes || '',
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
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') payload[k] = null;
      });
      if (isEdit) await updateCustomer(id, payload);
      else await createCustomer(payload);
      navigate('/customers');
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
          <h1>{isEdit ? 'Edit customer' : 'Add customer'}</h1>
        </div>
      </header>

      <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

      <form className="card form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer name *</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input value={form.mobile} onChange={(e) => setField('mobile', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Business name</label>
            <input value={form.business_name} onChange={(e) => setField('business_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>GST number</label>
            <input value={form.gst_number} onChange={(e) => setField('gst_number', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Customer type</label>
            <select value={form.customer_type} onChange={(e) => setField('customer_type', e.target.value)}>
              <option value="">—</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Follow-up date</label>
            <input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setField('follow_up_date', e.target.value)}
            />
          </div>
          <div className="form-group form-group-wide">
            <label>Address</label>
            <textarea value={form.address} onChange={(e) => setField('address', e.target.value)} rows="2" />
          </div>
          <div className="form-group form-group-wide">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows="3" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate('/customers')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
