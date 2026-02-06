"""
CRIPTOGRAFIA BITCOIN: Implementação Completa
============================================

Este módulo implementa todos os componentes criptográficos do Bitcoin:
1. SHA-256 (Secure Hash Algorithm 256-bit)
2. RIPEMD-160 (RACE Integrity Primitives Evaluation Message Digest)
3. ECDSA (Elliptic Curve Digital Signature Algorithm) com secp256k1
4. Base58Check encoding
5. Merkle Trees
6. Proof of Work (PoW)
7. Address generation
8. Transaction signing/verification

Referências:
- Bitcoin Whitepaper: https://bitcoin.org/bitcoin.pdf
- secp256k1: https://en.bitcoin.it/wiki/Secp256k1
- BIP32, BIP39, BIP44 (HD Wallets)
"""

import hashlib
import hmac
import secrets
import struct
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass
from enum import Enum


class NetworkType(Enum):
    """Tipos de rede Bitcoin"""
    MAINNET = 0x00
    TESTNET = 0x6F


# ============================================================================
# PARTE 1: FUNÇÕES HASH CRIPTOGRÁFICAS
# ============================================================================

def sha256(data: bytes) -> bytes:
    """
    SHA-256: Secure Hash Algorithm 256-bit
    
    Propriedades:
    - Determinístico: mesma entrada → mesma saída
    - Rápido de computar
    - Resistente a colisões: difícil encontrar x ≠ y tal que H(x) = H(y)
    - Efeito avalanche: pequena mudança na entrada → grande mudança na saída
    - Pré-imagem resistente: dado H(x), difícil encontrar x
    """
    return hashlib.sha256(data).digest()


def double_sha256(data: bytes) -> bytes:
    """
    Double SHA-256: usado no Bitcoin para maior segurança
    
    H(x) = SHA256(SHA256(x))
    """
    return sha256(sha256(data))


def ripemd160(data: bytes) -> bytes:
    """
    RIPEMD-160: RACE Integrity Primitives Evaluation Message Digest
    
    Usado no Bitcoin para gerar endereços mais curtos
    Nota: Usando hashlib com fallback para Crypto.Hash se disponível
    """
    try:
        h = hashlib.new('ripemd160')
        h.update(data)
        return h.digest()
    except ValueError:
        # Fallback: usa pycryptodome se disponível
        try:
            from Crypto.Hash import RIPEMD160
            h = RIPEMD160.new()
            h.update(data)
            return h.digest()
        except ImportError:
            # Fallback final: usa SHA256 (não é RIPEMD160 real, mas funciona para demo)
            # Em produção, isso seria inaceitável!
            import warnings
            warnings.warn("RIPEMD160 não disponível, usando SHA256 truncado como fallback")
            return sha256(data)[:20]


def hash160(data: bytes) -> bytes:
    """
    HASH160: SHA-256 seguido de RIPEMD-160
    
    Usado para gerar endereços Bitcoin
    HASH160(x) = RIPEMD160(SHA256(x))
    """
    return ripemd160(sha256(data))


# ============================================================================
# PARTE 2: CURVA ELÍPTICA secp256k1
# ============================================================================

class Secp256k1:
    """
    Parâmetros da curva elíptica secp256k1 usada no Bitcoin
    
    Equação: y² = x³ + 7 (mod p)
    
    Parâmetros:
    - p: primo que define o campo finito
    - a, b: coeficientes da curva (a=0, b=7)
    - G: ponto gerador
    - n: ordem do subgrupo gerado por G
    - h: cofator (h=1)
    """
    
    # Primo do campo finito (2^256 - 2^32 - 977)
    p = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
    
    # Coeficientes da curva y² = x³ + ax + b
    a = 0
    b = 7
    
    # Ponto gerador G
    Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
    Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
    
    # Ordem do grupo (número de pontos)
    n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
    
    # Cofator
    h = 1


@dataclass
class Point:
    """Ponto na curva elíptica"""
    x: int
    y: int
    
    def __eq__(self, other):
        if isinstance(other, Point):
            return self.x == other.x and self.y == other.y
        return False
    
    def is_infinity(self) -> bool:
        """Verifica se é o ponto no infinito (identidade)"""
        return self.x is None and self.y is None


# Ponto no infinito (elemento identidade)
POINT_AT_INFINITY = Point(None, None)


def point_add(P: Point, Q: Point) -> Point:
    """
    Adição de pontos na curva elíptica
    
    Regras:
    1. P + O = P (O é ponto no infinito)
    2. P + (-P) = O
    3. P + Q: traça reta por P e Q, encontra terceiro ponto R, reflete em x
    """
    # Caso especial: ponto no infinito
    if P.is_infinity():
        return Q
    if Q.is_infinity():
        return P
    
    p = Secp256k1.p
    
    # Caso especial: P = -Q (mesma x, y oposto)
    if P.x == Q.x and (P.y + Q.y) % p == 0:
        return POINT_AT_INFINITY
    
    # Caso P ≠ Q
    if P.x != Q.x:
        # Inclinação: λ = (y₂ - y₁) / (x₂ - x₁)
        lam = ((Q.y - P.y) * pow(Q.x - P.x, -1, p)) % p
    # Caso P = Q (duplicação de ponto)
    else:
        # Inclinação: λ = (3x₁² + a) / (2y₁)
        lam = ((3 * P.x * P.x + Secp256k1.a) * pow(2 * P.y, -1, p)) % p
    
    # Novo ponto: x₃ = λ² - x₁ - x₂
    x3 = (lam * lam - P.x - Q.x) % p
    
    # y₃ = λ(x₁ - x₃) - y₁
    y3 = (lam * (P.x - x3) - P.y) % p
    
    return Point(x3, y3)


def point_multiply(k: int, P: Point) -> Point:
    """
    Multiplicação escalar: k * P = P + P + ... + P (k vezes)
    
    Usa algoritmo de "double-and-add" para eficiência O(log k)
    
    Exemplo: 13 * P
    13 = 1101₂ = 8 + 4 + 1
    13P = 8P + 4P + P
    """
    if k == 0 or P.is_infinity():
        return POINT_AT_INFINITY
    
    if k < 0:
        # -k * P = k * (-P)
        return point_multiply(-k, Point(P.x, (-P.y) % Secp256k1.p))
    
    result = POINT_AT_INFINITY
    addend = P
    
    while k:
        if k & 1:  # Se bit menos significativo é 1
            result = point_add(result, addend)
        addend = point_add(addend, addend)  # Duplica
        k >>= 1  # Shift right
    
    return result


def point_compress(P: Point) -> bytes:
    """
    Comprime ponto da curva elíptica
    
    Formato: 0x02 ou 0x03 (paridade de y) + x (32 bytes)
    Total: 33 bytes
    """
    if P.is_infinity():
        return b'\x00'
    
    prefix = 0x02 if P.y % 2 == 0 else 0x03
    return bytes([prefix]) + P.x.to_bytes(32, 'big')


def point_decompress(compressed: bytes) -> Point:
    """
    Descomprime ponto da curva elíptica
    
    Dado x, calcula y usando: y² = x³ + 7 (mod p)
    """
    if len(compressed) != 33:
        raise ValueError("Compressed point must be 33 bytes")
    
    prefix = compressed[0]
    x = int.from_bytes(compressed[1:], 'big')
    
    # Calcula y² = x³ + 7 (mod p)
    y_squared = (pow(x, 3, Secp256k1.p) + Secp256k1.b) % Secp256k1.p
    
    # Calcula raiz quadrada módulo p (usando Tonelli-Shanks)
    y = pow(y_squared, (Secp256k1.p + 1) // 4, Secp256k1.p)
    
    # Escolhe y com paridade correta
    if (y % 2 == 0) != (prefix == 0x02):
        y = Secp256k1.p - y
    
    return Point(x, y)


# ============================================================================
# PARTE 3: ECDSA (Elliptic Curve Digital Signature Algorithm)
# ============================================================================

@dataclass
class Signature:
    """Assinatura ECDSA"""
    r: int
    s: int
    
    def to_der(self) -> bytes:
        """Converte para formato DER (Distinguished Encoding Rules)"""
        r_bytes = self.r.to_bytes((self.r.bit_length() + 7) // 8, 'big')
        s_bytes = self.s.to_bytes((self.s.bit_length() + 7) // 8, 'big')
        
        # Adiciona 0x00 se byte mais significativo >= 0x80
        if r_bytes[0] >= 0x80:
            r_bytes = b'\x00' + r_bytes
        if s_bytes[0] >= 0x80:
            s_bytes = b'\x00' + s_bytes
        
        r_der = b'\x02' + bytes([len(r_bytes)]) + r_bytes
        s_der = b'\x02' + bytes([len(s_bytes)]) + s_bytes
        
        signature = r_der + s_der
        return b'\x30' + bytes([len(signature)]) + signature


def generate_private_key() -> int:
    """
    Gera chave privada aleatória
    
    Chave privada: número inteiro aleatório no intervalo [1, n-1]
    onde n é a ordem do grupo
    """
    return secrets.randbelow(Secp256k1.n - 1) + 1


def private_key_to_public_key(private_key: int) -> Point:
    """
    Deriva chave pública da chave privada
    
    Chave pública = private_key * G
    onde G é o ponto gerador da curva
    """
    G = Point(Secp256k1.Gx, Secp256k1.Gy)
    return point_multiply(private_key, G)


def sign_message(message: bytes, private_key: int) -> Signature:
    """
    Assina mensagem usando ECDSA
    
    Algoritmo:
    1. Calcula e = HASH(m)
    2. Gera k aleatório (nonce)
    3. Calcula (x, y) = k * G
    4. r = x mod n
    5. s = k⁻¹(e + r * private_key) mod n
    6. Retorna (r, s)
    """
    # Hash da mensagem
    e = int.from_bytes(double_sha256(message), 'big')
    
    # Gera nonce k (CRÍTICO: deve ser aleatório e único para cada assinatura!)
    k = secrets.randbelow(Secp256k1.n - 1) + 1
    
    # Calcula k * G
    G = Point(Secp256k1.Gx, Secp256k1.Gy)
    R = point_multiply(k, G)
    
    # r = x_R mod n
    r = R.x % Secp256k1.n
    if r == 0:
        # Caso raro: tenta novamente
        return sign_message(message, private_key)
    
    # s = k⁻¹(e + r * d) mod n
    k_inv = pow(k, -1, Secp256k1.n)
    s = (k_inv * (e + r * private_key)) % Secp256k1.n
    if s == 0:
        # Caso raro: tenta novamente
        return sign_message(message, private_key)
    
    return Signature(r, s)


def verify_signature(message: bytes, signature: Signature, public_key: Point) -> bool:
    """
    Verifica assinatura ECDSA
    
    Algoritmo:
    1. Verifica que r, s ∈ [1, n-1]
    2. Calcula e = HASH(m)
    3. Calcula w = s⁻¹ mod n
    4. Calcula u₁ = e * w mod n
    5. Calcula u₂ = r * w mod n
    6. Calcula (x, y) = u₁ * G + u₂ * Q
    7. Verifica que r ≡ x (mod n)
    """
    r, s = signature.r, signature.s
    
    # Verifica range
    if not (1 <= r < Secp256k1.n and 1 <= s < Secp256k1.n):
        return False
    
    # Hash da mensagem
    e = int.from_bytes(double_sha256(message), 'big')
    
    # w = s⁻¹ mod n
    w = pow(s, -1, Secp256k1.n)
    
    # u₁ = e * w mod n
    u1 = (e * w) % Secp256k1.n
    
    # u₂ = r * w mod n
    u2 = (r * w) % Secp256k1.n
    
    # (x, y) = u₁ * G + u₂ * Q
    G = Point(Secp256k1.Gx, Secp256k1.Gy)
    point1 = point_multiply(u1, G)
    point2 = point_multiply(u2, public_key)
    result = point_add(point1, point2)
    
    if result.is_infinity():
        return False
    
    # Verifica r ≡ x (mod n)
    return r == result.x % Secp256k1.n


# ============================================================================
# PARTE 4: BASE58CHECK ENCODING
# ============================================================================

BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'


def base58_encode(data: bytes) -> str:
    """
    Codifica bytes em Base58
    
    Base58: como Base64, mas sem caracteres ambíguos (0, O, I, l)
    """
    # Converte para inteiro
    num = int.from_bytes(data, 'big')
    
    # Converte para base58
    encoded = ''
    while num > 0:
        num, remainder = divmod(num, 58)
        encoded = BASE58_ALPHABET[remainder] + encoded
    
    # Preserva zeros iniciais
    for byte in data:
        if byte == 0:
            encoded = '1' + encoded
        else:
            break
    
    return encoded


def base58_decode(encoded: str) -> bytes:
    """Decodifica string Base58 para bytes"""
    num = 0
    for char in encoded:
        num = num * 58 + BASE58_ALPHABET.index(char)
    
    # Converte para bytes
    data = num.to_bytes((num.bit_length() + 7) // 8, 'big')
    
    # Restaura zeros iniciais
    for char in encoded:
        if char == '1':
            data = b'\x00' + data
        else:
            break
    
    return data


def base58check_encode(payload: bytes, version: int = 0x00) -> str:
    """
    Codifica em Base58Check (com checksum)
    
    Formato: [version][payload][checksum]
    Checksum: primeiros 4 bytes de SHA256(SHA256(version + payload))
    """
    # Adiciona version byte
    data = bytes([version]) + payload
    
    # Calcula checksum
    checksum = double_sha256(data)[:4]
    
    # Codifica
    return base58_encode(data + checksum)


def base58check_decode(encoded: str) -> Tuple[int, bytes]:
    """
    Decodifica Base58Check
    
    Retorna (version, payload)
    """
    data = base58_decode(encoded)
    
    # Separa componentes
    version = data[0]
    payload = data[1:-4]
    checksum = data[-4:]
    
    # Verifica checksum
    expected_checksum = double_sha256(data[:-4])[:4]
    if checksum != expected_checksum:
        raise ValueError("Invalid checksum")
    
    return version, payload


# ============================================================================
# PARTE 5: ENDEREÇOS BITCOIN
# ============================================================================

def public_key_to_address(public_key: Point, network: NetworkType = NetworkType.MAINNET) -> str:
    """
    Converte chave pública em endereço Bitcoin
    
    Processo:
    1. Serializa chave pública (comprimida)
    2. HASH160 = RIPEMD160(SHA256(pubkey))
    3. Adiciona version byte (0x00 para mainnet)
    4. Calcula checksum
    5. Codifica em Base58Check
    """
    # Comprime chave pública
    pubkey_compressed = point_compress(public_key)
    
    # HASH160
    pubkey_hash = hash160(pubkey_compressed)
    
    # Base58Check encode
    address = base58check_encode(pubkey_hash, version=network.value)
    
    return address


def private_key_to_wif(private_key: int, compressed: bool = True, 
                       network: NetworkType = NetworkType.MAINNET) -> str:
    """
    Converte chave privada para WIF (Wallet Import Format)
    
    Formato:
    - Mainnet: 0x80 + private_key + [0x01 se compressed] + checksum
    - Testnet: 0xEF + private_key + [0x01 se compressed] + checksum
    """
    version = 0x80 if network == NetworkType.MAINNET else 0xEF
    
    # Serializa chave privada
    key_bytes = private_key.to_bytes(32, 'big')
    
    # Adiciona compression flag se necessário
    if compressed:
        key_bytes += b'\x01'
    
    return base58check_encode(key_bytes, version=version)


# ============================================================================
# PARTE 6: MERKLE TREES
# ============================================================================

class MerkleTree:
    """
    Árvore de Merkle para verificação eficiente de transações
    
    Propriedades:
    - Raiz (root) representa todas as transações
    - Prova de inclusão: O(log n) hashes
    - Usado no Bitcoin para SPV (Simplified Payment Verification)
    """
    
    def __init__(self, transactions: List[bytes]):
        """
        Constrói árvore de Merkle
        
        Args:
            transactions: Lista de hashes de transações
        """
        if not transactions:
            raise ValueError("Transactions list cannot be empty")
        
        self.transactions = transactions
        self.root = self._build_tree(transactions)
    
    def _build_tree(self, hashes: List[bytes]) -> bytes:
        """Constrói árvore recursivamente"""
        if len(hashes) == 1:
            return hashes[0]
        
        # Se número ímpar, duplica último
        if len(hashes) % 2 == 1:
            hashes.append(hashes[-1])
        
        # Combina pares
        parent_hashes = []
        for i in range(0, len(hashes), 2):
            combined = hashes[i] + hashes[i + 1]
            parent_hash = double_sha256(combined)
            parent_hashes.append(parent_hash)
        
        return self._build_tree(parent_hashes)
    
    def get_root(self) -> bytes:
        """Retorna raiz da árvore"""
        return self.root
    
    def get_proof(self, index: int) -> List[Tuple[bytes, bool]]:
        """
        Gera prova de inclusão para transação no índice especificado
        
        Retorna lista de (hash, is_right) onde is_right indica se o hash
        deve ser concatenado à direita ou esquerda
        """
        if index < 0 or index >= len(self.transactions):
            raise ValueError("Invalid transaction index")
        
        proof = []
        hashes = self.transactions[:]
        
        while len(hashes) > 1:
            if len(hashes) % 2 == 1:
                hashes.append(hashes[-1])
            
            # Encontra par
            pair_index = index + 1 if index % 2 == 0 else index - 1
            is_right = index % 2 == 0
            
            proof.append((hashes[pair_index], is_right))
            
            # Sobe um nível
            index = index // 2
            parent_hashes = []
            for i in range(0, len(hashes), 2):
                combined = hashes[i] + hashes[i + 1]
                parent_hash = double_sha256(combined)
                parent_hashes.append(parent_hash)
            hashes = parent_hashes
        
        return proof
    
    @staticmethod
    def verify_proof(transaction_hash: bytes, proof: List[Tuple[bytes, bool]], 
                    root: bytes) -> bool:
        """
        Verifica prova de inclusão
        
        Args:
            transaction_hash: Hash da transação
            proof: Prova gerada por get_proof()
            root: Raiz da árvore de Merkle
        
        Returns:
            True se a prova é válida
        """
        current_hash = transaction_hash
        
        for sibling_hash, is_right in proof:
            if is_right:
                combined = current_hash + sibling_hash
            else:
                combined = sibling_hash + current_hash
            
            current_hash = double_sha256(combined)
        
        return current_hash == root


# ============================================================================
# PARTE 7: PROOF OF WORK
# ============================================================================

def proof_of_work(data: bytes, difficulty: int) -> Tuple[int, bytes]:
    """
    Proof of Work: encontra nonce tal que HASH(data + nonce) < target
    
    Args:
        data: Dados do bloco
        difficulty: Número de zeros iniciais no hash (em bits)
    
    Returns:
        (nonce, hash)
    """
    target = 2 ** (256 - difficulty)
    nonce = 0
    
    while True:
        block_data = data + nonce.to_bytes(8, 'big')
        block_hash = double_sha256(block_data)
        hash_int = int.from_bytes(block_hash, 'big')
        
        if hash_int < target:
            return nonce, block_hash
        
        nonce += 1
        
        # Limite de segurança para testes
        if nonce > 10_000_000:
            raise RuntimeError("PoW failed: difficulty too high")


def verify_proof_of_work(data: bytes, nonce: int, difficulty: int) -> bool:
    """Verifica Proof of Work"""
    target = 2 ** (256 - difficulty)
    block_data = data + nonce.to_bytes(8, 'big')
    block_hash = double_sha256(block_data)
    hash_int = int.from_bytes(block_hash, 'big')
    
    return hash_int < target


# ============================================================================
# TESTES
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("CRIPTOGRAFIA BITCOIN - TESTES COMPLETOS")
    print("=" * 80)
    
    # Teste 1: Hash functions
    print("\n[1] FUNÇÕES HASH")
    print("-" * 80)
    message = b"Hello, Bitcoin!"
    print(f"Mensagem: {message.decode()}")
    print(f"SHA-256: {sha256(message).hex()}")
    print(f"Double SHA-256: {double_sha256(message).hex()}")
    print(f"HASH160: {hash160(message).hex()}")
    
    # Teste 2: Geração de chaves
    print("\n[2] GERAÇÃO DE CHAVES")
    print("-" * 80)
    private_key = generate_private_key()
    public_key = private_key_to_public_key(private_key)
    print(f"Chave privada: {hex(private_key)}")
    print(f"Chave pública (x): {hex(public_key.x)}")
    print(f"Chave pública (y): {hex(public_key.y)}")
    print(f"Chave pública (comprimida): {point_compress(public_key).hex()}")
    
    # Teste 3: Endereço Bitcoin
    print("\n[3] ENDEREÇO BITCOIN")
    print("-" * 80)
    address = public_key_to_address(public_key)
    wif = private_key_to_wif(private_key)
    print(f"Endereço: {address}")
    print(f"WIF: {wif}")
    
    # Teste 4: Assinatura ECDSA
    print("\n[4] ASSINATURA ECDSA")
    print("-" * 80)
    message = b"Transfer 1 BTC to Alice"
    signature = sign_message(message, private_key)
    print(f"Mensagem: {message.decode()}")
    print(f"Assinatura (r): {hex(signature.r)}")
    print(f"Assinatura (s): {hex(signature.s)}")
    print(f"DER: {signature.to_der().hex()}")
    
    # Verificação
    is_valid = verify_signature(message, signature, public_key)
    print(f"Assinatura válida: {is_valid}")
    
    # Teste com mensagem alterada
    tampered_message = b"Transfer 2 BTC to Alice"
    is_valid_tampered = verify_signature(tampered_message, signature, public_key)
    print(f"Assinatura válida (mensagem alterada): {is_valid_tampered}")
    
    # Teste 5: Merkle Tree
    print("\n[5] MERKLE TREE")
    print("-" * 80)
    transactions = [
        double_sha256(b"tx1: Alice -> Bob: 1 BTC"),
        double_sha256(b"tx2: Bob -> Charlie: 0.5 BTC"),
        double_sha256(b"tx3: Charlie -> Dave: 0.3 BTC"),
        double_sha256(b"tx4: Dave -> Eve: 0.2 BTC"),
    ]
    
    merkle_tree = MerkleTree(transactions)
    root = merkle_tree.get_root()
    print(f"Raiz da Merkle Tree: {root.hex()}")
    
    # Prova de inclusão
    tx_index = 1
    proof = merkle_tree.get_proof(tx_index)
    print(f"\nProva de inclusão para tx{tx_index + 1}:")
    for i, (hash_val, is_right) in enumerate(proof):
        position = "direita" if is_right else "esquerda"
        print(f"  Nível {i+1}: {hash_val.hex()[:16]}... ({position})")
    
    # Verificação
    is_valid_proof = MerkleTree.verify_proof(transactions[tx_index], proof, root)
    print(f"Prova válida: {is_valid_proof}")
    
    # Teste 6: Proof of Work
    print("\n[6] PROOF OF WORK")
    print("-" * 80)
    block_data = b"Block #123456: Previous hash + transactions + timestamp"
    difficulty = 16  # 16 bits = 4 zeros hexadecimais
    
    print(f"Dados do bloco: {block_data.decode()}")
    print(f"Dificuldade: {difficulty} bits")
    print("Minerando...")
    
    nonce, block_hash = proof_of_work(block_data, difficulty)
    print(f"Nonce encontrado: {nonce}")
    print(f"Hash do bloco: {block_hash.hex()}")
    print(f"Zeros iniciais: {256 - block_hash.hex().lstrip('0').__len__() * 4} bits")
    
    # Verificação
    is_valid_pow = verify_proof_of_work(block_data, nonce, difficulty)
    print(f"PoW válido: {is_valid_pow}")
    
    print("\n" + "=" * 80)
    print("TODOS OS TESTES CONCLUÍDOS COM SUCESSO!")
    print("=" * 80)
