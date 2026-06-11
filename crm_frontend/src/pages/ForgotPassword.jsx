import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If the account exists, a reset link has been sent.');
      setStatus('success');
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Unexpected error');
      setStatus('error');
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {status === 'success' ? (
        <p className="success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
          </button>
          {status === 'error' && <p className="error">{message}</p>}
        </form>
      )}
    </div>
  );
}
