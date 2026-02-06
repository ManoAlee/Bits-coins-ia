"""
API ENDPOINTS PARA SISTEMA DE UNIVERSOS
========================================

Integra o cálculo matemático dos 32 universos com o frontend,
fornecendo dados em tempo real sobre estados, energias, ressonâncias
e acoplamentos.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
from pydantic import BaseModel
import sys
import os

# Adiciona path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from mathematics.universe_calculus import (
    UniverseCalculus,
    compute_correlation_matrix,
    compute_phase_space_trajectory,
)

# Instância global do sistema de universos
universe_system = UniverseCalculus()

# Router
router = APIRouter(prefix="/universe", tags=["universe"])


# ============================================================================
# MODELS
# ============================================================================

class UniverseStateResponse(BaseModel):
    id: int
    name: str
    phi: float
    dphi_dt: float
    integral: float
    energy: float
    frequency: float
    phase: float
    entropy: float
    coupling: Dict[int, float]
    time: float


class SystemMetricsResponse(BaseModel):
    total_energy: float
    coupling_energy: float
    time: float
    universes_count: int


class ResonanceResponse(BaseModel):
    universe_i: int
    universe_j: int
    name_i: str
    name_j: str
    strength: float
    frequency_ratio: float


class CorrelationResponse(BaseModel):
    matrix: List[List[float]]
    universe_names: List[str]


class PhaseSpaceResponse(BaseModel):
    universe_id: int
    universe_name: str
    phi_values: List[float]
    dphi_values: List[float]
    time_values: List[float]


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/")
async def universe_info():
    """Informações sobre o sistema de universos"""
    return {
        "system": "32 Universe Mathematical System",
        "version": "1.0.0",
        "description": "Real-time calculation of 32 programming paradigm universes",
        "features": [
            "Differential calculus (dφ/dt)",
            "Integral calculus (∫φ dt)",
            "Energy computation (kinetic + potential)",
            "Entropy calculation (Shannon)",
            "Fourier analysis",
            "Resonance detection",
            "Coupling matrix",
            "Phase space trajectories"
        ],
        "universes": len(universe_system.universes),
        "current_time": universe_system.time
    }


@router.get("/states", response_model=List[UniverseStateResponse])
async def get_all_states():
    """Retorna estados de todos os 32 universos"""
    try:
        states = universe_system.get_all_states()
        return states
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state/{universe_id}", response_model=UniverseStateResponse)
async def get_universe_state(universe_id: int):
    """Retorna estado de um universo específico"""
    if universe_id < 0 or universe_id >= len(universe_system.universes):
        raise HTTPException(status_code=404, detail="Universe not found")
    
    try:
        state = universe_system.get_universe_state(universe_id)
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evolve")
async def evolve_system(steps: int = 1, dt: Optional[float] = None):
    """
    Evolui o sistema por N passos temporais
    
    Args:
        steps: Número de passos
        dt: Delta temporal (opcional)
    """
    if steps < 1 or steps > 10000:
        raise HTTPException(status_code=400, detail="Steps must be between 1 and 10000")
    
    try:
        for _ in range(steps):
            universe_system.evolve_step(dt=dt)
        
        return {
            "status": "success",
            "steps_evolved": steps,
            "current_time": universe_system.time,
            "total_energy": universe_system.compute_total_energy()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics", response_model=SystemMetricsResponse)
async def get_system_metrics():
    """Retorna métricas globais do sistema"""
    try:
        return {
            "total_energy": universe_system.compute_total_energy(),
            "coupling_energy": universe_system.compute_coupling_energy(),
            "time": universe_system.time,
            "universes_count": len(universe_system.universes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resonances", response_model=List[ResonanceResponse])
async def get_resonances(top_n: int = 10):
    """
    Retorna principais ressonâncias entre universos
    
    Args:
        top_n: Número de ressonâncias a retornar
    """
    if top_n < 1 or top_n > 100:
        raise HTTPException(status_code=400, detail="top_n must be between 1 and 100")
    
    try:
        resonances = universe_system.find_resonances()[:top_n]
        
        result = []
        for i, j, strength in resonances:
            u_i = universe_system.universes[i]
            u_j = universe_system.universes[j]
            
            result.append({
                "universe_i": i,
                "universe_j": j,
                "name_i": u_i.name,
                "name_j": u_j.name,
                "strength": strength,
                "frequency_ratio": u_i.frequency / u_j.frequency
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/correlation", response_model=CorrelationResponse)
async def get_correlation_matrix():
    """Retorna matriz de correlação entre universos"""
    try:
        t = universe_system.time
        correlation = compute_correlation_matrix(universe_system, t)
        
        # Converte numpy array para lista
        matrix = correlation.tolist()
        
        # Nomes dos universos
        names = [u.name for u in universe_system.universes]
        
        return {
            "matrix": matrix,
            "universe_names": names
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/phase-space/{universe_id}", response_model=PhaseSpaceResponse)
async def get_phase_space(universe_id: int, t_max: float = 100.0, n_points: int = 1000):
    """
    Retorna trajetória no espaço de fase (φ, dφ/dt)
    
    Args:
        universe_id: ID do universo
        t_max: Tempo máximo
        n_points: Número de pontos
    """
    if universe_id < 0 or universe_id >= len(universe_system.universes):
        raise HTTPException(status_code=404, detail="Universe not found")
    
    if n_points < 10 or n_points > 10000:
        raise HTTPException(status_code=400, detail="n_points must be between 10 and 10000")
    
    try:
        import numpy as np
        
        phi_values, dphi_values = compute_phase_space_trajectory(
            universe_system, universe_id, t_max, n_points
        )
        
        time_values = np.linspace(0, t_max, n_points)
        
        return {
            "universe_id": universe_id,
            "universe_name": universe_system.universes[universe_id].name,
            "phi_values": phi_values.tolist(),
            "dphi_values": dphi_values.tolist(),
            "time_values": time_values.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/spectrum/{universe_id}")
async def get_fourier_spectrum(universe_id: int, t_max: float = 100.0, n_samples: int = 10000):
    """
    Retorna espectro de Fourier de um universo
    
    Args:
        universe_id: ID do universo
        t_max: Tempo máximo para análise
        n_samples: Número de amostras
    """
    if universe_id < 0 or universe_id >= len(universe_system.universes):
        raise HTTPException(status_code=404, detail="Universe not found")
    
    try:
        frequencies, amplitudes = universe_system.compute_fourier_spectrum(
            universe_id, t_max, n_samples
        )
        
        # Pega apenas os 50 picos mais fortes
        top_indices = amplitudes.argsort()[-50:][::-1]
        
        return {
            "universe_id": universe_id,
            "universe_name": universe_system.universes[universe_id].name,
            "frequencies": frequencies[top_indices].tolist(),
            "amplitudes": amplitudes[top_indices].tolist(),
            "dominant_frequency": float(frequencies[amplitudes.argmax()])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/coupling-matrix")
async def get_coupling_matrix():
    """Retorna matriz de acoplamento entre universos"""
    try:
        matrix = universe_system.coupling_matrix.tolist()
        names = [u.name for u in universe_system.universes]
        
        return {
            "matrix": matrix,
            "universe_names": names,
            "description": "Coupling strength between universes (0.0 to 1.0)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/positions")
async def get_universe_positions():
    """
    Retorna posições 3D dos universos para visualização
    
    Distribui universos em uma esfera usando espiral de Fibonacci
    """
    import math
    
    n = len(universe_system.universes)
    positions = []
    
    # Espiral de Fibonacci para distribuição uniforme em esfera
    phi = (1 + math.sqrt(5)) / 2  # Golden ratio
    
    for i in range(n):
        # Ângulo azimutal
        theta = 2 * math.pi * i / phi
        
        # Ângulo polar
        phi_angle = math.acos(1 - 2 * (i + 0.5) / n)
        
        # Raio (varia com energia)
        u = universe_system.universes[i]
        radius = 5.0 + u.energy * 2.0
        
        # Coordenadas cartesianas
        x = radius * math.sin(phi_angle) * math.cos(theta)
        y = radius * math.sin(phi_angle) * math.sin(theta)
        z = radius * math.cos(phi_angle)
        
        positions.append({
            "id": i,
            "name": u.name,
            "position": [x, y, z],
            "energy": u.energy,
            "frequency": u.frequency
        })
    
    return {
        "positions": positions,
        "layout": "fibonacci_sphere",
        "radius_base": 5.0
    }


@router.post("/reset")
async def reset_system():
    """Reinicia o sistema de universos"""
    global universe_system
    
    try:
        universe_system = UniverseCalculus()
        
        return {
            "status": "success",
            "message": "Universe system reset to initial state",
            "time": universe_system.time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# WEBSOCKET PARA STREAMING EM TEMPO REAL
# ============================================================================

from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json

@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WebSocket para streaming de dados em tempo real
    
    Envia estados de todos os universos a cada 100ms
    """
    await websocket.accept()
    
    try:
        while True:
            # Evolui sistema
            universe_system.evolve_step()
            
            # Coleta dados
            states = universe_system.get_all_states()
            metrics = {
                "total_energy": universe_system.compute_total_energy(),
                "coupling_energy": universe_system.compute_coupling_energy(),
                "time": universe_system.time
            }
            
            # Envia dados
            data = {
                "type": "universe_update",
                "states": states,
                "metrics": metrics,
                "timestamp": universe_system.time
            }
            
            await websocket.send_json(data)
            
            # Aguarda 100ms
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        print("Client disconnected from universe stream")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()


# ============================================================================
# BACKGROUND TASK: Evolução Contínua
# ============================================================================

import threading
import time as time_module

_evolution_thread = None
_evolution_running = False

def evolution_loop():
    """Loop de evolução contínua em background"""
    global universe_system, _evolution_running
    
    while _evolution_running:
        universe_system.evolve_step(dt=0.01)
        time_module.sleep(0.01)  # 100 FPS


@router.post("/start-evolution")
async def start_evolution():
    """Inicia evolução contínua em background"""
    global _evolution_thread, _evolution_running
    
    if _evolution_running:
        return {"status": "already_running", "message": "Evolution is already running"}
    
    _evolution_running = True
    _evolution_thread = threading.Thread(target=evolution_loop, daemon=True)
    _evolution_thread.start()
    
    return {
        "status": "started",
        "message": "Continuous evolution started",
        "fps": 100
    }


@router.post("/stop-evolution")
async def stop_evolution():
    """Para evolução contínua"""
    global _evolution_running
    
    if not _evolution_running:
        return {"status": "not_running", "message": "Evolution is not running"}
    
    _evolution_running = False
    
    return {
        "status": "stopped",
        "message": "Continuous evolution stopped",
        "final_time": universe_system.time
    }


@router.get("/evolution-status")
async def get_evolution_status():
    """Retorna status da evolução contínua"""
    return {
        "running": _evolution_running,
        "current_time": universe_system.time,
        "total_energy": universe_system.compute_total_energy()
    }
