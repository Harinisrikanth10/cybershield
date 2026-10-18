@echo off
echo ========================================================
echo   Deploying CyberShield AI to Vercel...
echo ========================================================
echo.

REM Test build first
echo Running production build test...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Please review the error log above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Build succeeded! Launching Vercel deployment...
echo.
call npx vercel

echo.
echo Deployment finished.
pause
