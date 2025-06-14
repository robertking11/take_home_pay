import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [inputs, setInputs] = useState({
    year_basic_pay: 60000,
    pension_percent: 6,
    sharematch: 150,
    holidays: 35,
    sharesave: 160,
    other_gross_deductions: 0,
    other_net_deductions: 12.50,
  });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;
    if (type === "number" || type === "range") {
      val = val === "" ? 0 : Number(val);
    }
    setInputs((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Ensure all fields are numbers
    const sanitizedInputs = {
      year_basic_pay: Number(inputs.year_basic_pay) || 0,
      pension_percent: Number(inputs.pension_percent) || 0,
      sharematch: Number(inputs.sharematch) || 0,
      holidays: Number(inputs.holidays) || 0,
      other_gross_deductions: Number(inputs.other_gross_deductions) || 0,
      sharesave: Number(inputs.sharesave) || 0,
      other_net_deductions: Number(inputs.other_net_deductions) || 0,
    };
    try {
      const res = await axios.post("http://localhost:8000/calculate", sanitizedInputs);
      setResults(res.data);
    } catch (err) {
      setResults(null);
      setError("Calculation failed. Please check your inputs.");
    }
  };

  return (
    <div className="container custom-container">
      <h1 className="main-title">Take Home Pay Calculator</h1>
      <form onSubmit={handleSubmit}>
        <div className="sliders custom-sliders">
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Yearly Basic Pay Salary (£)
            </label>
            <input
              type="number"
              name="year_basic_pay"
              value={inputs.year_basic_pay}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="custom-input"
              required
            />
          </div>
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Pension Contribution (%)
              <span className="slider-value">{inputs.pension_percent}</span>
            </label>
            <input
              type="range"
              name="pension_percent"
              min={0}
              max={100}
              step={1}
              value={inputs.pension_percent}
              onChange={handleChange}
              className="custom-slider"
            />
          </div>
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Sharematch (£)
              <span className="slider-value">{inputs.sharematch}</span>
            </label>
            <input
              type="range"
              name="sharematch"
              min={0}
              max={150}
              step={1}
              value={inputs.sharematch}
              onChange={handleChange}
              className="custom-slider"
            />
          </div>
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Holiday Days Bought
              <span className="slider-value">{inputs.holidays}</span>
            </label>
            <input
              type="range"
              name="holidays"
              min={-5}
              max={5}
              step={1}
              value={inputs.holidays}
              onChange={handleChange}
              className="custom-slider"
            />
          </div>
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Sharesave (£)
              <span className="slider-value">{inputs.sharesave}</span>
            </label>
            <input
              type="range"
              name="sharesave"
              min={0}
              max={500}
              step={1}
              value={inputs.sharesave}
              onChange={handleChange}
              className="custom-slider"
            />
          </div>
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Other Gross Deductions (£)
            </label>
            <input
              type="number"
              name="other_gross_deductions"
              value={inputs.other_gross_deductions}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="custom-input"
              required
            />
          </div>
          <div className="slider-group custom-slider-group">
            <label className="slider-label custom-slider-label">
              Other Net Deductions (£)
            </label>
            <input
              type="number"
              name="other_net_deductions"
              value={inputs.other_net_deductions}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="custom-input"
              required
            />
          </div>
        </div>
        <button className="calculate-btn" type="submit">
          Calculate
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}
      {results && (
        <div className="results">
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">Gross Salary</span>
              <table className="styled-table">
                <tbody>
                  {Object.entries(results.gross_salary).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>
                        £{Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="summary-card">
              <span className="summary-label">Take Home Pay</span>
              <table className="styled-table">
                <tbody>
                  {Object.entries(results.take_home_pay).map(([k, v]) => (
                    <tr key={k}>
                      <td style={k === "Monthly Take Home Pay" ? { fontWeight: "bold" } : {}}>
                        {k === "Monthly Net Salary" ? <b>Monthly Take Home Pay</b> : k}
                      </td>
                      <td style={k === "Monthly Net Salary" ? { fontWeight: "bold" } : {}}>
                        £{Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;