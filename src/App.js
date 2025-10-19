import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(2);
  const [result, setResult] = useState(3);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Dynamic backend URL for production vs development
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_BACKEND_URL || 'https://your-backend.railway.app'
    : 'http://localhost:5001';

  // Fetch calculation history from backend
  const fetchCalculations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/calculations`);
      const data = await response.json();
      if (data.success) {
        setCalculations(data.data);
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
      setMessage('❌ Could not connect to backend');
    }
  };

  // Calculate using backend API
  const calculate = async () => {
    if (loading) return;
    
    setLoading(true);
    setMessage('');

    try {
      console.log('Sending:', { num1, num2 });
      
      const response = await fetch(`${BACKEND_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num1: parseFloat(num1),
          num2: parseFloat(num2)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received:', data);
      
      if (data.success) {
        const calculatedResult = data.data?.result || data.result;
        setResult(calculatedResult);
        setMessage('✅ ' + data.message);
        fetchCalculations();
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

// Load calculations when component mounts
useEffect(() => {
  const loadCalculations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/calculations`);
      const data = await response.json();
      if (data.success) {
        setCalculations(data.data);
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
      setMessage('❌ Could not connect to backend');
    }
  };
  
  loadCalculations();
}, [BACKEND_URL]);

  return (
    <div className="App">
      <div className="calculator-container">
        <h1>🧮 Full Stack Calculator</h1>
        <h3>Frontend + Backend Connected! 🎉</h3>
        
        {/* Connection Status */}
        <div className="connection-status">
          <span className="status-dot"></span>
          Backend: {BACKEND_URL}
        </div>

        {/* Calculator Inputs */}
        <div className="input-group">
          <input 
            type="number" 
            value={num1} 
            onChange={(e) => setNum1(e.target.value)}
            disabled={loading}
          />
          <span className="operator">+</span>
          <input 
            type="number" 
            value={num2} 
            onChange={(e) => setNum2(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {/* Calculate Button */}
        <button onClick={calculate} disabled={loading}>
          {loading ? '🔄 Calculating...' : '🧮 Calculate (=)'}
        </button>
        
        {/* Result Display */}
        <div className="result">
          <div>Backend Result:</div>
          <div id="result">{result}</div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* Calculation History */}
        <div className="history">
          <h3>📊 Calculation History (From Backend)</h3>
          {calculations.length === 0 ? (
            <p>No calculations yet. Perform a calculation above!</p>
          ) : (
            <ul>
              {calculations.slice().reverse().map(calc => (
                <li key={calc.id || calc._id}>
                  <span className="calc-expression">
                    {calc.num1} + {calc.num2} = 
                  </span>
                  <span className="calc-result">{calc.result}</span>
                  <span className="calc-time">
                    {new Date(calc.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="footer">
          ✅ HTML → CSS → JavaScript → React → Node.js → MongoDB → DEPLOYED
        </div>
      </div>
    </div>
  );
}

export default App;