import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      localStorage.removeItem('rail_rush_last_error');
    } catch (e) { }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0f1d',
          color: '#f87171',
          padding: '28px',
          overflow: 'auto',
          zIndex: 999999,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
            <h1 style={{ color: '#ef4444', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
              ⚠️ Engine Reload Required
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              The code update has been applied. Click below to reload and jump straight into the run!
            </p>

            <button
              onClick={this.resetError}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '16px',
                letterSpacing: '0.05em',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                marginBottom: '24px'
              }}
            >
              🔄 RELOAD &amp; PLAY NOW
            </button>

            <div style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '12px',
              textAlign: 'left',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              border: '1px solid #334155'
            }}>
              <strong>Error Details:</strong>
              {'\n'}
              {this.state.error?.message || String(this.state.error)}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global window error listener for unhandled script errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global Window Error:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
