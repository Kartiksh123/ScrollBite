import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { api } from '../../utils/api';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../utils/apiError';

const FoodPartnerLogin = () => {

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    setError(''); setSubmitting(true);
    try {
      await api.post("/api/auth/food-partner/login", { email, password });
      navigate("/create-food");
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Unable to sign in. Check your email and password.')); }
    finally { setSubmitting(false); }

  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-login-title">
        <header>
          <h1 id="partner-login-title" className="auth-title">Partner login</h1>
          <p className="auth-subtitle">Access your dashboard and manage orders.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="auth-alt-action">
          New partner? <Link to="/food-partner/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;

