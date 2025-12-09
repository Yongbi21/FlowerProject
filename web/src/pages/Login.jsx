import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';
import '../styles/Auth.css';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Try admin login first
            let response;
            try {
                response = await authAPI.adminLogin({ email, password });

                // Admin/Employee login successful
                const { user, token } = response.data;
                onLogin(user, token);
                navigate('/admin/dashboard');
                return;
            } catch (adminError) {
                // If admin login fails, try customer login
                response = await authAPI.login({ email, password });

                // Customer login successful
                const { user, token } = response.data;
                onLogin(user, token);
                navigate('/');
                return;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-image">
                    <div className="auth-overlay"></div>
                    <div className="auth-text">
                        <h3>Welcome to</h3>
                        <h2>Jocery's Flower Shop!</h2>
                        <p>We're so happy to see you again.</p>
                    </div>
                </div>
                <div className="auth-form-container">
                    <h2 className="auth-title">Login</h2>
                    <p className="auth-subtitle">Enter your details to access your account.</p>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="form-floating mb-3">
                            <input
                                type="email"
                                className="form-control"
                                id="floatingInput"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <label htmlFor="floatingInput">Email address</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="floatingPassword"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <label htmlFor="floatingPassword">Password</label>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="rememberMe" />
                                <label className="form-check-label text-muted" htmlFor="rememberMe">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="auth-link small text-nowrap">Forgot Password?</a>
                        </div>

                        <button type="submit" className="btn btn-auth" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
