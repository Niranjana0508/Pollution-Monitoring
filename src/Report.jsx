function Report({ aqi, pm25, co2, temperature, humidity }) {

  const getAqiStatus = () => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy";
    return "Very Unhealthy";
  };

  return (
    <div className="report-page">

      {/* HEADER */}
      <div className="report-header">
        <h1>Project Report</h1>
        <p>Live Air Pollution Monitoring System</p>

        <button
          className="print-button"
          onClick={() => window.print()}
        >
          🖨️ Print Report
        </button>
      </div>


      {/* CURRENT ENVIRONMENTAL READINGS */}
      <section className="current-readings">

        <h2>〽 Current Environmental Readings</h2>

        <div className="report-reading-grid">

          {/* AQI */}
          <div className="reading-card aqi-report">
            <div className="reading-icon">🍃</div>

            <h3>AQI</h3>

            <strong>{aqi}</strong>

            <span>{getAqiStatus()}</span>
          </div>


          {/* PM2.5 */}
          <div className="reading-card pm-report">
            <div className="reading-icon">•••</div>

            <h3>PM2.5</h3>

            <strong>{pm25}</strong>

            <small>µg/m³</small>
          </div>


          {/* CO2 */}
          <div className="reading-card co-report">
            <div className="reading-icon">☁</div>

            <h3>CO₂</h3>

            <strong>{co2}</strong>

            <small>ppm</small>
          </div>


          {/* TEMPERATURE */}
          <div className="reading-card temp-report">
            <div className="reading-icon">🌡️</div>

            <div>
              <h3>Temperature</h3>

              <strong>
                {temperature !== null ? temperature : "--"}
              </strong>

              <small>°C</small>
            </div>
          </div>


          {/* HUMIDITY */}
          <div className="reading-card humidity-report">
            <div className="reading-icon">💧</div>

            <div>
              <h3>Humidity</h3>

              <strong>
                {humidity !== null ? humidity : "--"}
              </strong>

              <small>%</small>
            </div>
          </div>

        </div>
      </section>


      {/* INTRODUCTION */}
      <section className="report-content-card">

        <div className="section-icon">📄</div>

        <div>
          <h2>1. Introduction</h2>

          <p>
            Air pollution is one of the major environmental problems
            that affects human health and quality of life. Monitoring
            air quality helps us understand pollution levels and
            changes in environmental conditions.
          </p>

          <p>
            The Live Air Pollution Monitoring System is a web-based
            application developed to monitor important environmental
            parameters such as AQI, PM2.5, CO₂, temperature,
            humidity, and wind speed.
          </p>
        </div>

      </section>


      {/* PROBLEM STATEMENT */}
      <section className="report-content-card">

        <div className="section-icon">❓</div>

        <div>
          <h2>2. Problem Statement</h2>

          <p>
            Traditional methods of monitoring air quality may not
            provide an easy and understandable way for users to view
            environmental conditions. Therefore, a simple and
            interactive monitoring system is required.
          </p>
        </div>

      </section>


      {/* OBJECTIVES */}
      <section className="report-content-card">

        <div className="section-icon">🎯</div>

        <div className="section-content">

          <h2>3. Objectives</h2>

          <div className="objective-grid">

            <p>✅ Monitor air quality parameters.</p>

            <p>✅ Display AQI, PM2.5 and CO₂ values.</p>

            <p>✅ Monitor temperature and humidity.</p>

            <p>✅ Display wind speed and air quality status.</p>

            <p>✅ Provide an easy-to-use dashboard.</p>

          </div>

        </div>

      </section>


      {/* PROPOSED SYSTEM */}
      <section className="report-content-card">

        <div className="section-icon">🖥️</div>

        <div>
          <h2>4. Proposed System</h2>

          <p>
            The proposed system provides a user-friendly dashboard
            that displays environmental readings and their
            corresponding air quality status. The system also
            provides Live Data, Alerts, History, and Reports.
          </p>
        </div>

      </section>


      {/* CONCLUSION */}
      <section className="report-content-card">

        <div className="section-icon">✓</div>

        <div>
          <h2>5. Conclusion</h2>

          <p>
            The Live Air Pollution Monitoring System provides a
            simple and effective way to monitor environmental
            conditions and understand air quality through an
            interactive web application.
          </p>
        </div>

      </section>

    </div>
  );
}

export default Report;