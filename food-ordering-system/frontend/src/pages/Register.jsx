import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Checks the form before sending it (the server checks again)
  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      return 'Please fill in all fields.';
    }
    if (form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters long.';
    if (form.password !== form.confirmPassword) return 'Password and confirm password do not match.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const data = await api('/api/auth/register', { method: 'POST', body: form });
      navigate('/login', { state: { message: data.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="form-box">
        <h2>Sign Up</h2>
        {error && <p className="error-box">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} />
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} />
          <label>Password (at least 6 characters)</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} />
          <label>Confirm password</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
          <button className="btn btn-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="form-note">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;
