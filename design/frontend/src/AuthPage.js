import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AuthPage() {
  const [username, setUsername] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'admin') {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/get_encryption_key');
        const data = await response.json();
        if (data.key) {
          setKey(data.key); // Store the base64 encoded key
        } else {
          alert("Failed to retrieve key.");
        }
      } catch (error) {
        console.error("Error fetching key:", error);
        alert("Server error: Unable to fetch key.");
      } finally {
        setLoading(false);
      }
    } else {
      alert('Invalid username!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(key);
    alert('Encryption key copied to clipboard!');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Authentication</h2>
      <form onSubmit={handleAuth} style={styles.form}>
        <label style={styles.label}>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          style={loading ? styles.loadingButton : styles.authButton}
        >
          {loading ? 'Loading...' : 'Authenticate'}
        </button>
      </form>

      {key && (
        <div style={styles.keyContainer}>
          <h3 style={styles.keyTitle}>🔐 Your Encryption Key:</h3>
          <p style={styles.keyText}>{key}</p>
         
        </div>
      )}

      <Link to="/" style={styles.link}>
        Back to Home
      </Link>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f7f9fc',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '400px',
    margin: '50px auto',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Arial', sans-serif",
  },
  heading: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    fontSize: '16px',
    color: '#333',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    backgroundColor: '#fff',
  },
  authButton: {
    background: 'linear-gradient(to right, #38bdf8, #2563eb)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loadingButton: {
    backgroundColor: '#ccc',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'not-allowed',
  },
  keyContainer: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#e0f2fe',
    borderLeft: '6px solid #0284c7',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    fontFamily: 'Courier New, monospace',
    color: '#0f172a',
    position: 'relative',
    wordBreak: 'break-word',
  },
  keyTitle: {
    margin: 0,
    fontSize: '18px',
    marginBottom: '10px',
  },
  keyText: {
    fontSize: '14px',
    lineHeight: '1.6',
    wordBreak: 'break-all',
  },
  copyBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#0284c7',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    textDecoration: 'underline',
    color: '#9333ea',
  },
};

export default AuthPage;
