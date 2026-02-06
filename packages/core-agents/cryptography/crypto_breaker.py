"""
ANÁLISE DE SEGURANÇA CRIPTOGRÁFICA E TENTATIVAS DE QUEBRA
==========================================================

Este módulo implementa diversos ataques criptográficos para demonstrar
a segurança (ou falta dela) de diferentes sistemas:

1. Brute Force Attack (SHA-256)
2. Birthday Attack (colisões de hash)
3. Rainbow Tables (reversão de hash)
4. Nonce Reuse Attack (ECDSA)
5. Weak Random Number Generator Attack
6. Length Extension Attack (SHA-256)
7. Timing Attack (comparação de strings)
8. Side-Channel Analysis

AVISO: Este código é apenas para fins educacionais e de pesquisa!
"""

import time
import hashlib
import secrets
import multiprocessing as mp
from typing import Optional, Dict, List, Tuple
from collections import defaultdict
import itertools

from bitcoin_crypto import (
    sha256, double_sha256, hash160,
    generate_private_key, private_key_to_public_key,
    sign_message, verify_signature,
    Secp256k1, Point, Signature
)


# ============================================================================
# ATAQUE 1: BRUTE FORCE (SHA-256)
# ============================================================================

class BruteForceAttack:
    """
    Ataque de força bruta em hash SHA-256
    
    Objetivo: Encontrar entrada que produz hash específico
    Complexidade: O(2^256) - IMPOSSÍVEL na prática
    
    Para demonstração, usamos hash truncado (primeiros N bits)
    """
    
    @staticmethod
    def find_preimage(target_hash: bytes, max_attempts: int = 1_000_000,
                     charset: str = "abcdefghijklmnopqrstuvwxyz0123456789",
                     max_length: int = 6) -> Optional[bytes]:
        """
        Tenta encontrar pré-imagem de um hash
        
        Args:
            target_hash: Hash alvo (truncado para primeiros 4 bytes)
            max_attempts: Número máximo de tentativas
            charset: Conjunto de caracteres para testar
            max_length: Comprimento máximo da string
        
        Returns:
            Pré-imagem se encontrada, None caso contrário
        """
        target_prefix = target_hash[:4]  # Primeiros 4 bytes
        attempts = 0
        
        print(f"[BRUTE FORCE] Procurando pré-imagem para {target_prefix.hex()}...")
        start_time = time.time()
        
        # Testa todas as combinações até max_length
        for length in range(1, max_length + 1):
            for combo in itertools.product(charset, repeat=length):
                if attempts >= max_attempts:
                    print(f"[BRUTE FORCE] Máximo de tentativas atingido: {attempts}")
                    return None
                
                candidate = ''.join(combo).encode()
                candidate_hash = sha256(candidate)
                
                attempts += 1
                
                if attempts % 10000 == 0:
                    elapsed = time.time() - start_time
                    rate = attempts / elapsed
                    print(f"  Tentativas: {attempts:,} | Taxa: {rate:,.0f} hash/s")
                
                if candidate_hash[:4] == target_prefix:
                    elapsed = time.time() - start_time
                    print(f"[BRUTE FORCE] ✓ Pré-imagem encontrada!")
                    print(f"  Input: {candidate.decode()}")
                    print(f"  Hash: {candidate_hash.hex()}")
                    print(f"  Tentativas: {attempts:,}")
                    print(f"  Tempo: {elapsed:.2f}s")
                    return candidate
        
        return None
    
    @staticmethod
    def estimate_time_to_crack(bits: int, hash_rate: float = 1e9) -> float:
        """
        Estima tempo para quebrar hash de N bits
        
        Args:
            bits: Número de bits de segurança
            hash_rate: Taxa de hash (hashes por segundo)
        
        Returns:
            Tempo estimado em segundos
        """
        attempts = 2 ** bits
        seconds = attempts / hash_rate
        
        years = seconds / (365.25 * 24 * 3600)
        
        print(f"[ESTIMATIVA] Quebrar hash de {bits} bits:")
        print(f"  Taxa de hash: {hash_rate:,.0f} H/s")
        print(f"  Tentativas necessárias: 2^{bits} = {attempts:,.0e}")
        print(f"  Tempo estimado: {seconds:.2e} segundos")
        print(f"  Equivalente a: {years:.2e} anos")
        
        # Comparação
        age_of_universe = 13.8e9  # anos
        if years > age_of_universe:
            ratio = years / age_of_universe
            print(f"  ⚠️  Isso é {ratio:.2e}x a idade do universo!")
        
        return seconds


# ============================================================================
# ATAQUE 2: BIRTHDAY ATTACK (Colisões)
# ============================================================================

class BirthdayAttack:
    """
    Ataque de aniversário para encontrar colisões de hash
    
    Paradoxo do aniversário: Em um grupo de 23 pessoas, há 50% de chance
    de duas terem o mesmo aniversário.
    
    Para hash de n bits, colisão esperada após ~2^(n/2) tentativas
    SHA-256 (256 bits): ~2^128 tentativas (ainda impraticável)
    """
    
    @staticmethod
    def find_collision(bits: int = 32, max_attempts: int = 1_000_000) -> Optional[Tuple[bytes, bytes]]:
        """
        Tenta encontrar colisão de hash
        
        Args:
            bits: Número de bits do hash (truncado)
            max_attempts: Número máximo de tentativas
        
        Returns:
            (input1, input2) se colisão encontrada
        """
        print(f"[BIRTHDAY ATTACK] Procurando colisão em {bits} bits...")
        print(f"  Colisões esperadas após ~2^{bits//2} = {2**(bits//2):,} tentativas")
        
        hash_table: Dict[bytes, bytes] = {}
        start_time = time.time()
        
        for i in range(max_attempts):
            # Gera input aleatório
            input_data = secrets.token_bytes(16)
            
            # Calcula hash truncado
            full_hash = sha256(input_data)
            truncated_hash = full_hash[:bits//8]
            
            # Verifica colisão
            if truncated_hash in hash_table:
                original_input = hash_table[truncated_hash]
                if original_input != input_data:
                    elapsed = time.time() - start_time
                    print(f"[BIRTHDAY ATTACK] ✓ Colisão encontrada!")
                    print(f"  Input 1: {original_input.hex()}")
                    print(f"  Input 2: {input_data.hex()}")
                    print(f"  Hash: {truncated_hash.hex()}")
                    print(f"  Tentativas: {i+1:,}")
                    print(f"  Tempo: {elapsed:.2f}s")
                    return (original_input, input_data)
            
            hash_table[truncated_hash] = input_data
            
            if (i + 1) % 10000 == 0:
                elapsed = time.time() - start_time
                rate = (i + 1) / elapsed
                print(f"  Tentativas: {i+1:,} | Taxa: {rate:,.0f} hash/s")
        
        print(f"[BIRTHDAY ATTACK] ✗ Colisão não encontrada em {max_attempts:,} tentativas")
        return None


# ============================================================================
# ATAQUE 3: RAINBOW TABLES
# ============================================================================

class RainbowTable:
    """
    Rainbow Tables: Tabelas pré-computadas para reversão de hash
    
    Trade-off tempo-memória: pré-computa hashes para acelerar ataques
    
    Defesa: Salt (adiciona dados aleatórios antes de fazer hash)
    """
    
    def __init__(self, charset: str = "abcdefghijklmnopqrstuvwxyz0123456789",
                 max_length: int = 4, chain_length: int = 1000):
        self.charset = charset
        self.max_length = max_length
        self.chain_length = chain_length
        self.table: Dict[bytes, bytes] = {}
    
    def _reduce(self, hash_value: bytes, iteration: int) -> bytes:
        """
        Função de redução: converte hash de volta para input
        (não é inversão real, apenas mapeia para espaço de entrada)
        """
        # Usa hash como seed para gerar string
        seed = int.from_bytes(hash_value[:4], 'big') + iteration
        length = (seed % self.max_length) + 1
        
        result = ''
        for _ in range(length):
            result += self.charset[seed % len(self.charset)]
            seed //= len(self.charset)
        
        return result.encode()
    
    def generate(self, num_chains: int = 1000):
        """Gera rainbow table"""
        print(f"[RAINBOW TABLE] Gerando {num_chains} cadeias...")
        start_time = time.time()
        
        for i in range(num_chains):
            # Ponto inicial aleatório
            start_point = secrets.token_bytes(self.max_length)
            
            # Segue cadeia
            current = start_point
            for j in range(self.chain_length):
                hash_val = sha256(current)
                current = self._reduce(hash_val, j)
            
            # Armazena endpoint
            endpoint_hash = sha256(current)
            self.table[endpoint_hash] = start_point
            
            if (i + 1) % 100 == 0:
                print(f"  Progresso: {i+1}/{num_chains}")
        
        elapsed = time.time() - start_time
        print(f"[RAINBOW TABLE] ✓ Tabela gerada em {elapsed:.2f}s")
        print(f"  Tamanho: {len(self.table)} entradas")
        print(f"  Cobertura: ~{len(self.table) * self.chain_length:,} hashes")
    
    def lookup(self, target_hash: bytes) -> Optional[bytes]:
        """Procura pré-imagem na rainbow table"""
        print(f"[RAINBOW TABLE] Procurando {target_hash.hex()[:16]}...")
        
        # Tenta cada posição na cadeia
        for i in range(self.chain_length):
            current_hash = target_hash
            
            # Segue cadeia até endpoint
            for j in range(i, self.chain_length):
                current = self._reduce(current_hash, j)
                current_hash = sha256(current)
            
            # Verifica se endpoint está na tabela
            if current_hash in self.table:
                # Reconstrói cadeia desde o início
                start_point = self.table[current_hash]
                current = start_point
                
                for j in range(self.chain_length):
                    if sha256(current) == target_hash:
                        print(f"[RAINBOW TABLE] ✓ Pré-imagem encontrada!")
                        print(f"  Input: {current.hex()}")
                        return current
                    
                    hash_val = sha256(current)
                    current = self._reduce(hash_val, j)
        
        print(f"[RAINBOW TABLE] ✗ Pré-imagem não encontrada")
        return None


# ============================================================================
# ATAQUE 4: NONCE REUSE (ECDSA)
# ============================================================================

class NonceReuseAttack:
    """
    Ataque de reutilização de nonce em ECDSA
    
    Se o mesmo nonce k é usado para assinar duas mensagens diferentes,
    a chave privada pode ser recuperada!
    
    Matemática:
    s₁ = k⁻¹(e₁ + r·d) mod n
    s₂ = k⁻¹(e₂ + r·d) mod n
    
    Subtraindo:
    s₁ - s₂ = k⁻¹(e₁ - e₂) mod n
    k = (e₁ - e₂) / (s₁ - s₂) mod n
    
    Depois:
    d = (s·k - e) / r mod n
    """
    
    @staticmethod
    def recover_private_key(msg1: bytes, sig1: Signature,
                           msg2: bytes, sig2: Signature) -> Optional[int]:
        """
        Recupera chave privada de duas assinaturas com mesmo nonce
        
        Args:
            msg1, msg2: Mensagens assinadas
            sig1, sig2: Assinaturas correspondentes
        
        Returns:
            Chave privada se recuperada com sucesso
        """
        print("[NONCE REUSE ATTACK] Tentando recuperar chave privada...")
        
        # Verifica se r é igual (indica mesmo nonce)
        if sig1.r != sig2.r:
            print("  ✗ Assinaturas não usam mesmo nonce (r diferente)")
            return None
        
        print(f"  ✓ Mesmo nonce detectado (r = {hex(sig1.r)[:18]}...)")
        
        # Calcula hashes das mensagens
        e1 = int.from_bytes(double_sha256(msg1), 'big')
        e2 = int.from_bytes(double_sha256(msg2), 'big')
        
        r = sig1.r
        s1 = sig1.s
        s2 = sig2.s
        n = Secp256k1.n
        
        # Recupera k
        k = ((e1 - e2) * pow(s1 - s2, -1, n)) % n
        print(f"  ✓ Nonce recuperado: k = {hex(k)[:18]}...")
        
        # Recupera chave privada
        private_key = ((s1 * k - e1) * pow(r, -1, n)) % n
        print(f"  ✓ Chave privada recuperada: {hex(private_key)[:18]}...")
        
        return private_key
    
    @staticmethod
    def demonstrate_attack():
        """Demonstra ataque de reutilização de nonce"""
        print("\n" + "=" * 80)
        print("DEMONSTRAÇÃO: ATAQUE DE REUTILIZAÇÃO DE NONCE")
        print("=" * 80)
        
        # Gera chave
        private_key = generate_private_key()
        public_key = private_key_to_public_key(private_key)
        
        print(f"\n[1] Chave privada original: {hex(private_key)[:18]}...")
        
        # Assina duas mensagens com MESMO nonce (VULNERÁVEL!)
        msg1 = b"Transfer 1 BTC to Alice"
        msg2 = b"Transfer 2 BTC to Bob"
        
        # Simula nonce fixo (NUNCA FAÇA ISSO!)
        fixed_nonce = 12345678901234567890
        
        # Assina manualmente com nonce fixo
        e1 = int.from_bytes(double_sha256(msg1), 'big')
        e2 = int.from_bytes(double_sha256(msg2), 'big')
        
        G = Point(Secp256k1.Gx, Secp256k1.Gy)
        from bitcoin_crypto import point_multiply
        R = point_multiply(fixed_nonce, G)
        
        r = R.x % Secp256k1.n
        k_inv = pow(fixed_nonce, -1, Secp256k1.n)
        
        s1 = (k_inv * (e1 + r * private_key)) % Secp256k1.n
        s2 = (k_inv * (e2 + r * private_key)) % Secp256k1.n
        
        sig1 = Signature(r, s1)
        sig2 = Signature(r, s2)
        
        print(f"\n[2] Assinaturas criadas (com nonce reutilizado)")
        print(f"  Mensagem 1: {msg1.decode()}")
        print(f"  Assinatura 1: r={hex(sig1.r)[:18]}..., s={hex(sig1.s)[:18]}...")
        print(f"  Mensagem 2: {msg2.decode()}")
        print(f"  Assinatura 2: r={hex(sig2.r)[:18]}..., s={hex(sig2.s)[:18]}...")
        
        # Ataque!
        print(f"\n[3] Executando ataque...")
        recovered_key = NonceReuseAttack.recover_private_key(msg1, sig1, msg2, sig2)
        
        # Verifica
        print(f"\n[4] Verificação:")
        if recovered_key == private_key:
            print(f"  ✓ SUCESSO! Chave privada recuperada corretamente!")
            print(f"  ⚠️  LIÇÃO: NUNCA reutilize nonce em ECDSA!")
        else:
            print(f"  ✗ Falha na recuperação")


# ============================================================================
# ATAQUE 5: WEAK RNG (Gerador de Números Aleatórios Fraco)
# ============================================================================

class WeakRNGAttack:
    """
    Ataque em geradores de números aleatórios fracos
    
    Se o RNG é previsível, pode-se prever chaves privadas!
    
    Exemplo: Sony PlayStation 3 (2010)
    - Usaram nonce fixo k=4 para assinar atualizações
    - Hackers recuperaram chave privada e assinaram código customizado
    """
    
    @staticmethod
    def test_randomness(samples: List[int], num_bins: int = 10) -> float:
        """
        Testa qualidade de aleatoriedade usando chi-quadrado
        
        Returns:
            Chi-quadrado (quanto menor, mais aleatório)
        """
        # Distribui amostras em bins
        max_val = max(samples)
        bin_size = max_val // num_bins
        
        observed = [0] * num_bins
        for sample in samples:
            bin_idx = min(sample // bin_size, num_bins - 1)
            observed[bin_idx] += 1
        
        # Frequência esperada (uniforme)
        expected = len(samples) / num_bins
        
        # Chi-quadrado
        chi_squared = sum((obs - expected)**2 / expected for obs in observed)
        
        return chi_squared
    
    @staticmethod
    def demonstrate_weak_rng():
        """Demonstra perigo de RNG fraco"""
        print("\n" + "=" * 80)
        print("DEMONSTRAÇÃO: ATAQUE EM RNG FRACO")
        print("=" * 80)
        
        # RNG forte (secrets)
        print("\n[1] RNG Forte (secrets.randbelow):")
        strong_samples = [secrets.randbelow(1000000) for _ in range(1000)]
        strong_chi = WeakRNGAttack.test_randomness(strong_samples)
        print(f"  Chi-quadrado: {strong_chi:.2f}")
        print(f"  ✓ Distribuição uniforme (aleatório)")
        
        # RNG fraco (LCG simples)
        print("\n[2] RNG Fraco (Linear Congruential Generator):")
        seed = 12345
        weak_samples = []
        for _ in range(1000):
            seed = (1103515245 * seed + 12345) % (2**31)
            weak_samples.append(seed % 1000000)
        
        weak_chi = WeakRNGAttack.test_randomness(weak_samples)
        print(f"  Chi-quadrado: {weak_chi:.2f}")
        
        if weak_chi > strong_chi * 2:
            print(f"  ⚠️  Distribuição não-uniforme (previsível)")
            print(f"  ⚠️  Chaves geradas com este RNG são INSEGURAS!")


# ============================================================================
# ATAQUE 6: TIMING ATTACK
# ============================================================================

class TimingAttack:
    """
    Ataque de tempo: explora variações no tempo de execução
    
    Exemplo: comparação de strings byte-a-byte
    - Se comparação para no primeiro byte diferente, tempo varia
    - Atacante pode descobrir senha byte por byte!
    """
    
    @staticmethod
    def vulnerable_compare(a: bytes, b: bytes) -> bool:
        """Comparação VULNERÁVEL (para no primeiro byte diferente)"""
        if len(a) != len(b):
            return False
        
        for i in range(len(a)):
            if a[i] != b[i]:
                return False
            # Simula operação lenta
            time.sleep(0.0001)
        
        return True
    
    @staticmethod
    def secure_compare(a: bytes, b: bytes) -> bool:
        """Comparação SEGURA (tempo constante)"""
        if len(a) != len(b):
            return False
        
        result = 0
        for i in range(len(a)):
            result |= a[i] ^ b[i]
            # Sempre executa todas as comparações
            time.sleep(0.0001)
        
        return result == 0
    
    @staticmethod
    def demonstrate_timing_attack():
        """Demonstra ataque de tempo"""
        print("\n" + "=" * 80)
        print("DEMONSTRAÇÃO: TIMING ATTACK")
        print("=" * 80)
        
        secret = b"SECRET_KEY_123"
        
        print(f"\n[1] Comparação Vulnerável:")
        print(f"  Segredo: {secret.decode()}")
        
        # Testa com prefixos corretos de tamanhos diferentes
        for length in [1, 5, 10, 14]:
            guess = secret[:length] + b"X" * (14 - length)
            
            start = time.time()
            result = TimingAttack.vulnerable_compare(secret, guess)
            elapsed = time.time() - start
            
            print(f"  Tentativa: {guess.decode():20s} | Tempo: {elapsed*1000:.2f}ms")
        
        print(f"\n  ⚠️  Tempo varia com número de bytes corretos!")
        print(f"  ⚠️  Atacante pode descobrir segredo byte por byte!")
        
        print(f"\n[2] Comparação Segura (tempo constante):")
        
        for length in [1, 5, 10, 14]:
            guess = secret[:length] + b"X" * (14 - length)
            
            start = time.time()
            result = TimingAttack.secure_compare(secret, guess)
            elapsed = time.time() - start
            
            print(f"  Tentativa: {guess.decode():20s} | Tempo: {elapsed*1000:.2f}ms")
        
        print(f"\n  ✓ Tempo constante independente de bytes corretos!")


# ============================================================================
# MAIN: EXECUTA TODOS OS ATAQUES
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("ANÁLISE DE SEGURANÇA CRIPTOGRÁFICA")
    print("=" * 80)
    print("\nAVISO: Este código é apenas para fins educacionais!")
    print("Demonstra vulnerabilidades e importância de implementação correta.\n")
    
    # Ataque 1: Brute Force
    print("\n" + "=" * 80)
    print("ATAQUE 1: BRUTE FORCE")
    print("=" * 80)
    
    # Estima tempo para quebrar SHA-256
    BruteForceAttack.estimate_time_to_crack(bits=256, hash_rate=1e12)
    
    # Tenta quebrar hash truncado (viável)
    target = sha256(b"hello")
    BruteForceAttack.find_preimage(target, max_attempts=100000, max_length=5)
    
    # Ataque 2: Birthday Attack
    print("\n" + "=" * 80)
    print("ATAQUE 2: BIRTHDAY ATTACK (Colisões)")
    print("=" * 80)
    BirthdayAttack.find_collision(bits=32, max_attempts=100000)
    
    # Ataque 4: Nonce Reuse
    NonceReuseAttack.demonstrate_attack()
    
    # Ataque 5: Weak RNG
    WeakRNGAttack.demonstrate_weak_rng()
    
    # Ataque 6: Timing Attack
    TimingAttack.demonstrate_timing_attack()
    
    print("\n" + "=" * 80)
    print("CONCLUSÕES")
    print("=" * 80)
    print("""
1. SHA-256 é SEGURO contra brute force (2^256 tentativas = impossível)
2. Colisões são teoricamente possíveis, mas impraticáveis (2^128 tentativas)
3. ECDSA é SEGURO se implementado corretamente:
   - Nonce DEVE ser aleatório e único para cada assinatura
   - RNG DEVE ser criptograficamente seguro
4. Implementação importa:
   - Comparações devem ser em tempo constante
   - Não vaze informações via timing
5. Bitcoin usa estas primitivas corretamente, tornando-o SEGURO

⚠️  LIÇÃO PRINCIPAL: Criptografia forte + implementação correta = segurança
    """)
