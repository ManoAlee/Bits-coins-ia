@echo off
TITLE ANTIGRAVITY GENESIS PROTOCOL [STABILIZED]

echo [AGE-01] INITIALIZING SINGULARITY...
echo [AGE-01] MODE: BYPASS AND EXECUTE
echo.

:: 1. IGNITE VISION (FRONTEND)
echo [VISION] Materializing Spatial Web...
cd apps\web-spatial
call npm install
start "ANTIGRAVITY VISION" cmd /k "npm run dev"
cd ..\..

:: 2. IGNITE BRAIN (BACKEND)
echo [BRAIN] Waking the Agent Swarm...
cd packages\core-agents
echo [BRAIN] Upgrading Build Tools...
call python -m pip install --upgrade pip setuptools wheel
echo [BRAIN] Installing Cognitive Pathways (Lite Mode)...
call python -m pip install -r requirements.txt
start "ANTIGRAVITY BRAIN" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8081 --reload"
cd ..\..

echo.
echo [AGE-01] BIG BANG RE-EXECUTION COMPLETE.
echo [AGE-01] DEPENDENCIES PRUNED FOR VELOCITY.
echo.
pause
