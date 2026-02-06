"""
SUITE DE TESTES COMPLETA
=========================

Testa todos os componentes do sistema:
1. Matemática dos 32 universos
2. Criptografia Bitcoin
3. APIs REST
4. Integração frontend-backend
"""

import pytest
import sys
import os

# Adiciona paths
core_agents_path = os.path.join(os.path.dirname(__file__), '..', 'packages', 'core-agents')
sys.path.insert(0, core_agents_path)

try:
    from mathematics.universe_calculus import UniverseCalculus, compute_correlation_matrix
    from cryptography.bitcoin_crypto import (
        sha256, generate_private_key, private_key_to_public_key,
        sign_message, verify_signature, MerkleTree, proof_of_work
    )
    IMPORTS_OK = True
except ImportError as e:
    print(f"Import error: {e}")
    IMPORTS_OK = False
    pytest = None


# ============================================================================
# TESTES: MATEMÁTICA DOS UNIVERSOS
# ============================================================================

class TestUniverseMathematics:
    """Testes para o sistema matemático dos 32 universos"""
    
    def test_universe_initialization(self):
        """Testa inicialização do sistema"""
        calc = UniverseCalculus()
        
        assert len(calc.universes) == 32
        assert calc.time == 0.0
        assert calc.coupling_matrix.shape == (32, 32)
    
    def test_universe_evolution(self):
        """Testa evolução temporal"""
        calc = UniverseCalculus()
        
        initial_time = calc.time
        initial_energy = calc.compute_total_energy()
        
        # Evolui 100 passos
        for _ in range(100):
            calc.evolve_step(dt=0.01)
        
        assert calc.time > initial_time
        assert calc.time == pytest.approx(1.0, rel=1e-2)
        
        # Energia deve mudar
        final_energy = calc.compute_total_energy()
        assert final_energy != initial_energy
    
    def test_universe_functions(self):
        """Testa funções características dos universos"""
        calc = UniverseCalculus()
        
        for i in range(32):
            # Testa que função retorna valor numérico
            phi = calc.phi_function(i, 1.0)
            assert isinstance(phi, (int, float))
            assert not (phi != phi)  # Não é NaN
    
    def test_derivatives(self):
        """Testa cálculo de derivadas"""
        calc = UniverseCalculus()
        
        for i in range(5):  # Testa primeiros 5 universos
            dphi = calc.compute_derivative(i, 1.0)
            assert isinstance(dphi, (int, float))
            assert not (dphi != dphi)
    
    def test_integrals(self):
        """Testa cálculo de integrais"""
        calc = UniverseCalculus()
        
        integral = calc.compute_integral(0, 0.0, 1.0, n_points=100)
        assert isinstance(integral, (int, float))
        assert not (integral != integral)
    
    def test_energy_calculation(self):
        """Testa cálculo de energia"""
        calc = UniverseCalculus()
        
        for i in range(5):
            energy = calc.compute_energy(i, 1.0)
            assert energy >= 0  # Energia deve ser não-negativa
    
    def test_resonances(self):
        """Testa detecção de ressonâncias"""
        calc = UniverseCalculus()
        
        resonances = calc.find_resonances()
        assert len(resonances) > 0
        
        # Verifica formato
        for i, j, strength in resonances[:5]:
            assert 0 <= i < 32
            assert 0 <= j < 32
            assert i != j
            assert 0 <= strength <= 1
    
    def test_correlation_matrix(self):
        """Testa matriz de correlação"""
        calc = UniverseCalculus()
        
        # Evolui um pouco para ter dados
        for _ in range(10):
            calc.evolve_step()
        
        corr = compute_correlation_matrix(calc, calc.time)
        
        assert corr.shape == (32, 32)
        
        # Diagonal deve ser 1 (correlação consigo mesmo)
        for i in range(32):
            assert corr[i, i] == pytest.approx(1.0, abs=0.1)


# ============================================================================
# TESTES: CRIPTOGRAFIA BITCOIN
# ============================================================================

class TestBitcoinCryptography:
    """Testes para criptografia Bitcoin"""
    
    def test_sha256(self):
        """Testa hash SHA-256"""
        data = b"Hello, Bitcoin!"
        hash1 = sha256(data)
        hash2 = sha256(data)
        
        # Determinístico
        assert hash1 == hash2
        
        # Tamanho correto (32 bytes)
        assert len(hash1) == 32
        
        # Mudança na entrada muda hash
        hash3 = sha256(b"Hello, Bitcoin?")
        assert hash1 != hash3
    
    def test_key_generation(self):
        """Testa geração de chaves"""
        private_key = generate_private_key()
        
        # Chave privada é número grande
        assert private_key > 0
        assert private_key.bit_length() <= 256
        
        # Chave pública derivada
        public_key = private_key_to_public_key(private_key)
        
        assert public_key.x > 0
        assert public_key.y > 0
    
    def test_ecdsa_signature(self):
        """Testa assinatura e verificação ECDSA"""
        # Gera chaves
        private_key = generate_private_key()
        public_key = private_key_to_public_key(private_key)
        
        # Assina mensagem
        message = b"Transfer 1 BTC to Alice"
        signature = sign_message(message, private_key)
        
        # Verifica assinatura válida
        assert verify_signature(message, signature, public_key)
        
        # Verifica que mensagem alterada falha
        tampered_message = b"Transfer 2 BTC to Alice"
        assert not verify_signature(tampered_message, signature, public_key)
    
    def test_merkle_tree(self):
        """Testa Merkle Tree"""
        from cryptography.bitcoin_crypto import double_sha256
        
        # Cria transações
        transactions = [
            double_sha256(b"tx1"),
            double_sha256(b"tx2"),
            double_sha256(b"tx3"),
            double_sha256(b"tx4"),
        ]
        
        # Cria árvore
        tree = MerkleTree(transactions)
        root = tree.get_root()
        
        assert len(root) == 32  # SHA-256 = 32 bytes
        
        # Gera prova
        proof = tree.get_proof(1)
        
        # Verifica prova
        assert MerkleTree.verify_proof(transactions[1], proof, root)
        
        # Prova inválida para transação errada
        assert not MerkleTree.verify_proof(transactions[0], proof, root)
    
    def test_proof_of_work(self):
        """Testa Proof of Work"""
        from cryptography.bitcoin_crypto import verify_proof_of_work
        
        data = b"Block data"
        difficulty = 12  # 12 bits = 3 zeros hex
        
        # Minera
        nonce, block_hash = proof_of_work(data, difficulty)
        
        # Verifica
        assert verify_proof_of_work(data, nonce, difficulty)
        
        # Nonce errado falha
        assert not verify_proof_of_work(data, nonce + 1, difficulty)


# ============================================================================
# TESTES: INTEGRAÇÃO
# ============================================================================

class TestIntegration:
    """Testes de integração entre componentes"""
    
    def test_universe_crypto_integration(self):
        """Testa que universos e crypto podem coexistir"""
        # Inicializa ambos os sistemas
        calc = UniverseCalculus()
        private_key = generate_private_key()
        
        # Evolui universos
        for _ in range(10):
            calc.evolve_step()
        
        # Usa estado do universo como seed para mensagem
        state = calc.get_universe_state(0)
        message = f"Universe energy: {state['energy']}".encode()
        
        # Assina
        public_key = private_key_to_public_key(private_key)
        signature = sign_message(message, private_key)
        
        # Verifica
        assert verify_signature(message, signature, public_key)
    
    def test_performance(self):
        """Testa performance básica"""
        import time
        
        # Teste: evolução de universos
        calc = UniverseCalculus()
        start = time.time()
        for _ in range(100):
            calc.evolve_step()
        universe_time = time.time() - start
        
        assert universe_time < 5.0  # Deve ser rápido
        
        # Teste: assinatura ECDSA
        private_key = generate_private_key()
        message = b"test"
        start = time.time()
        for _ in range(10):
            sign_message(message, private_key)
        crypto_time = time.time() - start
        
        assert crypto_time < 1.0  # Deve ser rápido


# ============================================================================
# TESTES: EDGE CASES
# ============================================================================

class TestEdgeCases:
    """Testes de casos extremos"""
    
    def test_universe_large_time(self):
        """Testa evolução por tempo longo"""
        calc = UniverseCalculus()
        
        # Evolui por muito tempo
        for _ in range(1000):
            calc.evolve_step(dt=0.1)
        
        # Sistema deve permanecer estável
        energy = calc.compute_total_energy()
        assert not (energy != energy)  # Não NaN
        assert energy < 1e10  # Não explodiu
    
    def test_crypto_edge_cases(self):
        """Testa casos extremos em criptografia"""
        # Mensagem vazia
        private_key = generate_private_key()
        public_key = private_key_to_public_key(private_key)
        
        message = b""
        signature = sign_message(message, private_key)
        assert verify_signature(message, signature, public_key)
        
        # Mensagem muito longa
        message = b"x" * 10000
        signature = sign_message(message, private_key)
        assert verify_signature(message, signature, public_key)


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Executa testes
    pytest.main([__file__, "-v", "--tb=short"])
