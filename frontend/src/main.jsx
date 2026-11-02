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
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#ef4444', fontSize: '22px', marginBottom: '12px' }}>
            ⚠️ Subway Surfers Engine Error
          </h1>
          <p style={{ color: '#e2e8f0', marginBottom: '16px' }}>
            {this.state.error?.message || String(this.state.error)}
          </p>
          <pre style={{
            background: '#1e293b',
            color: '#cbd5e1',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.stack}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              background: '#06b6d4',
              color: '#0f172a',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Clear Local Storage &amp; Reload
          </button>
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
