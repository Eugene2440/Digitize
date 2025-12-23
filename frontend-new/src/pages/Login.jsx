import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>

                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: '700',
                        color: '#000000',
                        marginBottom: '0.5rem'
                    }}>Digital Logbook</h1>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>Welcome back!</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label htmlFor="username" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#000000',
                            marginBottom: '0.5rem'
                        }}>Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = 'none';
                                e.target.style.borderColor = '#000000';
                                e.target.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#000000',
                            marginBottom: '0.5rem'
                        }}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = 'none';
                                e.target.style.borderColor = '#000000';
                                e.target.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            fontFamily: 'inherit',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s, transform 0.1s',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#333333')}
                        onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#000000')}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                }}>
                    <p>Default Admin: <strong>admin</strong> / <strong>admin123</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
