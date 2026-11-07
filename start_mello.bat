@echo off
echo ===================================================
echo Starting Mello AI Development Environment...
echo ===================================================

echo Starting FastAPI Backend on http://localhost:8000 ...
start "Mello Backend" cmd /k "cd backend && .venv\Scripts\activate && uvicorn backend.app.main:app --reload --port 8000"

echo Starting React Frontend on http://localhost:5173 ...
start "Mello Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are launching in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend Docs: http://localhost:8000/docs
echo ===================================================
pause
