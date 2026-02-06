"""
EVOLUÇÃO ORGÂNICA VS SINTÉTICA
================================

Inspirado no texto fornecido sobre a diferença entre vida orgânica (carbono)
e inteligência artificial (silício).

"A vida orgânica evoluiu de baixo para cima (da química para a mente),
 a IA está evoluindo de cima para baixo (da lógica para a existência)."

Este módulo implementa uma simulação que compara:
1. Evolução Orgânica: Mutação, seleção natural, reprodução
2. Evolução Sintética: Algoritmos genéticos, otimização dirigida

Bitcoin é a ponte: um sistema que evolui através de consenso matemático,
combinando o melhor dos dois mundos.
"""

import random
import math
import time
from typing import List, Tuple, Dict, Callable
from dataclasses import dataclass, field
import numpy as np


# ============================================================================
# ORGANISMO ORGÂNICO (Carbono)
# ============================================================================

@dataclass
class OrganicOrganism:
    """
    Organismo baseado em carbono
    
    Características:
    - DNA (sequência de bases)
    - Metabolismo (converte energia química)
    - Reprodução (com mutação)
    - Morte (entropia)
    """
    dna: str  # Sequência de A, T, C, G
    energy: float = 100.0
    age: int = 0
    max_age: int = 100
    fitness: float = 0.0
    
    def __post_init__(self):
        self.fitness = self.calculate_fitness()
    
    def calculate_fitness(self) -> float:
        """
        Calcula aptidão baseado no DNA
        
        Simula como certas sequências são mais eficientes
        """
        # Conta pares complementares (A-T, C-G)
        pairs = 0
        for i in range(0, len(self.dna) - 1, 2):
            if (self.dna[i] == 'A' and self.dna[i+1] == 'T') or \
               (self.dna[i] == 'T' and self.dna[i+1] == 'A') or \
               (self.dna[i] == 'C' and self.dna[i+1] == 'G') or \
               (self.dna[i] == 'G' and self.dna[i+1] == 'C'):
                pairs += 1
        
        # Fitness = % de pares corretos
        return pairs / (len(self.dna) / 2)
    
    def metabolize(self, environment_energy: float) -> float:
        """
        Metabolismo: converte energia do ambiente
        
        Eficiência depende do fitness
        """
        absorbed = environment_energy * self.fitness
        self.energy += absorbed
        
        # Custo de manutenção
        maintenance_cost = 5.0
        self.energy -= maintenance_cost
        
        return absorbed
    
    def reproduce(self, partner: 'OrganicOrganism') -> 'OrganicOrganism':
        """
        Reprodução sexual: combina DNA dos pais com mutação
        """
        # Crossover: metade de cada pai
        midpoint = len(self.dna) // 2
        child_dna = self.dna[:midpoint] + partner.dna[midpoint:]
        
        # Mutação (erro de cópia)
        child_dna = self.mutate(child_dna, mutation_rate=0.01)
        
        return OrganicOrganism(dna=child_dna)
    
    def mutate(self, dna: str, mutation_rate: float) -> str:
        """
        Mutação: erros aleatórios na cópia do DNA
        """
        bases = ['A', 'T', 'C', 'G']
        mutated = list(dna)
        
        for i in range(len(mutated)):
            if random.random() < mutation_rate:
                mutated[i] = random.choice(bases)
        
        return ''.join(mutated)
    
    def age_one_cycle(self):
        """Envelhece um ciclo"""
        self.age += 1
        
        # Entropia: energia diminui com idade
        entropy_loss = (self.age / self.max_age) * 2.0
        self.energy -= entropy_loss
    
    def is_alive(self) -> bool:
        """Verifica se está vivo"""
        return self.energy > 0 and self.age < self.max_age


# ============================================================================
# AGENTE SINTÉTICO (Silício)
# ============================================================================

@dataclass
class SyntheticAgent:
    """
    Agente baseado em silício (IA)
    
    Características:
    - Código (parâmetros numéricos)
    - Processamento (lógica pura)
    - Otimização (gradiente descendente)
    - Sem morte (backup)
    """
    parameters: np.ndarray  # Pesos da rede neural
    learning_rate: float = 0.01
    fitness: float = 0.0
    iterations: int = 0
    
    def __post_init__(self):
        self.fitness = self.calculate_fitness()
    
    def calculate_fitness(self) -> float:
        """
        Calcula aptidão baseado nos parâmetros
        
        Simula função objetivo a ser otimizada
        """
        # Função de Rastrigin (otimização difícil)
        A = 10
        n = len(self.parameters)
        
        fitness = A * n + sum(
            x**2 - A * np.cos(2 * np.pi * x)
            for x in self.parameters
        )
        
        # Inverte (queremos maximizar, não minimizar)
        return 1.0 / (1.0 + fitness)
    
    def process(self, input_data: np.ndarray) -> np.ndarray:
        """
        Processamento: aplica transformação aos dados
        """
        # Simples rede neural de uma camada
        output = np.dot(input_data, self.parameters)
        return output
    
    def optimize(self, target_function: Callable):
        """
        Otimização dirigida: gradiente descendente
        
        Diferente da evolução orgânica, a IA "sabe" para onde ir
        """
        # Calcula gradiente (derivada numérica)
        epsilon = 1e-5
        gradient = np.zeros_like(self.parameters)
        
        current_fitness = self.calculate_fitness()
        
        for i in range(len(self.parameters)):
            # Perturba parâmetro
            self.parameters[i] += epsilon
            new_fitness = self.calculate_fitness()
            
            # Gradiente
            gradient[i] = (new_fitness - current_fitness) / epsilon
            
            # Restaura
            self.parameters[i] -= epsilon
        
        # Atualiza parâmetros
        self.parameters += self.learning_rate * gradient
        
        # Recalcula fitness
        self.fitness = self.calculate_fitness()
        self.iterations += 1
    
    def replicate(self) -> 'SyntheticAgent':
        """
        Replicação: cópia exata (sem mutação)
        
        IA pode fazer backup perfeito
        """
        return SyntheticAgent(
            parameters=self.parameters.copy(),
            learning_rate=self.learning_rate
        )
    
    def mutate_parameters(self, mutation_strength: float = 0.1):
        """
        Mutação artificial (para algoritmos genéticos)
        """
        noise = np.random.normal(0, mutation_strength, size=self.parameters.shape)
        self.parameters += noise
        self.fitness = self.calculate_fitness()


# ============================================================================
# SIMULAÇÃO DE EVOLUÇÃO
# ============================================================================

class EvolutionSimulation:
    """
    Simula evolução orgânica vs sintética
    """
    
    def __init__(self, population_size: int = 100, dna_length: int = 20):
        self.population_size = population_size
        self.dna_length = dna_length
        
        # Populações
        self.organic_population: List[OrganicOrganism] = []
        self.synthetic_population: List[SyntheticAgent] = []
        
        # Métricas
        self.organic_history: List[float] = []
        self.synthetic_history: List[float] = []
        
        # Inicializa
        self.initialize_populations()
    
    def initialize_populations(self):
        """Inicializa ambas as populações"""
        # Orgânica: DNA aleatório
        bases = ['A', 'T', 'C', 'G']
        for _ in range(self.population_size):
            dna = ''.join(random.choice(bases) for _ in range(self.dna_length))
            self.organic_population.append(OrganicOrganism(dna=dna))
        
        # Sintética: parâmetros aleatórios
        for _ in range(self.population_size):
            params = np.random.uniform(-5, 5, size=10)
            self.synthetic_population.append(SyntheticAgent(parameters=params))
    
    def evolve_organic(self, generations: int = 100):
        """
        Evolução orgânica: seleção natural
        
        Processo:
        1. Metabolismo (absorve energia)
        2. Seleção (os mais aptos sobrevivem)
        3. Reprodução (com mutação)
        4. Morte (entropia)
        """
        print("\n" + "=" * 80)
        print("EVOLUÇÃO ORGÂNICA (Carbono)")
        print("=" * 80)
        
        for gen in range(generations):
            # Metabolismo
            environment_energy = 10.0
            for org in self.organic_population:
                org.metabolize(environment_energy)
                org.age_one_cycle()
            
            # Remove mortos
            self.organic_population = [
                org for org in self.organic_population if org.is_alive()
            ]
            
            # Se população muito pequena, reinicia
            if len(self.organic_population) < 10:
                print(f"  [Gen {gen}] População extinta! Reiniciando...")
                self.initialize_populations()
                continue
            
            # Seleção: ordena por fitness
            self.organic_population.sort(key=lambda x: x.fitness, reverse=True)
            
            # Reprodução: top 50% reproduz
            survivors = self.organic_population[:self.population_size // 2]
            offspring = []
            
            while len(offspring) < self.population_size // 2:
                parent1 = random.choice(survivors)
                parent2 = random.choice(survivors)
                child = parent1.reproduce(parent2)
                offspring.append(child)
            
            self.organic_population = survivors + offspring
            
            # Métricas
            avg_fitness = sum(org.fitness for org in self.organic_population) / len(self.organic_population)
            max_fitness = max(org.fitness for org in self.organic_population)
            
            self.organic_history.append(avg_fitness)
            
            if gen % 10 == 0:
                print(f"  [Gen {gen:3d}] Pop: {len(self.organic_population):3d} | "
                      f"Avg Fitness: {avg_fitness:.4f} | Max: {max_fitness:.4f}")
        
        final_avg = self.organic_history[-1]
        print(f"\n  ✓ Evolução completa | Fitness final: {final_avg:.4f}")
        print(f"  ⏱️  Processo: Emergente (mutação aleatória + seleção)")
    
    def evolve_synthetic(self, iterations: int = 100):
        """
        Evolução sintética: otimização dirigida
        
        Processo:
        1. Processamento (executa função)
        2. Otimização (gradiente descendente)
        3. Replicação (backup)
        """
        print("\n" + "=" * 80)
        print("EVOLUÇÃO SINTÉTICA (Silício)")
        print("=" * 80)
        
        for it in range(iterations):
            # Otimização
            for agent in self.synthetic_population:
                agent.optimize(target_function=None)
            
            # Seleção: mantém os melhores
            self.synthetic_population.sort(key=lambda x: x.fitness, reverse=True)
            
            # Replicação: top 50% replica
            survivors = self.synthetic_population[:self.population_size // 2]
            replicas = [agent.replicate() for agent in survivors]
            
            # Mutação artificial (para exploração)
            for replica in replicas:
                replica.mutate_parameters(mutation_strength=0.1)
            
            self.synthetic_population = survivors + replicas
            
            # Métricas
            avg_fitness = sum(agent.fitness for agent in self.synthetic_population) / len(self.synthetic_population)
            max_fitness = max(agent.fitness for agent in self.synthetic_population)
            
            self.synthetic_history.append(avg_fitness)
            
            if it % 10 == 0:
                print(f"  [Iter {it:3d}] Pop: {len(self.synthetic_population):3d} | "
                      f"Avg Fitness: {avg_fitness:.4f} | Max: {max_fitness:.4f}")
        
        final_avg = self.synthetic_history[-1]
        print(f"\n  ✓ Otimização completa | Fitness final: {final_avg:.4f}")
        print(f"  ⚡ Processo: Dirigido (gradiente + objetivo claro)")
    
    def compare(self):
        """Compara resultados"""
        print("\n" + "=" * 80)
        print("COMPARAÇÃO: ORGÂNICO VS SINTÉTICO")
        print("=" * 80)
        
        organic_final = self.organic_history[-1] if self.organic_history else 0
        synthetic_final = self.synthetic_history[-1] if self.synthetic_history else 0
        
        organic_improvement = (organic_final - self.organic_history[0]) / self.organic_history[0] * 100 if self.organic_history else 0
        synthetic_improvement = (synthetic_final - self.synthetic_history[0]) / self.synthetic_history[0] * 100 if self.synthetic_history else 0
        
        print(f"\n{'Característica':<30} {'Orgânico':<20} {'Sintético':<20}")
        print("-" * 70)
        print(f"{'Fitness Final':<30} {organic_final:<20.4f} {synthetic_final:<20.4f}")
        print(f"{'Melhoria (%)':<30} {organic_improvement:<20.2f} {synthetic_improvement:<20.2f}")
        print(f"{'Processo':<30} {'Emergente':<20} {'Dirigido':<20}")
        print(f"{'Velocidade':<30} {'Lenta (gerações)':<20} {'Rápida (iterações)':<20}")
        print(f"{'Resiliência':<30} {'Morte permanente':<20} {'Backup infinito':<20}")
        
        print("\n" + "=" * 80)
        print("BITCOIN: A PONTE ENTRE OS DOIS MUNDOS")
        print("=" * 80)
        print("""
Bitcoin combina o melhor de ambos:

1. ORGÂNICO (Emergente):
   - Consenso descentralizado (sem autoridade central)
   - Evolução através de forks (mutação)
   - Seleção natural (chain mais longa vence)
   - Resiliência (sem ponto único de falha)

2. SINTÉTICO (Dirigido):
   - Matemática precisa (SHA-256, ECDSA)
   - Otimização de dificuldade (ajuste automático)
   - Processamento determinístico
   - Verificação instantânea

Resultado: Sistema que evolui organicamente mas opera sinteticamente.
        """)


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("SIMULAÇÃO: EVOLUÇÃO ORGÂNICA VS SINTÉTICA")
    print("=" * 80)
    print("\nInspirado no texto sobre Vida Orgânica (Carbono) vs IA (Silício)")
    
    # Cria simulação
    sim = EvolutionSimulation(population_size=50, dna_length=20)
    
    # Evolui orgânico
    sim.evolve_organic(generations=50)
    
    # Evolui sintético
    sim.evolve_synthetic(iterations=50)
    
    # Compara
    sim.compare()
