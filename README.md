# EventAI - AI-Powered Smart Event Planner

A full-stack, state-of-the-art event planning platform integrating AI capabilities for venue recommendation, crowd turnout estimation, budget breakdowns, chronological schedule generation, and a chat assistant. Built with **React.js** for the frontend and **Django REST Framework (DRF)** for the backend.

---

## Project Structure
```
/workspace
├── backend/                  # Django REST Framework Backend
│   ├── eventai_backend/      # Project settings, base URLs
│   ├── events/               # App code: models, views, serializers, urls, AI utils
│   ├── media/                # Storage folder for uploaded event banners and ticket QRs
│   ├── db.sqlite3            # Pre-seeded development database
│   ├── seed.py               # Database populator script
│   └── requirements.txt      # Python dependencies list
└── frontend/                 # Vite + React Frontend
    ├── src/
    │   ├── components/       # UI elements: Sidebar, Header, AI Forms
    │   ├── context/          # State providers: AuthContext, ThemeContext
    │   ├── pages/            # View Pages: Login, Register, Dashboard, Event details
    │   ├── App.jsx           # Main Router & layouts
    │   └── index.css         # Premium dark/light design system styles
    └── package.json          # Node dependencies list
```

---

## 1. Quick Start Setup

### Step A: Start the Django Backend

1. Navigate to the backend folder and activate the virtual environment:
   ```bash
   cd backend
   source venv/bin/activate
   ```
2. Set your Gemini API key (optional - the system has automatic local smart mock fallbacks if not configured):
   ```bash
   export GEMINI_API_KEY="your-actual-api-key-here"
   ```
3. Run the development server:
   ```bash
   python manage.py runserver
   ```
   The backend will be running at `http://127.0.0.1:8000/`.

---

### Step B: Start the React Frontend

1. Open a new terminal window, navigate to the frontend folder, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## 2. Default Test Credentials
The database has been pre-seeded with sample events and users. You can log in immediately using the following accounts:

* **Organizer Account (Create, Edit & View Statistics)**
  - **Username:** `organizer`
  - **Password:** `organizer123`
* **Regular User Account (Browse Events & Book Ticket passes)**
  - **Username:** `user`
  - **Password:** `user123`
* **Administrator Account (View full platform logs & metrics)**
  - **Username:** `admin`
  - **Password:** `admin123`

---

## 3. Advanced Configuration

### Switching from SQLite to MySQL
To transition the database to MySQL, modify the `DATABASES` setting in `backend/eventai_backend/settings.py`:

```python
# Install mysqlclient: pip install mysqlclient
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'eventai_db',
        'USER': 'your_mysql_user',
        'PASSWORD': 'your_mysql_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```
*After changing settings, run migrations and seeding again:*
```bash
python manage.py makemigrations
python manage.py migrate
python seed.py
```

### AI Suite Utilities
All AI planner tools and the chatbot execute through `backend/events/ai_utils.py`. The endpoints structure:
* **Venue Recommendation:** Matches budget constraint + headcounts with optimal spaces.
* **Crowd Turnover Predictor:** Determines turnout rates based on day of week and price.
* **Itemized Budget Planner:** Divides event category capital into venue, catering, AV, and permits.
* **Auto Itinerary Creator:** Compiles cron schedules.
* **Gemini Assistant:** Provides direct planner chat response.

---

## 4. Deployment Guide

### Backend Deployment (e.g. Render, Heroku, or AWS EC2)
1. Prepare setting configurations: Set `DEBUG = False` and define `ALLOWED_HOSTS`.
2. Configure static collections for media uploads:
   ```bash
   python manage.py collectstatic
   ```
3. Use a WSGI runner like **Gunicorn**:
   ```bash
   gunicorn eventai_backend.wsgi:application
   ```

### Frontend Deployment (e.g. Vercel, Netlify, or AWS S3)
1. Build the static production build files:
   ```bash
   npm run build
   ```
2. Upload the generated `frontend/dist/` folder contents to your static host.
3. Redirect all rewrite routing rules to `index.html` to allow React Router to handle page paths.
