@echo off
title Inazuma Eleven Explorer - Dev Server
cd /d "%~dp0"

echo ===================================================
echo   INAZUMA ELEVEN EXPLORER - AVVIO SERVER LOCALE
echo ===================================================
echo.

:: Verifica presenza di node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRORE] Node.js non e installato o non e presente nel PATH!
    echo Scaricalo e installalo da: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Verifica se node_modules e presente
if not exist "node_modules\" (
    echo [INFO] Cartella node_modules non trovata. Installazione dipendenze in corso...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRORE] Installazione dipendenze fallita.
        pause
        exit /b 1
    )
)

echo [INFO] Server pronto all'indirizzo: http://localhost:3000
echo [INFO] Avvio del server di sviluppo (Vite)...
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERRORE] Il server si e arrestato.
    pause
)
