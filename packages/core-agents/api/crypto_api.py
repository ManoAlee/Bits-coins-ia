"""
API ENDPOINTS PARA CRIPTOGRAFIA BITCOIN
========================================

Fornece acesso às funcionalidades criptográficas do Bitcoin:
- Geração de chaves
- Assinatura e verificação ECDSA
- Geração de endereços
- Merkle Trees
- Proof of Work
- Análise de segurança
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import sys
import os

# Adiciona path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from cryptography.bitcoin_crypto import (
    sha256, double_sha256, hash160,
    generate_private_key, private_key_to_public_key,
    sign_message, verify_signature,
    public_key_to_address, private_key_to_wif,
    point_compress, Point, Signature,
    MerkleTree, proof_of_work, verify_proof_of_work,
    NetworkType
)

# Router
router = APIRouter(prefix="/crypto", tags=["crypto"])


# ============================================================================
# MODELS
# ============================================================================

class HashRequest(BaseModel):
    data: str
    encoding: str = "utf-8"


class HashResponse(BaseModel):
    sha256: str
    double_sha256: str
    hash160: str


class KeyPairResponse(BaseModel):
    private_key: str
    public_key_x: str
    public_key_y: str
    public_key_compressed: str
    address: str
    wif: str


class SignRequest(BaseModel):
    message: str
    private_key: str


class SignResponse(BaseModel):
    message: str
    signature_r: str
    signature_s: str
    signature_der: str


class VerifyRequest(BaseModel):
    message: str
    signature_r: str
    signature_s: str
    public_key_x: str
    public_key_y: str


class VerifyResponse(BaseModel):
    valid: bool
    message: str


class MerkleTreeRequest(BaseModel):
    transactions: List[str]


class MerkleTreeResponse(BaseModel):
    root: str
    transaction_count: int


class MerkleProofRequest(BaseModel):
    transactions: List[str]
    transaction_index: int


class MerkleProofResponse(BaseModel):
    transaction: str
    proof: List[Dict[str, str]]
    root: str


class ProofOfWorkRequest(BaseModel):
    data: str
    difficulty: int


class ProofOfWorkResponse(BaseModel):
    nonce: int
    hash: str
    difficulty: int
    leading_zeros: int


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/")
async def crypto_info():
    """Informações sobre o sistema criptográfico"""
    return {
        "system": "Bitcoin Cryptography Implementation",
        "version": "1.0.0",
        "features": [
            "SHA-256 hashing",
            "ECDSA (secp256k1)",
            "Address generation",
            "Merkle Trees",
            "Proof of Work",
            "Security analysis"
        ],
        "curve": "secp256k1",
        "hash_algorithm": "SHA-256"
    }


@router.post("/hash", response_model=HashResponse)
async def hash_data(request: HashRequest):
    """
    Calcula hashes criptográficos de dados
    
    Args:
        data: Dados para fazer hash
        encoding: Codificação (utf-8, hex, base64)
    """
    try:
        # Converte dados
        if request.encoding == "hex":
            data_bytes = bytes.fromhex(request.data)
        elif request.encoding == "base64":
            import base64
            data_bytes = base64.b64decode(request.data)
        else:
            data_bytes = request.data.encode(request.encoding)
        
        # Calcula hashes
        sha256_hash = sha256(data_bytes)
        double_sha256_hash = double_sha256(data_bytes)
        hash160_hash = hash160(data_bytes)
        
        return {
            "sha256": sha256_hash.hex(),
            "double_sha256": double_sha256_hash.hex(),
            "hash160": hash160_hash.hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/generate-keypair", response_model=KeyPairResponse)
async def generate_keypair(network: str = "mainnet"):
    """
    Gera par de chaves Bitcoin (privada e pública)
    
    Args:
        network: mainnet ou testnet
    """
    try:
        # Valida rede
        net = NetworkType.MAINNET if network == "mainnet" else NetworkType.TESTNET
        
        # Gera chave privada
        private_key = generate_private_key()
        
        # Deriva chave pública
        public_key = private_key_to_public_key(private_key)
        
        # Gera endereço
        address = public_key_to_address(public_key, net)
        
        # Gera WIF
        wif = private_key_to_wif(private_key, compressed=True, network=net)
        
        return {
            "private_key": hex(private_key),
            "public_key_x": hex(public_key.x),
            "public_key_y": hex(public_key.y),
            "public_key_compressed": point_compress(public_key).hex(),
            "address": address,
            "wif": wif
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sign", response_model=SignResponse)
async def sign_message_endpoint(request: SignRequest):
    """
    Assina mensagem usando ECDSA
    
    Args:
        message: Mensagem para assinar
        private_key: Chave privada (hex)
    """
    try:
        # Converte chave privada
        private_key = int(request.private_key, 16)
        
        # Assina mensagem
        message_bytes = request.message.encode('utf-8')
        signature = sign_message(message_bytes, private_key)
        
        return {
            "message": request.message,
            "signature_r": hex(signature.r),
            "signature_s": hex(signature.s),
            "signature_der": signature.to_der().hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify", response_model=VerifyResponse)
async def verify_signature_endpoint(request: VerifyRequest):
    """
    Verifica assinatura ECDSA
    
    Args:
        message: Mensagem original
        signature_r: Componente r da assinatura (hex)
        signature_s: Componente s da assinatura (hex)
        public_key_x: Coordenada x da chave pública (hex)
        public_key_y: Coordenada y da chave pública (hex)
    """
    try:
        # Converte assinatura
        r = int(request.signature_r, 16)
        s = int(request.signature_s, 16)
        signature = Signature(r, s)
        
        # Converte chave pública
        x = int(request.public_key_x, 16)
        y = int(request.public_key_y, 16)
        public_key = Point(x, y)
        
        # Verifica assinatura
        message_bytes = request.message.encode('utf-8')
        is_valid = verify_signature(message_bytes, signature, public_key)
        
        return {
            "valid": is_valid,
            "message": "Signature is valid" if is_valid else "Signature is invalid"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/merkle-tree", response_model=MerkleTreeResponse)
async def create_merkle_tree(request: MerkleTreeRequest):
    """
    Cria Merkle Tree a partir de transações
    
    Args:
        transactions: Lista de transações (strings)
    """
    try:
        if not request.transactions:
            raise HTTPException(status_code=400, detail="Transactions list cannot be empty")
        
        # Converte transações para hashes
        tx_hashes = [double_sha256(tx.encode('utf-8')) for tx in request.transactions]
        
        # Cria Merkle Tree
        merkle_tree = MerkleTree(tx_hashes)
        root = merkle_tree.get_root()
        
        return {
            "root": root.hex(),
            "transaction_count": len(request.transactions)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/merkle-proof", response_model=MerkleProofResponse)
async def generate_merkle_proof(request: MerkleProofRequest):
    """
    Gera prova de inclusão de Merkle
    
    Args:
        transactions: Lista de transações
        transaction_index: Índice da transação para gerar prova
    """
    try:
        if not request.transactions:
            raise HTTPException(status_code=400, detail="Transactions list cannot be empty")
        
        if request.transaction_index < 0 or request.transaction_index >= len(request.transactions):
            raise HTTPException(status_code=400, detail="Invalid transaction index")
        
        # Converte transações para hashes
        tx_hashes = [double_sha256(tx.encode('utf-8')) for tx in request.transactions]
        
        # Cria Merkle Tree
        merkle_tree = MerkleTree(tx_hashes)
        
        # Gera prova
        proof = merkle_tree.get_proof(request.transaction_index)
        
        # Formata prova
        proof_formatted = [
            {
                "hash": hash_val.hex(),
                "position": "right" if is_right else "left"
            }
            for hash_val, is_right in proof
        ]
        
        return {
            "transaction": request.transactions[request.transaction_index],
            "proof": proof_formatted,
            "root": merkle_tree.get_root().hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/proof-of-work", response_model=ProofOfWorkResponse)
async def mine_block(request: ProofOfWorkRequest):
    """
    Executa Proof of Work (mineração)
    
    Args:
        data: Dados do bloco
        difficulty: Dificuldade (número de bits zero)
    """
    try:
        if request.difficulty < 1 or request.difficulty > 32:
            raise HTTPException(
                status_code=400,
                detail="Difficulty must be between 1 and 32 (higher values take too long)"
            )
        
        # Executa PoW
        data_bytes = request.data.encode('utf-8')
        nonce, block_hash = proof_of_work(data_bytes, request.difficulty)
        
        # Conta zeros iniciais
        hash_bin = bin(int.from_bytes(block_hash, 'big'))[2:].zfill(256)
        leading_zeros = len(hash_bin) - len(hash_bin.lstrip('0'))
        
        return {
            "nonce": nonce,
            "hash": block_hash.hex(),
            "difficulty": request.difficulty,
            "leading_zeros": leading_zeros
        }
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/verify-pow")
async def verify_pow(data: str, nonce: int, difficulty: int):
    """
    Verifica Proof of Work
    
    Args:
        data: Dados do bloco
        nonce: Nonce encontrado
        difficulty: Dificuldade
    """
    try:
        data_bytes = data.encode('utf-8')
        is_valid = verify_proof_of_work(data_bytes, nonce, difficulty)
        
        return {
            "valid": is_valid,
            "message": "Proof of Work is valid" if is_valid else "Proof of Work is invalid"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/security-analysis")
async def security_analysis():
    """
    Retorna análise de segurança do sistema criptográfico
    """
    import math
    
    # Estimativas de segurança
    sha256_bits = 256
    ecdsa_bits = 256
    
    # Taxa de hash estimada (Bitcoin network)
    bitcoin_hashrate = 400e18  # 400 EH/s
    
    # Tempo para quebrar SHA-256
    sha256_attempts = 2 ** sha256_bits
    sha256_seconds = sha256_attempts / bitcoin_hashrate
    sha256_years = sha256_seconds / (365.25 * 24 * 3600)
    
    # Tempo para quebrar ECDSA (força bruta)
    ecdsa_attempts = 2 ** ecdsa_bits
    ecdsa_seconds = ecdsa_attempts / bitcoin_hashrate
    ecdsa_years = ecdsa_seconds / (365.25 * 24 * 3600)
    
    # Idade do universo
    universe_age = 13.8e9
    
    return {
        "hash_algorithm": {
            "name": "SHA-256",
            "bits": sha256_bits,
            "attempts_to_break": f"2^{sha256_bits}",
            "time_to_break_years": f"{sha256_years:.2e}",
            "times_universe_age": f"{sha256_years / universe_age:.2e}",
            "status": "SECURE"
        },
        "signature_algorithm": {
            "name": "ECDSA (secp256k1)",
            "bits": ecdsa_bits,
            "attempts_to_break": f"2^{ecdsa_bits}",
            "time_to_break_years": f"{ecdsa_years:.2e}",
            "times_universe_age": f"{ecdsa_years / universe_age:.2e}",
            "status": "SECURE"
        },
        "known_vulnerabilities": [
            {
                "name": "Nonce Reuse",
                "severity": "CRITICAL",
                "description": "Reusing nonce in ECDSA allows private key recovery",
                "mitigation": "Always use cryptographically secure random nonce"
            },
            {
                "name": "Weak RNG",
                "severity": "CRITICAL",
                "description": "Predictable random number generator compromises keys",
                "mitigation": "Use hardware RNG or cryptographically secure PRNG"
            },
            {
                "name": "Timing Attacks",
                "severity": "MEDIUM",
                "description": "Side-channel attacks via execution time",
                "mitigation": "Use constant-time comparisons and operations"
            }
        ],
        "recommendations": [
            "Never reuse nonces in ECDSA signatures",
            "Use cryptographically secure random number generators",
            "Implement constant-time operations",
            "Keep private keys secure (hardware wallets recommended)",
            "Verify all signatures before accepting transactions",
            "Use multi-signature schemes for high-value transactions"
        ]
    }


@router.get("/benchmark")
async def benchmark_crypto():
    """
    Executa benchmark das operações criptográficas
    """
    import time
    
    results = {}
    
    # Benchmark: Hash
    start = time.time()
    for _ in range(10000):
        sha256(b"test data")
    hash_time = (time.time() - start) / 10000
    results["sha256_per_operation"] = f"{hash_time * 1000:.3f} ms"
    results["sha256_ops_per_second"] = f"{1/hash_time:.0f}"
    
    # Benchmark: Key generation
    start = time.time()
    for _ in range(100):
        private_key = generate_private_key()
        public_key = private_key_to_public_key(private_key)
    keygen_time = (time.time() - start) / 100
    results["keygen_per_operation"] = f"{keygen_time * 1000:.3f} ms"
    results["keygen_ops_per_second"] = f"{1/keygen_time:.0f}"
    
    # Benchmark: Signing
    private_key = generate_private_key()
    message = b"test message"
    start = time.time()
    for _ in range(100):
        sign_message(message, private_key)
    sign_time = (time.time() - start) / 100
    results["sign_per_operation"] = f"{sign_time * 1000:.3f} ms"
    results["sign_ops_per_second"] = f"{1/sign_time:.0f}"
    
    # Benchmark: Verification
    public_key = private_key_to_public_key(private_key)
    signature = sign_message(message, private_key)
    start = time.time()
    for _ in range(100):
        verify_signature(message, signature, public_key)
    verify_time = (time.time() - start) / 100
    results["verify_per_operation"] = f"{verify_time * 1000:.3f} ms"
    results["verify_ops_per_second"] = f"{1/verify_time:.0f}"
    
    return {
        "benchmark_results": results,
        "note": "Times are averages over multiple iterations"
    }
