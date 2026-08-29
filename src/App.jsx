import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./App.css";
import Report from "./Report.jsx";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [aqi, setAqi] = useState(70);
  const [pm25, setPm25] = useState(35);
  const [co2, setCo2] = useState(580);
  const[temperature, setTemperature] = useState(null);
  const[humidity, setHumidity] = useState(null);
  const [windSpeed, setWindSpeed] = useState(0);
  const previousAlert = useRef(false);

// Settings
  const [alertSound, setAlertSound] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [temperatureUnit, setTemperatureUnit] = useState("C");

  const [thresholds, setThresholds] = useState({
    aqi: 100,
    pm25: 35,
    co2: 1000,
    temperature: 35,
    humidity: 80
  });
  // Load saved settings
useEffect(() => {
  const savedSettings = localStorage.getItem("pollutionSettings");

  if (savedSettings) {
    const settings = JSON.parse(savedSettings);

    setAlertSound(settings.alertSound);
    setAutoRefresh(settings.autoRefresh);
    setRefreshInterval(settings.refreshInterval);
    setTemperatureUnit(settings.temperatureUnit);
    setThresholds(settings.thresholds);
  }
}, []);
  const playAlertSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5
  );

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
};
  useEffect(() => {
  const timer = setInterval(() => {
    setAqi(Math.floor(Math.random() * 101));
    setPm25(Math.floor(Math.random() * 51) + 10);
    setCo2(Math.floor(Math.random() * 501) + 400);
    setTemperature(Math.floor(Math.random() * 11) + 20);
    setHumidity(Math.floor(Math.random() * 31) + 45);
    setWindSpeed(Math.floor(Math.random() * 16) + 5);
  }, 3000);

  return () => clearInterval(timer);
}, []);
  useEffect(() => {
  const danger =
    aqi > thresholds.aqi ||
    pm25 > thresholds.pm25 ||
    co2 > thresholds.co2 ||
    temperature > thresholds.temperature ||
    humidity > thresholds.humidity;

  // Play sound only when the system enters an alert condition
  if (danger && !previousAlert.current && alertSound) {
    playAlertSound();
  }

  previousAlert.current = danger;
}, [aqi, pm25, co2, temperature, humidity, alertSound]);
   useEffect(() => {
  const getWeather = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`
        );

        const data = await response.json();

        setTemperature(data.current.temperature_2m);
        setHumidity(data.current.relative_humidity_2m);
      } catch (error) {
        console.error("Weather error:", error);
      }
    });
  };

  getWeather();

  const weatherTimer = setInterval(getWeather, 600000);

  return () => clearInterval(weatherTimer);
}, []);

  const [aqiStatus, setAqiStatus] = useState("");
  const [pm25Status, setPm25Status] = useState("");
  const [co2Status, setCo2Status] = useState("");

  const [history, setHistory] = useState([
    {
      time: "11:26:34 AM",
      aqi: 42,
      co2: 410,
      pm25: 18
    },
    {
      time: "11:26:44 AM",
      aqi: 55,
      co2: 450,
      pm25: 22
    },
    {
      time: "11:26:54 AM",
      aqi: 48,
      co2: 430,
      pm25: 20
    }
  ]);
  const [lastUpdated, setLastUpdated] = useState("--");
  const [alerts, setAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState("All");
  const [alertSearch, setAlertSearch] = useState("");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState([]);

  const getAqiStatus = (value) => {
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for Sensitive Groups";
    if (value <= 200) return "Unhealthy";
    return "Very Unhealthy";
  };

  const getPm25Status = (value) => {
    if (value <= 12) return "Good";
    if (value <= 35) return "Moderate";
    if (value <= 55) return "Unhealthy";
    return "Very Unhealthy";
  };

  const getCo2Status = (value) => {
    if (value <= 600) return "Good";
    if (value <= 1000) return "Moderate";
    if (value <= 1500) return "Unhealthy";
    return "Poor";
  };

  const fetchPollutionData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/pollution"
      );

      const data = await response.json();

      setAqi(data.aqi);
      setPm25(data.pm25);
      setCo2(data.co2);
      const newAlerts = [];

      if (data.aqi > 100) {
        newAlerts.push({
          id: Date.now(),
          type: "AQI",
          message: `AQI is ${data.aqi} (${getAqiStatus(data.aqi)})`,
          time: new Date().toLocaleTimeString(),
        });
      }

      if (data.pm25 > 35) {
        newAlerts.push({
          id: Date.now() + 1,
          type: "PM2.5",
          message: `PM2.5 is ${data.pm25} µg/m³`,
          time: new Date().toLocaleTimeString(),
        });
      }

      if (data.co2 > 1000) {
        newAlerts.push({
          id: Date.now() + 2,
          type: "CO₂",
          message: `CO₂ is ${data.co2} ppm`,
          time: new Date().toLocaleTimeString(),
        });
      }

      if (newAlerts.length) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20));
      }

      setAqiStatus(
        data.aqiStatus || getAqiStatus(data.aqi)
      );

      setPm25Status(
        data.pm25Status || getPm25Status(data.pm25)
      );

      setCo2Status(
        data.co2Status || getCo2Status(data.co2)
      );

      const time = new Date().toLocaleTimeString();

      setLastUpdated(time);

      setHistory((oldData) => {
        const newReading = {
          time,
          aqi: data.aqi,
          pm25: data.pm25,
          co2: data.co2,
        };

        return [...oldData, newReading].slice(-10);
      });
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    fetchPollutionData();

    const interval = setInterval(() => {

      fetchPollutionData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          🌍
          <div>
            <strong>POLLUTION</strong>
            <span>MONITORING</span>
          </div>
        </div>

        <nav>
          <div
             className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}
             onClick={() => setActivePage("Dashboard")}
             >
            🏠 Dashboard
          </div>
          <div
            className={`nav-item ${activePage === "Live Data" ? "active" : ""}`}
            onClick={() => setActivePage("Live Data")}
          >
            📊 Live Data
          </div>

          <div
             className={`nav-item ${activePage === "History" ? "active" : ""}`}
             onClick={() => setActivePage("History")}
          >
            ⚪ History
          </div>
          <div
              className={`nav-item ${activePage === "Alerts" ? "active" : ""}`}
              onClick={() => setActivePage("Alerts")}
          >
            🔔Alerts
          </div>

          <div
              className={`nav-item ${activePage === "Report" ? "active" : ""}`}
              onClick={() => setActivePage("Report")}
          >
             📄Report
          </div>

          <div
             className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
             onClick={() => setActivePage("Settings")}
          >
            ⚙️Settings
          </div>
          <div
            className={`nav-item ${activePage === "About" ? "active" : ""}`}
            onClick={() => setActivePage("About")}
          >
            📃About
          </div>
      </nav>

        <div className="system-status">
          <span className="live-dot"></span>
          <div>
            <strong>System Status</strong>
            <small>All systems normal</small>
          </div>
        </div>

      </aside>


      {/* MAIN CONTENT */}
      <main className="main">
        {activePage === "Live Data" ? (
  <section className="live-data-page">

    {/* Page Header */}
    <div className="live-data-header">
      <div>
        <h1>Live Data</h1>
        <p>Real-time pollution sensor monitoring</p>
      </div>

      <div className="live-status">
        <span className="live-green-dot"></span>
        <strong>LIVE</strong>
      </div>
    </div>

    {/* Main Live Reading */}
    <div className="live-main-card">
      <div className="live-main-left">
        <span className="live-label">CURRENT AIR QUALITY</span>

        <div className="live-aqi">
          {aqi}
        </div>

        <div className="live-aqi-status">
          Moderate
        </div>

        <p>Air quality is currently being monitored.</p>
      </div>

      <div className="live-circle">
        <div>
          <span>LIVE</span>
          <strong>{aqi}</strong>
          <small>AQI</small>
        </div>
      </div>
    </div>

    {/* Sensor Cards */}
    <div className="live-sensors">

      <div className="sensor-card pm-card">
        <div className="sensor-icon">●</div>
        <div>
          <h3>PM2.5</h3>
          <p className="sensor-value">{pm25}</p>
          <span>µg/m³</span>
        </div>

        <div className={`sensor-status ${
          pm25 <= 30 ? "good" : pm25 <= 60 ? "moderate" : "unhealthy"
        }`}>
          {pm25 <= 30 ? "Good" : pm25 <= 60 ? "Moderate" : "Unhealthy"}
        </div>
      </div>

      <div className="sensor-card co-card">
        <div className="sensor-icon">●</div>
        <div>
          <h3>CO₂</h3>
          <p className="sensor-value">{co2}</p>
          <span>ppm</span>
        </div>

        <div className={`sensor-status ${
           co2 <= 600 ? "good" : co2 <= 1000 ? "moderate" : "unhealthy"
        }`}>
           {co2 <= 600 ? "Good" : co2 <= 1000 ? "Moderate" : "Unhealthy"}
        </div>
      </div>

      <div className="sensor-card temp-card">
        <div className="sensor-icon">●</div>
        <div>
          <h3>Temperature</h3>
          <p className="sensor-value">{temperature}</p>
          <span>°C</span>
        </div>

        <div className="sensor-status moderate">
          {temperature <= 30 ? "Normal" : "High"}
        </div>
      </div>

    </div>

    {/* Live Monitoring Panel */}
    <div className="monitor-panel">

      <div className="monitor-header">
        <div>
          <h2>Live Pollution Monitoring</h2>
          <p>Sensor readings update automatically</p>
        </div>

        <button className="refresh-button">
          ↻ Refresh
        </button>
      </div>

      {/* Bars */}
      <div className="reading-row">
        <div className="reading-title">
          <span>PM2.5</span>
          <strong>{pm25}  µg/m³</strong>
        </div>

        <div className="reading-bar">
          <div className="reading-fill pm-fill"
          style={{ width: `${Math.min(pm25 * 2, 100)}%` }}></div>
        </div>
      </div>

      <div className="reading-row">
        <div className="reading-title">
          <span>CO₂</span>
          <strong>{co2}  ppm</strong>
        </div>

        <div className="reading-bar">
          <div className="reading-fill co-fill"
          style={{ width: `${Math.min((co2 / 1200) * 100, 100)}%` }}></div>
        </div>
      </div>

      <div className="reading-row">
        <div className="reading-title">
          <span>AQI</span>
          <strong>{aqi}</strong>
        </div>

        <div className="reading-bar">
          <div className="reading-fill aqi-fill"
          style={{ width: `${aqi}%` }}></div>
        </div>
      </div>

    </div>

    {/* Last Updated */}
    <div className="last-updated">
      <span className="update-dot"></span>
      Last updated just now
    </div>

  </section>

) : activePage === "History" ? (

    // HISTORY CONTENT GOES HERE
  <>
    <header className="header">
      <div>
        <h1>History</h1>
        <p>Historical pollution sensor readings</p>
      </div>

      <div className="header-info">
        <div className="live">
          <span className="live-dot"></span>
            LIVE
        </div>
      </div>
    </header>

    <section className="history-box">
  <div className="history-header">
    <div>
      <h2>Pollution History</h2>
      <p>Previous pollution sensor readings</p>
    </div>
  </div>

  <div className="history-table-container">
    <table className="history-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>AQI</th>
          <th>CO₂ (ppm)</th>
          <th>PM2.5 (µg/m³)</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {history.map((item, index) => (
          <tr key={index}>
            <td>{item.time}</td>
            <td>{item.aqi}</td>
            <td>{item.co2}</td>
            <td>{item.pm25}</td>
            <td>
              <span className="status-badge">
                {item.aqi <= 50
                  ? "Good"
                  : item.aqi <= 100
                  ? "Moderate"
                  : "Unhealthy"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

    
  </>
) : activePage === "Alerts" ? (
  <div className="alerts-page">

    <div className="alerts-header">
      <div>
        <h1>Alerts</h1>
        <p>Monitor air quality warnings and pollution events</p>
      </div>

      <div className="alert-summary">
        <div className="summary-card danger">
          <span>Active Alerts</span>
          <strong>{alerts.length}</strong>
        </div>

        <div className="summary-card safe">
          <span>Acknowledged</span>
          <strong>{acknowledgedAlerts.length}</strong>
        </div>
      </div>
    </div>

    {/* Search + Filter */}
    <div className="alert-controls">

      <input
        type="text"
        placeholder="Search alerts..."
        value={alertSearch}
        onChange={(e) => setAlertSearch(e.target.value)}
      />

      <select
        value={alertFilter}
        onChange={(e) => setAlertFilter(e.target.value)}
      >
        <option value="All">All Alerts</option>
        <option value="AQI">AQI</option>
        <option value="PM2.5">PM2.5</option>
        <option value="CO₂">CO₂</option>
      </select>

    </div>

    {/* Alert List */}
    <div className="alerts-list">

      {alerts
        .filter((alert) => {
          const matchesFilter =
            alertFilter === "All" ||
            alert.type === alertFilter;

          const matchesSearch =
            (alert.message || "").toLowerCase().includes(alertSearch.toLowerCase()) ||
            (alert.type || "").toLowerCase().includes(alertSearch.toLowerCase()) ||
            (alert.type || "").toLowerCase().replace("₂", "2").includes(alertSearch.toLowerCase());
          return matchesFilter && matchesSearch;
        })
        .map((alert) => {

          const acknowledged =
            acknowledgedAlerts.includes(alert.id);

          return (
            <div
              className={`alert-card ${alert.type
                .toLowerCase()
                .replace(".", "")}`}
              key={alert.id}
            >

              <div className="alert-icon">
                {alert.type === "AQI" && "🌫️"}
                {alert.type === "PM2.5" && "💨"}
                {alert.type === "CO₂" && "🫧"}
              </div>

              <div className="alert-content">
                <div className="alert-title-row">
                  <h3>{alert.type} Alert</h3>

                  <span className="alert-badge">
                    {acknowledged ? "Acknowledged" : "Active"}
                  </span>
                </div>

                <p>{alert.message}</p>

                <small>{alert.time}</small>
              </div>

              {!acknowledged && (
                <button
                  className="acknowledge-btn"
                  onClick={() =>
                    setAcknowledgedAlerts((prev) => [
                      ...prev,
                      alert.id,
                    ])
                  }
                >
                  ✓ Acknowledge
                </button>
              )}

            </div>
          );
        })}

      {alerts.length === 0 && (
        <div className="no-alerts">
          <div>✅</div>
          <h2>No alerts</h2>
          <p>Air quality is currently within the monitored limits.</p>
        </div>
      )}

    </div>

  </div>
) : activePage === "Report" ? (
  <div className="report-page">

    <div className="report-header">
      <h1>Project Report</h1>
      <p>Live Air Pollution Monitoring System</p>

      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Print Report
      </button>
    </div>

    <h2 className="report-title">
      📈 Current Environmental Readings
    </h2>

    <div className="report-cards">

      {/* AQI */}
      <div className="report-card aqi-card">
        <span className="report-icon">🍃</span>
        <small>AQI</small>
        <strong>{aqi}</strong>
        <p>{aqiStatus}</p>
      </div>

      {/* PM2.5 */}
      <div className="report-card pm-card">
        <span className="report-icon">•••</span>
        <small>PM2.5</small>
        <strong>{pm25}</strong>
        <p>µg/m³</p>
      </div>

      {/* CO2 */}
      <div className="report-card co2-card">
        <span className="report-icon">☁</span>
        <small>CO₂</small>
        <strong>{co2}</strong>
        <p>ppm</p>
      </div>

      {/* Temperature */}
      <div className="report-card temp-card">
        <span className="report-icon">🌡️</span>
        <small>TEMPERATURE</small>
        <strong>{temperature}°</strong>
        <p>°C</p>
      </div>

      {/* Humidity */}
      <div className="report-card humidity-card">
        <span className="report-icon">💧</span>
        <small>HUMIDITY</small>
        <strong>{humidity}%</strong>
        <p>Relative humidity</p>
      </div>

      {/* Wind */}
      <div className="report-card wind-card">
        <span className="report-icon">💨</span>
        <small>WIND SPEED</small>
        <strong>{windSpeed}</strong>
        <p>km/h</p>
      </div>

    </div>

    <div className="report-summary">
      <h2>Environmental Summary</h2>
      <p>
        The system is continuously monitoring air quality and environmental
        conditions. Current readings are displayed using live sensor data.
      </p>
    </div>

  </div>

) : activePage === "Settings" ? (
  <section className="settings-page">
    <div className="settings-header">
      <h1>⚙️ Settings</h1>
      <p>Customize your Pollution Monitoring System</p>
    </div>

    {/* Alert Sound */}
    <div className="setting-card">
      <div>
        <h3>🔔 Alert Sound</h3>
        <p>Play a sound when pollution levels become dangerous.</p>
      </div>

      <label className="switch">
        <input type="checkbox" defaultChecked />
        <span className="slider"></span>
      </label>
    </div>

    {/* Auto Refresh */}
    <div className="setting-card">
      <div>
        <h3>🔄 Auto Refresh</h3>
        <p>Automatically update live environmental readings.</p>
      </div>

      <label className="switch">
        <input type="checkbox" defaultChecked />
        <span className="slider"></span>
      </label>
    </div>

    {/* Refresh Interval */}
    <div className="setting-card">
      <div>
        <h3>⏱️ Refresh Interval</h3>
        <p>Choose how often the readings are updated.</p>
      </div>

      <select defaultValue="3">
        <option value="3">3 seconds</option>
        <option value="5">5 seconds</option>
        <option value="10">10 seconds</option>
      </select>
    </div>

    {/* Temperature Unit */}
    <div className="setting-card">
      <div>
        <h3>🌡️ Temperature Unit</h3>
        <p>Choose the temperature display unit.</p>
      </div>

      <select defaultValue="C">
        <option value="C">°C</option>
        <option value="F">°F</option>
      </select>
    </div>

    {/* Alert Thresholds */}
    <div className="settings-thresholds">
      <h2>⚠️ Alert Thresholds</h2>

      <div className="threshold-grid">
        <div>
          <label>AQI</label>
          <input type="number" value={thresholds.aqi}
          onChange={(e) =>
            setThresholds({
              ...thresholds,
              aqi: Number(e.target.value)
            })
          }
          />
        </div>

        <div>
          <label>PM2.5 (µg/m³)</label>
          <input type="number" value={thresholds.pm25}
          onChange={(e) =>
            setThresholds({
              ...thresholds,
              pm25: Number(e.target.value)
            })
          }
          />
        </div>

        <div>
          <label>CO₂ (ppm)</label>
          <input type="number" value={thresholds.co2}
          onChange={(e) =>
            setThresholds({
              ...thresholds,
              co2: Number(e.target.value)
            })
          }
          />
        </div>

        <div>
          <label>Temperature (°C)</label>
          <input type="number" value={thresholds.temperature}
          onChange={(e) =>
            setThresholds({
              ...thresholds,
              temperature: Number(e.target.value)
            })
          }
          />
        </div>

        <div>
          <label>Humidity (%)</label>
          <input type="number" value={thresholds.humidity}
          onChange={(e) =>
            setThresholds({
              ...thresholds,
              humidity: Number(e.target.value)
            })
          }
          />
        </div>
      </div>
    </div>

    <button className="save-settings"
    onClick={() => {
    localStorage.setItem(
      "pollutionSettings",
      JSON.stringify({
        alertSound,
        autoRefresh,
        refreshInterval,
        temperatureUnit,
        thresholds,
      })
    );

    alert("Settings saved successfully!");
  }}
>
      💾 Save Settings
    </button>
  </section>
) :  activePage === "About" ? (
  <section className="about-page">

  {/* About Header */}
  <div className="about-header">
    <h1>ℹ️ About</h1>
    <p>About your Pollution Monitoring System</p>
  </div>

  {/* Main Information Card */}
  <div className="about-main-card">
    <div className="about-icon">🌍</div>

    <div className="about-main-content">
      <h2>Pollution Monitoring System</h2>
      <p>
        A real-time environmental monitoring system designed to
        track and display important air quality parameters.
      </p>
    </div>
  </div>

  {/* Features */}
  <div className="about-section">
    <h2>✨ Features</h2>

    <div className="features-grid">

      <div className="feature-item">
        <span>📊</span>
        <p>Real-time Air Quality Index monitoring</p>
      </div>

      <div className="feature-item">
        <span>🔴</span>
        <p>PM2.5 pollution monitoring</p>
      </div>

      <div className="feature-item">
        <span>💨</span>
        <p>CO₂ level monitoring</p>
      </div>

      <div className="feature-item">
        <span>🌡️</span>
        <p>Temperature monitoring</p>
      </div>

      <div className="feature-item">
        <span>💧</span>
        <p>Humidity monitoring</p>
      </div>

      <div className="feature-item">
        <span>⚠️</span>
        <p>Pollution alert notifications</p>
      </div>

      <div className="feature-item">
        <span>🔔</span>
        <p>Alert sound when dangerous levels are detected</p>
      </div>

      <div className="feature-item">
        <span>🔄</span>
        <p>Automatic data refresh</p>
      </div>

      <div className="feature-item">
        <span>📜</span>
        <p>Historical pollution data</p>
      </div>

      <div className="feature-item">
        <span>📄</span>
        <p>Environmental report generation</p>
      </div>

    </div>
  </div>

  {/* Alert System */}
  <div className="about-info-card">
    <h2>⚠️ Alert System</h2>
    <p>
      The system automatically checks environmental readings against
      predefined safety thresholds. When a parameter exceeds its
      threshold, an alert is generated to notify the user.
    </p>
  </div>

  {/* System Information */}
  <div className="about-info-grid">

    <div className="about-info-box">
      <h3>⚙️ Monitoring</h3>
      <p>
        Continuously monitors AQI, PM2.5, CO₂, temperature and humidity.
      </p>
    </div>

    <div className="about-info-box">
      <h3>🔄 Data Updates</h3>
      <p>
        Environmental readings can be updated automatically at
        configurable intervals.
      </p>
    </div>

    <div className="about-info-box">
      <h3>🛡️ Safety</h3>
      <p>
        Configurable alert thresholds help identify potentially
        dangerous environmental conditions.
      </p>
    </div>

    <div className="about-info-box">
      <h3>📱 Interface</h3>
      <p>
        A simple dashboard provides an easy way to view environmental
        conditions and historical information.
      </p>
    </div>

  </div>

  {/* Version */}
  <div className="about-footer">
    <p><strong>Pollution Monitoring System</strong></p>
    <p>Version 1.0.0</p>
  </div>

</section>
) : (
  <>


        {/* HEADER */}
        <header className="header">

          <div>
            <h1>Pollution Monitoring System</h1>
            <p>
              Real-time Air Quality Monitoring Dashboard
            </p>
          </div>

          <div className="header-info">

            <div className="live">
              <span className="live-dot"></span>
              LIVE
            </div>

            <div className="updated">
              🕒
              <div>
                <small>Last Updated:</small>
                <strong>{lastUpdated}</strong>
              </div>
            </div>

            <div>
              Live Location
            </div>

          </div>

        </header>


        {/* CARDS */}
        <section className="cards">

          {/* AQI */}
          <div className="card aqi-card">

            <div className="card-title">
              🍃
              <span>AIR QUALITY INDEX</span>
            </div>

            <div className="number">
              {aqi}
            </div>

            <div className="card-status">
              {aqiStatus}
            </div>

            <div className="progress">
              <div
                className="progress-bar aqi-progress"
                style={{
                  width: `${Math.min(aqi / 2, 100)}%`,
                }}
              ></div>
            </div>

            <p>AQI is acceptable.</p>

          </div>


          {/* PM2.5 */}
          <div className="card pm-card">

            <div className="card-title">
              🟠
              <span>PM2.5</span>
            </div>

            <div className="number">
              {pm25}
            </div>

            <div className="unit">
              µg/m³
            </div>

            <div className="card-status">
              {pm25Status}
            </div>

            <div className="progress">
              <div
                className="progress-bar pm-progress"
                style={{
                  width: `${Math.min(pm25 * 2, 100)}%`,
                }}
              ></div>
            </div>

            <p>Particulate matter level.</p>

          </div>


          {/* CO2 */}
          <div className="card co2-card">

            <div className="card-title">
              ☁️
              <span>CO₂</span>
            </div>

            <div className="number">
              {co2}
            </div>

            <div className="unit">
              ppm
            </div>

            <div className="card-status">
              {co2Status}
            </div>

            <div className="progress">
              <div
                className="progress-bar co2-progress"
                style={{
                  width: `${Math.min(co2 / 15, 100)}%`,
                }}
              ></div>
            </div>

            <p>Carbon dioxide level.</p>

          </div>

        </section>


        {/* GRAPH */}
        <section className="chart-box">

          <div className="chart-header">

            <div>
              <h2>Pollution Levels Over Time</h2>
              <p>Live pollution readings</p>
            </div>

            <button onClick={fetchPollutionData}>
              ↻ Refresh
            </button>

          </div>

          <ResponsiveContainer
            width="100%"
            height={400}
          >

            <LineChart data={history}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="aqi"
                name="AQI"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="pm25"
                name="PM2.5"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="co2"
                name="CO₂"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </section>


        {/* BOTTOM CARDS */}
        <section className="bottom-cards">

          <div className="info-card purple">
            <span>🌡️</span>
            <div>
              <small>TEMPERATURE</small>
              <strong>{temperature !== null ? `${temperature}°C` : "Loading..."}</strong>
              <p>Environmental reading</p>
            </div>
          </div>

          <div className="info-card blue">
            <span>💧</span>
            <div>
              <small>HUMIDITY</small>
              <strong>{humidity !== null ? `${humidity}%` : "Loading..."}</strong>
              <p>Comfortable</p>
            </div>
          </div>

          <div className="info-card cyan">
            <span>💨</span>
            <div>
              <small>WIND SPEED</small>
              <strong>{windSpeed} km/h</strong>
              <p>
                {windSpeed < 10
                ? "Light breeze"
                : windSpeed < 20
                ? "Moderate breeze"
                : "Strong breeze"}
              </p>
            </div>
          </div>

          <div className="info-card green">
            <span>🌿</span>
            <div>
              <small>AIR STATUS</small>
              <strong>{aqiStatus}</strong>
              <p>Current condition</p>
            </div>
          </div> 

        </section>


        <footer>
          © 2026 Pollution Monitoring System | All Rights Reserved
        </footer>
      </>
)}

    </main>
  </div>
  )
}
export default App;