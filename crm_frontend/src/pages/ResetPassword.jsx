import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const validate = () => {
    if (!newPassword || !confirmPassword) {
      setMessage('Both fields are required.');
      setStatus('error');
      return false;
    }
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters.');
      setStatus('error');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setStatus('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;
    setStatus('loading');
    try {
      const payload = { token, new_password: newPassword };
      const res = await axios.post('http://localhost:8000/reset-password', payload);
      setMessage(res.data.message || 'Password reset successfully.');
      setStatus('success');
      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err?.response?.data?.detail || 'Unexpected error');
      setStatus('error');
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {status === 'success' ? (
        <p className="success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            New Password
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Resetting…' : 'Reset Password'}
          </button>
          {status === 'error' && <p className="error">{message}</p>}
        </form>
      )}
    </div>
  );
}
