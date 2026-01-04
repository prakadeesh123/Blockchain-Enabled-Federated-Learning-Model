import React from 'react';
import './Style.css';

const ResultDisplay = ({ accuracy, f1Score, confusionMatrix, report }) => {
  return (
    <div className="result-container">
      
      <h3>Confusion Matrix:</h3>
      <pre>{JSON.stringify(confusionMatrix, null, 2)}</pre>

      <h3>Classification Report:</h3>
      <pre>{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
};

export default ResultDisplay;
