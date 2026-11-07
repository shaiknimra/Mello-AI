Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Mello AI Development Environment..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

# Start Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\.venv\Scripts\Activate.ps1; uvicorn backend.app.main:app --reload --port 8000"

# Start Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Both servers launched in background windows!" -ForegroundColor Green
Write-Host "-> Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "-> Backend:  http://localhost:8000" -ForegroundColor Yellow
