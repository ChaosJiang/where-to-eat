import React from 'react';
import { useTranslation } from 'react-i18next';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();

  return (
    <div className="error-fallback" style={{
      padding: '20px',
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
        {t('error.title', 'Something went wrong')}
      </h2>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        {t('error.message', 'We encountered an unexpected error. Please try again.')}
      </p>
      <details style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#fff', 
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        maxWidth: '500px'
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          {t('error.details', 'Error details')}
        </summary>
        <pre style={{ 
          marginTop: '10px', 
          fontSize: '12px', 
          color: '#495057',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {error.message}
        </pre>
      </details>
      <button
        onClick={resetErrorBoundary}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        {t('error.retry', 'Try again')}
      </button>
    </div>
  );
};

export default ErrorFallback;