# 🔗 SnapLink — URL Shortener

A high-performance, full-stack URL shortening service built with **FastAPI**, **Redis**, **PostgreSQL**, and **React**.  
Shorten URLs, set custom aliases, track click analytics — all containerized with **Docker Compose**.

---

## 🖥️ Application Demo (UI Screenshots)

📌 **1️⃣ Shorten URL — Home Page**
<p align="center"> <img src="images/page1.png" width="80%" /> </p>

Clean modern interface to paste long URLs, set a custom alias, and choose expiry.

✅ **2️⃣ Short URL Created**
<p align="center"> <img src="images/page2.png" width="80%" /> </p>

Instantly generates short URL with one-click copy, expiry date, and short code details.

📊 **3️⃣ Analytics Dashboard**
<p align="center"> <img src="images/page3.png" width="80%" /> </p>

Real-time click analytics showing total clicks, last clicked time, expiry countdown, and original URL.

---

## 🚀 Features

- ✂️ Shorten any long URL to a compact short link
- 🎯 Custom aliases — pick your own short code (e.g. `snaplink/my-link`)
- ⏳ URL expiry — auto-expire links after 1, 7, 30, 90 days or 1 year
- ⚡ Redis O(1) caching for ultra-fast redirects
- 📊 Click analytics — total clicks, last clicked, expiry countdown
- 🛡️ Collision-resistant ID generation for auto short codes
- 🚦 Rate limiting to prevent abuse
- 🐳 Fully containerized with Docker Compose — one command setup

---

## 🏗️ Tech Stack

| Layer            | Technology                        |
|------------------|-----------------------------------|
| Backend          | Python, FastAPI                   |
| Cache            | Redis (O(1) redirects)            |
| Database         | PostgreSQL (persistent storage)   |
| Frontend         | React, Axios                      |
| Containerization | Docker, Docker Compose            |

---

## 📁 Project Structure

```
url-shortener/
├── docker-compose.yml              # Orchestrates all services
├── backend/
│   ├── Dockerfile                  # Backend container
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # FastAPI app entry point
│       ├── config.py               # Environment settings
│       ├── database.py             # PostgreSQL connection
│       ├── redis_client.py         # Redis connection
│       ├── models.py               # SQLAlchemy DB models
│       ├── schemas.py              # Pydantic request/response schemas
│       └── routers/
│           ├── url.py              # Shorten + redirect endpoints
│           └── analytics.py        # Click analytics endpoint
└── frontend/
    ├── Dockerfile                  # Frontend container (nginx)
    ├── .env                        # API base URL config
    └── src/
        ├── App.js                  # Main React component
        └── App.css                 # Styles
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running

That's it — Docker handles everything else! ✅

---

### 🐳 Run with Docker (One Command)

**Step 1 — Clone the repository**
```bash
git clone https://github.com/NitishDoddamani/url-shortener.git
cd url-shortener
```

**Step 2 — Start all services**
```bash
docker-compose up --build
```

All 4 services start automatically:

| Service       | URL                        |
|---------------|----------------------------|
| 🌐 Frontend   | http://localhost:3000       |
| ⚙️ Backend    | http://localhost:8000       |
| 📖 API Docs   | http://localhost:8000/docs  |
| 🗄️ PostgreSQL | localhost:5432              |
| ⚡ Redis       | localhost:6379              |

**Step 3 — Stop**
```bash
docker-compose down
```

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| POST   | `/shorten`                  | Create a short URL           |
| GET    | `/{short_code}`             | Redirect to original URL     |
| GET    | `/analytics/{short_code}`   | Get click analytics          |
| GET    | `/health`                   | Health check                 |

### Example — Shorten URL

```bash
curl -X POST "http://localhost:8000/shorten" \
  -H "Content-Type: application/json" \
  -d '{
    "original_url": "https://example.com/very-long-url",
    "custom_alias": "my-link",
    "expiry_days": 7
  }'
```

**Response:**
```json
{
  "short_code": "my-link",
  "short_url": "http://localhost:8000/my-link",
  "original_url": "https://example.com/very-long-url",
  "expires_at": "2026-03-03T12:00:00Z",
  "created_at": "2026-02-24T12:00:00Z"
}
```

### Example — Get Analytics

```bash
curl "http://localhost:8000/analytics/my-link"
```

**Response:**
```json
{
  "short_code": "my-link",
  "original_url": "https://example.com/very-long-url",
  "click_count": 42,
  "created_at": "2026-02-24T12:00:00Z",
  "expires_at": "2026-03-03T12:00:00Z",
  "last_clicked": "2026-02-24T13:45:00Z",
  "short_url": "http://localhost:8000/my-link"
}
```

---

## 🧠 How It Works

```
User submits long URL
        ↓
FastAPI generates short code (auto or custom alias)
        ↓
URL saved to PostgreSQL (persistent storage)
        ↓
URL cached in Redis (fast lookup)
        ↓
User visits short URL
        ↓
Redis cache checked first (O(1) lookup)
    ↓ HIT              ↓ MISS
Redirect           Check PostgreSQL
immediately        → Cache in Redis
                   → Redirect
        ↓
Click count updated in PostgreSQL
```

---

## 🐳 Docker Architecture

```
docker-compose up
      ├── frontend  (React → nginx)     :3000
      ├── backend   (FastAPI)           :8000
      ├── db        (PostgreSQL 15)     :5432
      └── redis     (Redis 7 Alpine)    :6379
```

- PostgreSQL data persists via `postgres_data` Docker volume
- Redis data persists via `redis_data` Docker volume
- Both survive container restarts

---

## 🔮 Future Improvements

- [ ] QR code generation for each short URL
- [ ] Password-protected short URLs
- [ ] Dashboard showing all created links
- [ ] Click analytics with geo-location
- [ ] Custom domain support
- [ ] Link preview before redirect

---

## 👨‍💻 Author

**Nitish Doddamani**  
[GitHub Profile](https://github.com/NitishDoddamani)

---

## 📄 License

MIT License
