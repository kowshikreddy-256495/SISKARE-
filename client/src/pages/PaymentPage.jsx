import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCreditCard, HiOutlineArrowDownTray, HiOutlineCheckCircle } from 'react-icons/hi2';

const FEE_TYPES = [
  { type: 'semester_fee', label: 'Semester Fee', amount: 45000, icon: '📚', color: '#4f46e5', desc: 'Tuition fee for current semester' },
  { type: 'hostel_fee', label: 'Hostel Fee', amount: 30000, icon: '🏠', color: '#7c3aed', desc: 'Hostel accommodation charges' },
  { type: 'exam_fee', label: 'Examination Fee', amount: 5000, icon: '📝', color: '#06b6d4', desc: 'Semester examination charges' },
  { type: 'library_fee', label: 'Library Fee', amount: 2000, icon: '📖', color: '#10b981', desc: 'Library and resources access' },
];

export default function PaymentPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/payments/history');
        setPayments(res.data.payments || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handlePayment = async (feeType) => {
    setPaying(feeType.type);
    try {
      const res = await api.post('/payments/create-order', {
        type: feeType.type, amount: feeType.amount, description: feeType.label
      });
      const { order } = res.data;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'University of Technology',
        description: feeType.label,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', response);
            toast.success('Payment successful!');
            const r = await api.get('/payments/history');
            setPayments(r.data.payments || []);
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#4f46e5' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Razorpay SDK not loaded. Add the script to index.html');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create order');
    } finally { setPaying(null); }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const res = await api.get(`/payments/receipt/${paymentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `receipt_${paymentId}.pdf`; a.click();
      toast.success('Receipt downloaded!');
    } catch { toast.error('Failed to download receipt'); }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Fee Payments</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Pay your university fees securely via Razorpay</p>

      {/* Fee Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 36 }}>
        {FEE_TYPES.map(f => {
          const paid = payments.some(p => p.type === f.type && p.status === 'completed');
          return (
            <div key={f.type} className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: f.color, opacity: 0.08 }} />
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{f.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{f.desc}</p>
              <p style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: f.color }}>₹{f.amount.toLocaleString()}</p>
              {paid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 600, fontSize: 14 }}>
                  <HiOutlineCheckCircle size={20} /> Paid
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', background: `linear-gradient(135deg, ${f.color}, ${f.color}cc)` }}
                  onClick={() => handlePayment(f)} disabled={paying === f.type}>
                  <HiOutlineCreditCard /> {paying === f.type ? 'Processing...' : 'Pay Now'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment History */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Payment History</h3>
        {payments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payments yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{p.type.replace('_', ' ')}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(p.amount).toLocaleString()}</td>
                    <td><span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>{p.status}</span></td>
                    <td>
                      {p.status === 'completed' && (
                        <button onClick={() => downloadReceipt(p.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                          <HiOutlineArrowDownTray /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
