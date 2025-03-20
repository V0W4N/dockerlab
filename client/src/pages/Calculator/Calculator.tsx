import { useState } from 'react';
import './Calculator.css';

export interface CalculationResult {
  numbers: number[];
  sum: number;
  average: number;
  max: number;
  min: number;
}

const API_BASE_URL = 'http://localhost:3000/api';

export default function Calculator() {
  const [numbers, setNumbers] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const numbersArray = numbers.split(',').map(num => parseFloat(num.trim()));
      if (numbersArray.some(isNaN)) {
        setError('Please enter valid numbers separated by commas');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numbers: numbersArray }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to calculate statistics');
    }
  };

  return (
    <div className="calculator">
      <h2>Calculator</h2>
      <form onSubmit={handleSubmit} className="calculator-form">
        <div className="calculator-input-group">
          <label htmlFor="numbers">Enter numbers (comma-separated):</label>
          <input
            type="text"
            id="numbers"
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            placeholder="e.g., 1, 2, 3, 4, 5"
            required
          />
        </div>
        <button type="submit">Calculate</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="calculator-results">
          <div className="calculator-result-container">
            <div className="calculator-result-item">
              <h3>Sum</h3>
              <p>{result.sum.toFixed(2)}</p>
            </div>
            <div className="calculator-result-item">
              <h3>Average</h3>
              <p>{result.average.toFixed(2)}</p>
            </div>
            <div className="calculator-result-item">
              <h3>Maximum</h3>
              <p>{result.max.toFixed(2)}</p>
            </div>
            <div className="calculator-result-item">
              <h3>Minimum</h3>
              <p>{result.min.toFixed(2)}</p>
            </div>
          </div>
          <div className="calculator-numbers-list">
            <h3>Input Numbers</h3>
            <p>{result.numbers.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
} 