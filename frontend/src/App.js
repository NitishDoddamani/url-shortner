import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

const API = "http://localhost:8000";

function App() {
  const [activeTab, setActiveTab] = useState("shorten");

  // Shorten state
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Analytics state
  const [shortCode, setShortCode] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const handleShorten = async () => {
    if (!longUrl.trim()) return toast.error("Please enter a URL!");
    if (!longUrl.startsWith("http")) return toast.error("URL must start with http:// or https://");

    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/shorten`, {
        original_url: longUrl,
        custom_alias: customAlias || null,
        expiry_days: parseInt(expiryDays),
      });
      setResult(res.data);
      toast.success("URL shortened successfully!");
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong!";
      toast.error(msg);
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleAnalytics = async () => {
    if (!shortCode.trim()) return toast.error("Please enter a short code!");
    
    // Strip full URL if user pastes it — extract just the code
    let code = shortCode.trim();
    if (code.includes("/")) {
      code = code.split("/").pop();
    }
    
    setAnalyticsLoading(true);
    setAnalytics(null);
    try {
      const res = await axios.get(`${API}/analytics/${code}`);
      setAnalytics(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Short URL not found!";
      toast.error(msg);
    }
    setAnalyticsLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="app">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🔗</span>
            <span className="logo-text">SnapLink</span>
          </div>
          <p className="tagline">Shorten. Share. Track.</p>
        </div>
        <div className="header-bg-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "shorten" ? "active" : ""}`}
            onClick={() => setActiveTab("shorten")}
          >
            ✂️ Shorten URL
          </button>
          <button
            className={`tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      <div className="main">

        {/* ── SHORTEN TAB ── */}
        {activeTab === "shorten" && (
          <div className="card fade-in">
            <h2 className="card-title">🚀 Create Short URL</h2>

            <div className="form-group">
              <label>Long URL <span className="required">*</span></label>
              <input
                type="text"
                placeholder="https://example.com/very-long-url..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                className="input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Custom Alias <span className="optional">(optional)</span></label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">snaplink/</span>
                  <input
                    type="text"
                    placeholder="my-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.replace(/\s/g, ""))}
                    className="input input-with-prefix"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expiry <span className="optional">(days)</span></label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="input select"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleShorten}
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Shortening...
                </span>
              ) : (
                "✂️ Shorten URL"
              )}
            </button>

            {/* Result */}
            {result && (
              <div className="result-card fade-in">
                <div className="result-header">
                  <span className="result-badge">✅ Ready to share!</span>
                </div>

                <div className="result-url-box">
                  <span className="result-short-url">{result.short_url}</span>
                  <button
                    className="btn-copy"
                    onClick={() => handleCopy(result.short_url)}
                  >
                    📋 Copy
                  </button>
                </div>

                <div className="result-meta">
                  <div className="meta-item">
                    <span className="meta-label">Original URL</span>
                    <span className="meta-value truncate">{result.original_url}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Short Code</span>
                    <span className="meta-value code">{result.short_code}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Expires</span>
                    <span className="meta-value">{formatDate(result.expires_at)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">{formatDate(result.created_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div className="card fade-in">
            <h2 className="card-title">📊 URL Analytics</h2>

            <div className="form-group">
              <label>Enter Short Code</label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">snaplink/</span>
                <input
                  type="text"
                  placeholder="abc123"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalytics()}
                  className="input input-with-prefix"
                />
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleAnalytics}
              disabled={analyticsLoading}
            >
              {analyticsLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Fetching...
                </span>
              ) : (
                "🔍 Get Analytics"
              )}
            </button>

            {analytics && (
              <div className="analytics-result fade-in">

                {/* Big click count */}
                <div className="click-count-card">
                  <div className="click-number">{analytics.click_count}</div>
                  <div className="click-label">Total Clicks</div>
                </div>

                {/* Stats grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-icon">🔗</span>
                    <span className="stat-label">Short URL</span>
                    <span className="stat-value code">{analytics.short_url}</span>
                    <button
                      className="btn-copy-small"
                      onClick={() => handleCopy(analytics.short_url)}
                    >
                      Copy
                    </button>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">🌐</span>
                    <span className="stat-label">Original URL</span>
                    <span className="stat-value truncate">{analytics.original_url}</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <span className="stat-label">Created At</span>
                    <span className="stat-value">{formatDate(analytics.created_at)}</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-label">Last Clicked</span>
                    <span className="stat-value">{formatDate(analytics.last_clicked)}</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">⏳</span>
                    <span className="stat-label">Expires At</span>
                    <span className="stat-value">{formatDate(analytics.expires_at)}</span>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">📆</span>
                    <span className="stat-label">Days Left</span>
                    <span className={`stat-value ${getDaysLeft(analytics.expires_at) <= 3 ? "danger" : "success"}`}>
                      {getDaysLeft(analytics.expires_at) !== null
                        ? `${getDaysLeft(analytics.expires_at)} days`
                        : "No expiry"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>  
        )}
      </div>

      <footer className="footer">
        <p>Built with ⚡ FastAPI · Redis · PostgreSQL · React</p>
      </footer>
    </div>
  );
}

export default App;