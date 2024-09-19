export default function Attributions() {
  return (
    <div
      className="window"
      style={{
        height: "80%",
        marginBottom: "8px",
        marginTop: "8px",
      }}
    >
      <div className="title-bar">
        <div className="title-bar-text">Weather98 Attributions</div>
      </div>
      <div>
        <p style={{ fontWeight: "bold" }}>
          Icons used on this site were made available by{" "}
          <a href="https://twcclassics.com/downloads.html">TWC Classics</a>{" "}
          where the original creators are cited as Charles A. and Nick S.
        </p>
        <p style={{ fontWeight: "bold" }}>
          Styled with 98.css. Give it a star on github{" "}
          <a href="https://github.com/jdan/98.css">here</a>.
        </p>
        <p style={{ fontWeight: "bold" }}>
          Weather data is from the National Weather Service api. For more info
          visit{" "}
          <a href="https://www.weather.gov/documentation/services-web-api">
            weather.gov
          </a>
          .
        </p>
      </div>
    </div>
  );
}
