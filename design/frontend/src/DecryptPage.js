import React, { useState } from 'react';
import axios from 'axios';

function DecryptPage() {
    // States for the file and the decryption key
    const [file, setFile] = useState(null);
    const [decryptionKey, setDecryptionKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle key input
    const handleKeyChange = (e) => {
        setDecryptionKey(e.target.value);
    };

    // Handle decryption process
    const handleDecrypt = async () => {
        // Check if file and key are provided
        if (!file) {
            alert("Please upload a file first.");
            return;
        }
        if (!decryptionKey) {
            alert("Please enter the decryption key.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);  // Ensure the field name matches the backend
        formData.append('Key', decryptionKey);  // Ensure the field name matches the backend

        try {
            // Send request to backend to decrypt the file
            const response = await axios.post('http://localhost:8000/decrypt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob', // Expecting a file (CSV) back
            });

            // Check if there's an error message from backend
            if (response.data.error) {
                setError(response.data.error);
                setLoading(false);
                return;
            }

            // Create a Blob from the response data
            const blob = new Blob([response.data], { type: "text/csv" });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'decrypted_data.csv'; // Set the file name for download
            link.click(); // Trigger the download

        } catch (err) {
            console.error(err);
            setError("Decryption failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Decrypt File</h2>

            <div style={styles.inputGroup}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                />
            </div>

            <div style={styles.inputGroup}>
                <input
                    type="text"
                    placeholder="Enter Decryption Key"
                    value={decryptionKey}
                    onChange={handleKeyChange}
                    style={styles.textInput}
                />
            </div>

            <div style={styles.buttonContainer}>
                <button
                    onClick={handleDecrypt}
                    disabled={loading}
                    style={styles.decryptButton}
                >
                    {loading ? 'Decrypting...' : 'Decrypt and Download'}
                </button>
            </div>

            {error && <div style={styles.errorMessage}>{error}</div>}
        </div>
    );
}

// Inline styles
const styles = {
    container: {
        backgroundColor: '#f4f7fa',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '500px',
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
    inputGroup: {
        marginBottom: '20px',
    },
    fileInput: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#fff',
        fontSize: '16px',
    },
    textInput: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#fff',
        fontSize: '16px',
    },
    buttonContainer: {
        textAlign: 'center',
    },
    decryptButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    decryptButtonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    errorMessage: {
        color: 'red',
        fontSize: '16px',
        textAlign: 'center',
        marginTop: '20px',
    },
};

export default DecryptPage;
