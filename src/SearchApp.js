import React, { useState } from "react";

function SearchApp() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // NEW: dropdown state
  const [country, setCountry] = useState("US");
  const [ui_lang, setui_lang] = useState("en");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setExpandedIndex(null);

    try {
      const response = await fetch(
        `http://localhost:8000/search?query=${encodeURIComponent(query)}&country=${country}&ui_lang=${ui_lang}`
      );
      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      setResults(data.results || []);

      // Save recent search
      setRecentSearches([
        { query, time: new Date().toLocaleString() },
        ...recentSearches.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!query) return;
    try {
      const response = await fetch(
        `http://localhost:8000/generate_pdf?query=${encodeURIComponent(query)}&country=${country}&ui_lang=${ui_lang}`
      );
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `search_results_${query}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF: " + err.message);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const combinedSummary = results
    .map((r, i) => (r.summary ? `${i + 1}. ${r.summary}` : null))
    .filter(Boolean)
    .join("\n\n");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F0F0F",
        color: "#fff",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <h1 style={{ textAlign: "center", fontSize: 32, marginBottom: 20 }}>
        AI Research <span style={{ color: "#EB3B52" }}>Agent</span>
      </h1>

      {/* Search bar + dropdowns */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#1A1C20",
            borderRadius: 14,
            padding: "8px 12px",
            width: "70%",
            maxWidth: 800,
            boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
          }}
        >
          <input
            type="text"
            placeholder="Ask anything or start your research..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              fontSize: 18,
              padding: "10px",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: "#EB3B52",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              color: "#fff",
              fontSize: 18,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            🔍
          </button>
        </div>

        {/* Dropdown filters */}
        <div style={{ display: "flex", gap: 16 }}>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: "#1A1C20",
              color: "#fff",
            }}
          >
            <option value="US">🇺🇸 US</option>
            <option value="IN">🇮🇳 India</option>
            <option value="GB">🇬🇧 UK</option>
            <option value="CA">🇨🇦 Canada</option>
            <option value="FR">🇫🇷 FRENCH</option>
            <option value="DE">🇩🇪 GERMANY</option>
          </select>

          <select
            value={ui_lang}
            onChange={(e) => setui_lang(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: "#1A1C20",
              color: "#fff",
            }}
          >
            <option value="en-US">English</option>
            <option value="en-IN">IND ENG</option>
            <option value="en-GB">UK ENG</option>
            <option value="en-CA">CA ENG</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </div>
      </div>

      {/* Quick tags */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {["Market Research", "Competitor Analysis", "Industry Trends", "User Behavior"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              style={{
                background: "#23272F",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                color: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {tag}
            </button>
          )
        )}
      </div>

      {/* Export buttons */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <button
          onClick={downloadPDF}
          disabled={loading || results.length === 0}
          style={{
            background: "#2E7D32",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            color: "#fff",
            marginRight: 10,
            cursor: loading || results.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Export PDF
        </button>
        <button
          disabled={loading || results.length === 0}
          style={{
            background: "#1565C0",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            color: "#fff",
            cursor: loading || results.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Export Word
        </button>
      </div>

      {/* Combined summary */}
      {combinedSummary && (
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto 40px auto",
            background: "#1E1E24",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3 style={{ color: "#EB3B52" }}>Combined Summary</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 15 }}>
            {combinedSummary}
          </pre>
        </div>
      )}

      {/* Results */}
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
        {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
        {results.map(({ url, title, content }, index) => (
          <div
            key={url}
            style={{
              background: "#1A1C20",
              padding: 16,
              marginBottom: 20,
              borderRadius: 12,
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#86B7FE", fontSize: 18, fontWeight: "bold" }}
            >
              {title || url}
            </a>
            <button
              onClick={() => toggleExpand(index)}
              style={{
                display: "block",
                marginTop: 6,
                background: "transparent",
                border: "none",
                color: "#EB3B52",
                cursor: "pointer",
              }}
            >
              {expandedIndex === index ? "Hide summary ▲" : "Show summary ▼"}
            </button>
            {expandedIndex === index && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: "#ddd",
                  maxHeight: 250,
                  overflowY: "auto",
                }}
                dangerouslySetInnerHTML={{
                  __html: content || "<i>No summary available.</i>",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Recent searches */}
      <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
        <h3 style={{ marginBottom: 16 }}>Recent Searches</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {recentSearches.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#23272F",
                padding: 14,
                borderRadius: 8,
                color: "#fff",
                textAlign: "left",
              }}
            >
              <strong>{s.query}</strong>
              <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                {s.time}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#666", fontSize: 12 }}>
        Powered by advanced AI research capabilities
      </p>
    </div>
  );
}

export default SearchApp;
