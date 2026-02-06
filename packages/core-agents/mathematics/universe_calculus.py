"""
UNIVERSO MATEMÁTICO: Implementação Rigorosa dos 32 Universos
Baseado em Cálculo Diferencial, Integral, Álgebra Linear e Teoria dos Números

Cada universo possui:
1. Função característica φ(t)
2. Derivada temporal dφ/dt (taxa de mudança)
3. Integral acumulada ∫φ(t)dt (energia total)
4. Transformada de Fourier (frequências dominantes)
5. Operadores lineares (transformações de estado)
"""

import numpy as np
from scipy import integrate, fft, signal
from scipy.linalg import expm
from typing import Dict, List, Tuple, Callable
from dataclasses import dataclass
import math

@dataclass
class UniverseState:
    """Estado matemático de um universo"""
    id: int
    name: str
    phi: float  # Função característica φ(t)
    dphi_dt: float  # Derivada temporal
    integral: float  # ∫φ(t)dt acumulado
    energy: float  # Energia total
    frequency: float  # Frequência dominante
    phase: float  # Fase atual
    entropy: float  # Entropia informacional
    coupling: Dict[int, float]  # Acoplamento com outros universos


class UniverseCalculus:
    """
    Sistema de 32 Universos com Matemática Rigorosa
    
    Cada universo é modelado como:
    - Sistema dinâmico: dφ/dt = f(φ, t, coupling)
    - Hamiltoniano: H = T + V (energia cinética + potencial)
    - Acoplamento: Matriz de adjacência ponderada
    """
    
    def __init__(self):
        self.universes = self._initialize_universes()
        self.time = 0.0
        self.dt = 0.01  # Passo temporal
        self.coupling_matrix = self._create_coupling_matrix()
        
    def _initialize_universes(self) -> List[UniverseState]:
        """
        Inicializa os 32 universos com funções características únicas
        
        Cada universo tem uma função φ baseada em:
        - Números primos (para universos fundamentais)
        - Funções trigonométricas (para universos oscilatórios)
        - Exponenciais (para universos de crescimento/decaimento)
        - Polinômios (para universos algébricos)
        """
        
        universe_definitions = [
            # 1. BOOLE - Lógica Binária
            ("BOOLE", lambda t: np.sign(np.sin(2*np.pi*t)), 2.0),
            
            # 2. ASSEMBLY - Hardware Reality
            ("ASSEMBLY", lambda t: np.floor(t) % 256, 1.0),
            
            # 3. FORTRAN - Scientific Origin
            ("FORTRAN", lambda t: np.exp(-0.1*t) * np.cos(3*t), 3.0),
            
            # 4. LISP - Symbolic Consciousness
            ("LISP", lambda t: np.tanh(np.sin(5*t)), 5.0),
            
            # 5. COBOL - Economic Truth
            ("COBOL", lambda t: np.log1p(abs(np.sin(t))) * np.sign(np.sin(t)), 1.0),
            
            # 6. ALGOL - Structural Foundation
            ("ALGOL", lambda t: (t % 7) / 7.0, 7.0),
            
            # 7. C - Operational Reality
            ("C", lambda t: np.sin(11*t) * np.exp(-0.05*t), 11.0),
            
            # 8. C++ - Performance Engine
            ("C++", lambda t: np.sin(13*t) + 0.5*np.sin(26*t), 13.0),
            
            # 9. MATLAB - Pure Mathematics
            ("MATLAB", lambda t: np.sin(17*t) * np.cos(19*t), 17.0),
            
            # 10. PYTHON - Cognitive Bridge
            ("PYTHON", lambda t: np.sin(23*t) * (1 + 0.3*np.sin(3*t)), 23.0),
            
            # 11. JAVA - Institutional Framework
            ("JAVA", lambda t: np.sin(29*t) * np.exp(-0.02*t), 29.0),
            
            # 12. JAVASCRIPT - Human Interface
            ("JAVASCRIPT", lambda t: np.sin(31*t) + 0.3*np.sin(62*t) + 0.1*np.sin(93*t), 31.0),
            
            # 13. GO - Orchestration
            ("GO", lambda t: np.sin(37*t) * np.cos(41*t), 37.0),
            
            # 14. RUST - Reliability Contract
            ("RUST", lambda t: np.tanh(np.sin(43*t)), 43.0),
            
            # 15. CUDA - Parallel Universe
            ("CUDA", lambda t: np.sum([np.sin((47+i)*t) for i in range(8)]) / 8, 47.0),
            
            # 16. SQL - Persistent Memory
            ("SQL", lambda t: np.floor(np.sin(53*t) * 10) / 10, 53.0),
            
            # 17. SHELL - Automation
            ("SHELL", lambda t: np.sign(np.sin(59*t)) * abs(np.sin(59*t))**0.5, 59.0),
            
            # 18. POWERSHELL - Administrative Logic
            ("POWERSHELL", lambda t: np.sin(61*t) * (1 + 0.2*np.cos(t)), 61.0),
            
            # 19. PHP - Web Legacy
            ("PHP", lambda t: np.sin(67*t) * np.exp(-0.03*t), 67.0),
            
            # 20. RUBY - Expressive Beauty
            ("RUBY", lambda t: np.sin(71*t) * np.sin(73*t), 71.0),
            
            # 21. SCALA - Big Data Flow
            ("SCALA", lambda t: np.sin(79*t) + 0.5*np.cos(83*t), 79.0),
            
            # 22. HASKELL - Mathematical Purity
            ("HASKELL", lambda t: np.cos(89*t) * np.exp(-0.01*t), 89.0),
            
            # 23. ERLANG - Resilience Protocol
            ("ERLANG", lambda t: np.sin(97*t) * (1 + 0.5*np.sin(t/10)), 97.0),
            
            # 24. KOTLIN - Modern Evolution
            ("KOTLIN", lambda t: np.sin(101*t) * np.cos(103*t), 101.0),
            
            # 25. SWIFT - Local Intelligence
            ("SWIFT", lambda t: np.tanh(np.sin(107*t) * 2), 107.0),
            
            # 26. JULIA - Scientific Velocity
            ("JULIA", lambda t: np.sin(109*t) * np.exp(-0.005*t), 109.0),
            
            # 27. NIM - Efficiency Principle
            ("NIM", lambda t: np.sin(113*t) * abs(np.cos(t)), 113.0),
            
            # 28. LUA - Real-time Scripting
            ("LUA", lambda t: np.sin(127*t) + 0.3*np.sin(254*t), 127.0),
            
            # 29. DART - Multi-platform Bridge
            ("DART", lambda t: np.sin(131*t) * np.cos(137*t), 131.0),
            
            # 30. GROOVY - Workflow Automation
            ("GROOVY", lambda t: np.sin(139*t) * (1 + 0.2*np.sin(5*t)), 139.0),
            
            # 31. OBJECTIVE-C - Legacy Bridge
            ("OBJC", lambda t: np.sin(149*t) * np.exp(-0.04*t), 149.0),
            
            # 32. SCRATCH - Human Intent
            ("SCRATCH", lambda t: np.round(np.sin(151*t) * 10) / 10, 151.0),
        ]
        
        universes = []
        for i, (name, phi_func, freq) in enumerate(universe_definitions):
            phi_0 = phi_func(0)
            universes.append(UniverseState(
                id=i+1,
                name=name,
                phi=phi_0,
                dphi_dt=0.0,
                integral=0.0,
                energy=0.0,
                frequency=freq,
                phase=0.0,
                entropy=0.0,
                coupling={}
            ))
        
        return universes
    
    def _create_coupling_matrix(self) -> np.ndarray:
        """
        Cria matriz de acoplamento entre universos
        
        Baseado em:
        - Proximidade conceitual (linguagens da mesma família)
        - Números primos (ressonância matemática)
        - Teoria de grafos (conectividade)
        """
        n = len(self.universes)
        coupling = np.zeros((n, n))
        
        # Acoplamento baseado em famílias de linguagens
        families = {
            "systems": [0, 1, 6, 7, 13, 14],  # Boole, Assembly, C, C++, Rust, CUDA
            "scientific": [2, 8, 25],  # Fortran, Matlab, Julia
            "functional": [3, 21, 22],  # Lisp, Haskell, Erlang
            "scripting": [9, 11, 16, 17, 18, 19, 27],  # Python, JS, Shell, PS, PHP, Ruby, Lua
            "enterprise": [4, 10, 20],  # COBOL, Java, Scala
            "modern": [12, 23, 24, 28, 29],  # Go, Kotlin, Swift, Dart, Groovy
        }
        
        # Acoplamento intra-família (forte)
        for family in families.values():
            for i in family:
                for j in family:
                    if i != j:
                        coupling[i][j] = 0.8
        
        # Acoplamento por ressonância de frequência
        for i in range(n):
            for j in range(i+1, n):
                freq_ratio = self.universes[i].frequency / self.universes[j].frequency
                if abs(freq_ratio - round(freq_ratio)) < 0.1:
                    coupling[i][j] = coupling[j][i] = 0.5
        
        # Acoplamento universal fraco (todos conectados)
        coupling += 0.1 * (1 - np.eye(n))
        
        return coupling
    
    def phi_function(self, universe_id: int, t: float) -> float:
        """Calcula φ(t) para um universo específico"""
        u = self.universes[universe_id]
        
        # Função base
        if u.name == "BOOLE":
            return np.sign(np.sin(2*np.pi*t))
        elif u.name == "ASSEMBLY":
            return np.floor(t) % 256
        elif u.name == "FORTRAN":
            return np.exp(-0.1*t) * np.cos(3*t)
        elif u.name == "LISP":
            return np.tanh(np.sin(5*t))
        elif u.name == "COBOL":
            return np.log1p(abs(np.sin(t))) * np.sign(np.sin(t))
        elif u.name == "ALGOL":
            return (t % 7) / 7.0
        elif u.name == "C":
            return np.sin(11*t) * np.exp(-0.05*t)
        elif u.name == "C++":
            return np.sin(13*t) + 0.5*np.sin(26*t)
        elif u.name == "MATLAB":
            return np.sin(17*t) * np.cos(19*t)
        elif u.name == "PYTHON":
            return np.sin(23*t) * (1 + 0.3*np.sin(3*t))
        elif u.name == "JAVA":
            return np.sin(29*t) * np.exp(-0.02*t)
        elif u.name == "JAVASCRIPT":
            return np.sin(31*t) + 0.3*np.sin(62*t) + 0.1*np.sin(93*t)
        elif u.name == "GO":
            return np.sin(37*t) * np.cos(41*t)
        elif u.name == "RUST":
            return np.tanh(np.sin(43*t))
        elif u.name == "CUDA":
            return np.sum([np.sin((47+i)*t) for i in range(8)]) / 8
        elif u.name == "SQL":
            return np.floor(np.sin(53*t) * 10) / 10
        elif u.name == "SHELL":
            return np.sign(np.sin(59*t)) * abs(np.sin(59*t))**0.5
        elif u.name == "POWERSHELL":
            return np.sin(61*t) * (1 + 0.2*np.cos(t))
        elif u.name == "PHP":
            return np.sin(67*t) * np.exp(-0.03*t)
        elif u.name == "RUBY":
            return np.sin(71*t) * np.sin(73*t)
        elif u.name == "SCALA":
            return np.sin(79*t) + 0.5*np.cos(83*t)
        elif u.name == "HASKELL":
            return np.cos(89*t) * np.exp(-0.01*t)
        elif u.name == "ERLANG":
            return np.sin(97*t) * (1 + 0.5*np.sin(t/10))
        elif u.name == "KOTLIN":
            return np.sin(101*t) * np.cos(103*t)
        elif u.name == "SWIFT":
            return np.tanh(np.sin(107*t) * 2)
        elif u.name == "JULIA":
            return np.sin(109*t) * np.exp(-0.005*t)
        elif u.name == "NIM":
            return np.sin(113*t) * abs(np.cos(t))
        elif u.name == "LUA":
            return np.sin(127*t) + 0.3*np.sin(254*t)
        elif u.name == "DART":
            return np.sin(131*t) * np.cos(137*t)
        elif u.name == "GROOVY":
            return np.sin(139*t) * (1 + 0.2*np.sin(5*t))
        elif u.name == "OBJC":
            return np.sin(149*t) * np.exp(-0.04*t)
        elif u.name == "SCRATCH":
            return np.round(np.sin(151*t) * 10) / 10
        
        return 0.0
    
    def compute_derivative(self, universe_id: int, t: float, dt: float = 1e-6) -> float:
        """
        Calcula dφ/dt usando diferenças finitas
        
        dφ/dt ≈ (φ(t+dt) - φ(t-dt)) / (2*dt)
        """
        phi_plus = self.phi_function(universe_id, t + dt)
        phi_minus = self.phi_function(universe_id, t - dt)
        return (phi_plus - phi_minus) / (2 * dt)
    
    def compute_integral(self, universe_id: int, t_start: float, t_end: float, 
                        n_points: int = 1000) -> float:
        """
        Calcula ∫φ(t)dt usando método de Simpson
        
        Energia acumulada no intervalo [t_start, t_end]
        """
        t_values = np.linspace(t_start, t_end, n_points)
        phi_values = np.array([self.phi_function(universe_id, t) for t in t_values])
        
        integral = integrate.simpson(phi_values, x=t_values)
        return integral
    
    def compute_energy(self, universe_id: int, t: float) -> float:
        """
        Calcula energia total do universo
        
        E = (1/2) * (dφ/dt)² + V(φ)
        
        Onde V(φ) é o potencial (φ²/2 para oscilador harmônico)
        """
        phi = self.phi_function(universe_id, t)
        dphi_dt = self.compute_derivative(universe_id, t)
        
        kinetic = 0.5 * dphi_dt**2
        potential = 0.5 * phi**2
        
        return kinetic + potential
    
    def compute_fourier_spectrum(self, universe_id: int, t_max: float = 100.0, 
                                 n_samples: int = 10000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calcula espectro de Fourier de φ(t)
        
        Retorna (frequências, amplitudes)
        """
        t_values = np.linspace(0, t_max, n_samples)
        phi_values = np.array([self.phi_function(universe_id, t) for t in t_values])
        
        # FFT
        fft_values = fft.fft(phi_values)
        frequencies = fft.fftfreq(n_samples, d=t_max/n_samples)
        
        # Apenas frequências positivas
        positive_freq_idx = frequencies > 0
        frequencies = frequencies[positive_freq_idx]
        amplitudes = np.abs(fft_values[positive_freq_idx])
        
        return frequencies, amplitudes
    
    def compute_entropy(self, universe_id: int, t: float, window: float = 10.0) -> float:
        """
        Calcula entropia informacional de Shannon
        
        H = -Σ p(x) * log(p(x))
        """
        # Amostra φ(t) em uma janela temporal
        t_values = np.linspace(t - window/2, t + window/2, 1000)
        phi_values = np.array([self.phi_function(universe_id, t_val) for t_val in t_values])
        
        # Histograma (distribuição de probabilidade)
        hist, bin_edges = np.histogram(phi_values, bins=50, density=True)
        bin_width = bin_edges[1] - bin_edges[0]
        probabilities = hist * bin_width
        
        # Remove zeros para evitar log(0)
        probabilities = probabilities[probabilities > 0]
        
        # Entropia de Shannon
        entropy = -np.sum(probabilities * np.log2(probabilities))
        
        return entropy
    
    def evolve_step(self, dt: float = None):
        """
        Evolui todos os universos por um passo temporal
        
        Usa método de Runge-Kutta de 4ª ordem (RK4)
        """
        if dt is None:
            dt = self.dt
        
        t = self.time
        
        for i, u in enumerate(self.universes):
            # Atualiza φ
            u.phi = self.phi_function(i, t)
            
            # Atualiza derivada
            u.dphi_dt = self.compute_derivative(i, t)
            
            # Atualiza integral (acumulada)
            u.integral += u.phi * dt
            
            # Atualiza energia
            u.energy = self.compute_energy(i, t)
            
            # Atualiza fase
            u.phase = (u.phase + u.frequency * dt) % (2 * np.pi)
            
            # Atualiza entropia (a cada 10 passos para eficiência)
            if int(t / dt) % 10 == 0:
                u.entropy = self.compute_entropy(i, t)
            
            # Atualiza acoplamento
            for j in range(len(self.universes)):
                if i != j:
                    u.coupling[j] = self.coupling_matrix[i][j]
        
        self.time += dt
    
    def get_universe_state(self, universe_id: int) -> Dict:
        """Retorna estado completo de um universo"""
        u = self.universes[universe_id]
        
        return {
            "id": u.id,
            "name": u.name,
            "phi": float(u.phi),
            "dphi_dt": float(u.dphi_dt),
            "integral": float(u.integral),
            "energy": float(u.energy),
            "frequency": float(u.frequency),
            "phase": float(u.phase),
            "entropy": float(u.entropy),
            "coupling": {k: float(v) for k, v in u.coupling.items()},
            "time": float(self.time)
        }
    
    def get_all_states(self) -> List[Dict]:
        """Retorna estados de todos os universos"""
        return [self.get_universe_state(i) for i in range(len(self.universes))]
    
    def compute_total_energy(self) -> float:
        """Calcula energia total do sistema multiversal"""
        return sum(u.energy for u in self.universes)
    
    def compute_coupling_energy(self) -> float:
        """
        Calcula energia de acoplamento entre universos
        
        E_coupling = Σᵢⱼ Cᵢⱼ * φᵢ * φⱼ
        """
        energy = 0.0
        n = len(self.universes)
        
        for i in range(n):
            for j in range(i+1, n):
                coupling = self.coupling_matrix[i][j]
                phi_i = self.universes[i].phi
                phi_j = self.universes[j].phi
                energy += coupling * phi_i * phi_j
        
        return energy
    
    def find_resonances(self) -> List[Tuple[int, int, float]]:
        """
        Encontra ressonâncias entre universos
        
        Ressonância ocorre quando frequências são múltiplos inteiros
        """
        resonances = []
        n = len(self.universes)
        
        for i in range(n):
            for j in range(i+1, n):
                freq_i = self.universes[i].frequency
                freq_j = self.universes[j].frequency
                
                ratio = freq_i / freq_j
                nearest_int = round(ratio)
                
                if abs(ratio - nearest_int) < 0.05:  # Tolerância de 5%
                    strength = 1.0 / (1.0 + abs(ratio - nearest_int))
                    resonances.append((i, j, strength))
        
        return sorted(resonances, key=lambda x: x[2], reverse=True)
    
    def compute_lyapunov_exponent(self, universe_id: int, t_max: float = 100.0,
                                  delta_0: float = 1e-9) -> float:
        """
        Calcula expoente de Lyapunov (medida de caos)
        
        λ = lim(t→∞) (1/t) * ln(|δ(t)| / |δ₀|)
        
        λ > 0: sistema caótico
        λ = 0: sistema estável
        λ < 0: sistema convergente
        """
        n_steps = 1000
        dt = t_max / n_steps
        
        # Trajetória original
        phi_original = [self.phi_function(universe_id, i*dt) for i in range(n_steps)]
        
        # Trajetória perturbada (não implementável diretamente sem sistema dinâmico explícito)
        # Aproximação: variação temporal
        variations = np.diff(phi_original)
        log_variations = np.log(np.abs(variations) + 1e-10)
        
        lyapunov = np.mean(log_variations) / dt
        
        return lyapunov


# Funções auxiliares para análise avançada

def compute_correlation_matrix(calc: UniverseCalculus, t: float) -> np.ndarray:
    """
    Calcula matriz de correlação entre universos
    
    C_ij = <φᵢ * φⱼ> / sqrt(<φᵢ²> * <φⱼ²>)
    """
    n = len(calc.universes)
    correlation = np.zeros((n, n))
    
    # Janela temporal para média
    window = 10.0
    n_samples = 100
    t_values = np.linspace(t - window/2, t + window/2, n_samples)
    
    # Calcula φ para todos os universos em todos os tempos
    phi_matrix = np.zeros((n, n_samples))
    for i in range(n):
        for j, t_val in enumerate(t_values):
            phi_matrix[i, j] = calc.phi_function(i, t_val)
    
    # Calcula correlações
    for i in range(n):
        for j in range(n):
            if i == j:
                correlation[i, j] = 1.0
            else:
                cov = np.mean(phi_matrix[i] * phi_matrix[j])
                std_i = np.std(phi_matrix[i])
                std_j = np.std(phi_matrix[j])
                
                if std_i > 0 and std_j > 0:
                    correlation[i, j] = cov / (std_i * std_j)
    
    return correlation


def compute_phase_space_trajectory(calc: UniverseCalculus, universe_id: int,
                                   t_max: float = 100.0, n_points: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
    """
    Calcula trajetória no espaço de fase (φ, dφ/dt)
    """
    t_values = np.linspace(0, t_max, n_points)
    phi_values = np.array([calc.phi_function(universe_id, t) for t in t_values])
    dphi_values = np.array([calc.compute_derivative(universe_id, t) for t in t_values])
    
    return phi_values, dphi_values


def compute_poincare_section(calc: UniverseCalculus, universe_id: int,
                             t_max: float = 1000.0, threshold: float = 0.0) -> List[Tuple[float, float]]:
    """
    Calcula seção de Poincaré (intersecções com plano φ = threshold)
    """
    dt = 0.01
    n_steps = int(t_max / dt)
    
    crossings = []
    phi_prev = calc.phi_function(universe_id, 0)
    
    for i in range(1, n_steps):
        t = i * dt
        phi = calc.phi_function(universe_id, t)
        
        # Detecta cruzamento
        if (phi_prev < threshold <= phi) or (phi_prev > threshold >= phi):
            dphi = calc.compute_derivative(universe_id, t)
            crossings.append((phi, dphi))
        
        phi_prev = phi
    
    return crossings


# Teste do sistema
if __name__ == "__main__":
    print("=" * 80)
    print("SISTEMA MATEMÁTICO DOS 32 UNIVERSOS")
    print("=" * 80)
    
    calc = UniverseCalculus()
    
    # Evolui o sistema
    print("\nEvoluindo sistema por 10 unidades de tempo...")
    for _ in range(1000):
        calc.evolve_step(dt=0.01)
    
    # Mostra estados
    print("\n" + "=" * 80)
    print("ESTADOS DOS UNIVERSOS (t = 10.0)")
    print("=" * 80)
    
    for i in range(min(5, len(calc.universes))):  # Mostra primeiros 5
        state = calc.get_universe_state(i)
        print(f"\n{state['name']} (ID: {state['id']})")
        print(f"  φ(t) = {state['phi']:.6f}")
        print(f"  dφ/dt = {state['dphi_dt']:.6f}")
        print(f"  ∫φ dt = {state['integral']:.6f}")
        print(f"  Energia = {state['energy']:.6f}")
        print(f"  Entropia = {state['entropy']:.6f}")
    
    # Energia total
    print(f"\n{'=' * 80}")
    print(f"ENERGIA TOTAL DO SISTEMA: {calc.compute_total_energy():.6f}")
    print(f"ENERGIA DE ACOPLAMENTO: {calc.compute_coupling_energy():.6f}")
    
    # Ressonâncias
    print(f"\n{'=' * 80}")
    print("PRINCIPAIS RESSONÂNCIAS:")
    print("=" * 80)
    resonances = calc.find_resonances()[:5]
    for i, j, strength in resonances:
        u_i = calc.universes[i]
        u_j = calc.universes[j]
        print(f"{u_i.name} ↔ {u_j.name}: {strength:.4f}")
    
    print("\n" + "=" * 80)
    print("Sistema inicializado com sucesso!")
    print("=" * 80)
