@echo off
echo ============================================
echo   Smart Quiz - Project Setup
echo ============================================
echo.

echo [1/3] Installing Extension dependencies...
cd /d "%~dp0extension"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install extension dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing Backend dependencies...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/3] Setup complete!
echo.
echo Next steps:
echo   1. Copy backend\.env.example to backend\.env and add your GEMINI_API_KEY
echo   2. Run extension:  cd extension ^&^& npm run dev
echo   3. Run backend:    cd backend ^&^& npm run dev
echo   4. Load extension in Chrome: chrome://extensions ^> Developer Mode ^> Load Unpacked ^> select extension/dist
echo.
pause
