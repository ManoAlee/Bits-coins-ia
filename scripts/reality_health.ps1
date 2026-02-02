# Reality Engine Health Protocol [POWERSHELL DIMENSION]
# Purpose: Autonomous monitor for system stability

function Check-RealityKernel {
    $BackendUrl = "http://127.0.0.1:8081/metrics/dashboard"
    $FrontendUrl = "http://127.0.0.1:3000"
    
    Write-Host "📡 SCANNING DIMENSIONS..." -ForegroundColor Cyan

    try {
        $BackendStatus = Invoke-WebRequest -Uri $BackendUrl -Method Get -TimeoutSec 2 -UseBasicParsing
        Write-Host "✅ CORE BRAIN [8081]: ONLINE (Status: $($BackendStatus.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ CORE BRAIN [8081]: OFFLINE or DISCONNECTED" -ForegroundColor Red
    }

    try {
        $FrontendStatus = Invoke-WebRequest -Uri $FrontendUrl -Method Get -TimeoutSec 2 -UseBasicParsing
        Write-Host "✅ HUD VIEWPORT [3000]: ONLINE (Status: $($FrontendStatus.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ HUD VIEWPORT [3000]: OFFLINE" -ForegroundColor Red
    }
}

Check-RealityKernel
