@echo off
echo Starting SmartBlock - Complete DApp Platform
echo ==========================================

echo.
echo Step 1: Installing dependencies for all components...
call npm run install-all

echo.
echo Step 2: Starting all services...
echo.
echo Opening terminals for each service:
echo - Blockchain Node (Hardhat)
echo - AI Engine
echo - Backend Server
echo - Frontend (React)
echo.

REM Start blockchain in new window
echo Starting Blockchain Node...
start "SmartBlock - Blockchain" cmd /k "cd Project_Backend && npm run node"

REM Wait a bit for blockchain to start
timeout /t 5 /nobreak

REM Start AI Engine in new window
echo Starting AI Engine...
start "SmartBlock - AI Engine" cmd /k "cd ai-engine && node api.js"

REM Start Backend Server in new window
echo Starting Backend Server...
start "SmartBlock - Server" cmd /k "cd server && npm run dev"

REM Start Frontend in new window
echo Starting Frontend...
start "SmartBlock - Frontend" cmd /k "cd frontend && npm run dev"

REM Wait before deploying contracts
timeout /t 10 /nobreak

REM Deploy contracts in new window
echo Deploying Smart Contracts...
start "SmartBlock - Deploy Contracts" cmd /k "cd Project_Backend && npm run deploy:local && pause"

echo.
echo ==========================================
echo All SmartBlock services are starting...
echo.
echo Services will open in separate windows:
echo - Blockchain: Running local Hardhat node
echo - AI Engine: Running on configured port
echo - Server: Running in development mode
echo - Frontend: Usually at http://localhost:5173
echo - Contracts: Will deploy after blockchain is ready
echo.
echo Press any key to exit this launcher...
pause