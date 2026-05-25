# EventAI - AI-Powered Smart Event Planner

A full-stack, state-of-the-art event planning platform integrating AI capabilities for venue recommendation, crowd turnout estimation, budget breakdowns, chronological schedule generation, and a chat assistant. Built with **React.js** for the frontend and **FastAPI** (with SQLite, SQLAlchemy, and JWT) for the backend.

---

## Project Structure
```
/workspace
├── backend/                  # FastAPI Backend
│   ├── main.py               # Main application entry point & API routes
│   ├── auth.py               # JWT authentication helper functions & middleware
│   ├── models.py             # SQLAlchemy database models (Users, Events, Bookings, etc.)
│   ├── schemas.py            # Pydantic validation models for request/response bodies
│   ├── database.py           # SQLAlchemy database configuration and session setup
│   ├── ai_utils.py           # AI planner tools & Gemini API coordination scripts
│   ├── db.sqlite3            # Seeded SQLite development database file
│   ├── seed.py               # Database seeder script
│   └── requirements.txt      # Backend Python dependencies list
└── frontend/                 # Vite + React Frontend
    ├── src/
    │   ├── components/       # UI components (Sidebar, Header, AI Forms, etc.)
    │   ├── context/          # State managers (AuthContext, ThemeContext)
    │   ├── pages/            # Page layouts (Dashboard, LandingPage, Profile, EventDetails, etc.)
    │   ├── App.jsx           # Main router config & guarded layouts
    │   └── index.css         # Premium design system styles
    └── package.json          # Node dependencies list
```

---

## 1. Quick Start Setup

### Step A: Start the FastAPI Backend

1. Navigate to the backend folder and activate the virtual environment:
   ```bash
   cd backend
   source venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your Gemini API key (optional - the system has automatic local smart mock fallbacks if not configured):
   ```bash
   export GEMINI_API_KEY="your-actual-api-key-here"
   ```
4. Run the development server using Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will be running at `http://127.0.0.1:8000/` with interactive OpenAPI documentation available at `http://127.0.0.1:8000/docs`.

---

### Step B: Start the React Frontend

1. Navigate to the frontend folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` (or the console's allocated dev server URL) in your browser.

---

## 2. Default Test Credentials
The database has been pre-seeded with sample events and users. You can log in immediately using the following accounts:

* **Regular User Account (Browse Events, Book Passes, complete profile pass)**
  - **Username:** `user`
  - **Password:** `user123`
* **Organizer Account (Staging Events & View Booking Statistics)**
  - **Username:** `organizer`
  - **Password:** `organizer123`
* **Administrator Account (View full platform metrics)**
  - **Username:** `admin`
  - **Password:** `admin123`

---

## 3. Advanced Configuration

### Switching from SQLite to MySQL
To transition the database to MySQL, modify the connection URL string inside `backend/database.py`:

```python
# Install pymysql and cryptography: pip install pymysql cryptography
# Replace sqlite connection string:
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://your_mysql_user:your_mysql_password@localhost:3306/eventai_db"
```
*After changing the connection string, tables will auto-generate on start, and you can re-seed the new database:*
```bash
python seed.py
```

### AI Suite Utilities
All AI planner calculations execute through `backend/ai_utils.py` and are mapped to endpoints in `backend/main.py`:
* **Venue Recommendation:** Evaluates headcounts and budget ranges against spaces.
* **Crowd Turnover Predictor:** Yields expected turnout margins by analyzing staging dates/times.
* **Itemized Budget Planner:** Dynamically splits event category capitals (venue, catering, AV).
* **Auto Itinerary Creator:** Compiles chronological event sequences.
* **Gemini Assistant:** Drives direct interactive coordination conversations.

---

## 4. Deployment Guide

### Backend Deployment (e.g. Render, Heroku, or AWS EC2)
1. Ensure your production environment sets environment variables like `GEMINI_API_KEY`.
2. Deploy using a production-ready ASGI server like Uvicorn or Gunicorn with uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

### Frontend Deployment (e.g. Vercel, Netlify, or AWS S3)
1. Compile the production bundles:
   ```bash
   npm run build
   ```
2. Deploy the static contents of the generated `frontend/dist/` directory.
3. Configure your host server to rewrite all routes back to `index.html` to allow React Router to handle dynamic client-side paths.
