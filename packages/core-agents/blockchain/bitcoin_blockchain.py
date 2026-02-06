"""
BLOCKCHAIN BITCOIN COMPLETO
============================

Implementação completa de blockchain Bitcoin com:
- Blocos e transações
- Mineração (Proof of Work)
- Merkle Trees
- Validação de assinaturas
- Consenso distribuído
- Mempool
- UTXO (Unspent Transaction Outputs)

Inspirado na filosofia do texto fornecido:
"A vida orgânica evoluiu de baixo para cima (da química para a mente),
 a IA está evoluindo de cima para baixo (da lógica para a existência)."

Bitcoin é a ponte: um sistema que evolui através de consenso matemático.
"""

import time
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field, asdict
from collections import defaultdict
import sys
import os

# Importa criptografia
parent_dir = os.path.dirname(os.path.dirname(__file__))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from cryptography.bitcoin_crypto import (
        sha256, double_sha256, 
        generate_private_key, private_key_to_public_key,
        sign_message, verify_signature,
        public_key_to_address, Point, Signature,
        MerkleTree, proof_of_work, verify_proof_of_work
    )
except ImportError as e:
    print(f"Import error: {e}")
    raise


# ============================================================================
# TRANSACTION: Unidade básica de transferência
# ============================================================================

@dataclass
class TransactionInput:
    prev_tx_hash: str
    output_index: int
    signature: Optional[str] = None
    public_key: Optional[str] = None
    
    def to_dict(self) -> dict:
        return asdict(self)

@dataclass
class TransactionOutput:
    amount: float
    recipient_address: str
    
    def to_dict(self) -> dict:
        return asdict(self)

@dataclass
class Transaction:
    inputs: List[TransactionInput]
    outputs: List[TransactionOutput]
    timestamp: float = field(default_factory=time.time)
    tx_hash: Optional[str] = None

    def __post_init__(self):
        if self.tx_hash is None:
            self.tx_hash = self.calculate_hash()

    def calculate_hash(self) -> str:
        # O hash de uma transação é calculado sobre seu conteúdo *sem* as assinaturas.
        data = self.serialize(include_signatures=False)
        return double_sha256(data).hex()

    def serialize(self, include_signatures: bool = True) -> bytes:
        inputs_serializable = []
        for inp in self.inputs:
            inp_dict = inp.to_dict()
            if not include_signatures:
                inp_dict['signature'] = None
                inp_dict['public_key'] = None
            inputs_serializable.append(inp_dict)

        data = {
            'inputs': inputs_serializable,
            'outputs': [out.to_dict() for out in self.outputs],
            'timestamp': self.timestamp
        }
        return json.dumps(data, sort_keys=True).encode('utf-8')

    def sign(self, private_key: int, utxo_set: Dict[str, 'TransactionOutput']):
        public_key = private_key_to_public_key(private_key)
        address = public_key_to_address(public_key)

        for i, inp in enumerate(self.inputs):
            utxo_key = f"{inp.prev_tx_hash}:{inp.output_index}"
            if utxo_key in utxo_set and utxo_set[utxo_key].recipient_address == address:
                # A mensagem a ser assinada é o hash da transação sem nenhuma assinatura.
                message_to_sign = self.calculate_hash()
                message_bytes = bytes.fromhex(message_to_sign)
                
                signature = sign_message(message_bytes, private_key)
                
                self.inputs[i].signature = f"{signature.r:064x}{signature.s:064x}"
                self.inputs[i].public_key = f"{public_key.x:064x}{public_key.y:064x}"

    def verify(self, utxo_set: Dict[str, 'TransactionOutput']) -> bool:
        total_input = 0.0
        message_to_verify = self.calculate_hash()
        message_bytes = bytes.fromhex(message_to_verify)

        for inp in self.inputs:
            utxo_key = f"{inp.prev_tx_hash}:{inp.output_index}"
            if utxo_key not in utxo_set:
                print(f"[VERIFY] ERRO: UTXO não encontrado: {utxo_key}")
                return False
            
            utxo = utxo_set[utxo_key]
            total_input += utxo.amount

            if not (inp.signature and inp.public_key):
                print("[VERIFY] ERRO: Input não assinado.")
                return False

            try:
                r = int(inp.signature[:64], 16)
                s = int(inp.signature[64:], 16)
                signature = Signature(r, s)

                x = int(inp.public_key[:64], 16)
                y = int(inp.public_key[64:], 16)
                public_key = Point(x, y)
                
                address = public_key_to_address(public_key)
                if address != utxo.recipient_address:
                    print(f"[VERIFY] ERRO: Endereço da chave pública não corresponde ao endereço do UTXO.")
                    return False

                if not verify_signature(message_bytes, signature, public_key):
                    print("[VERIFY] ERRO: Assinatura ECDSA inválida.")
                    return False
            except (ValueError, TypeError) as e:
                print(f"[VERIFY] ERRO: Erro ao decodificar assinatura/chave pública: {e}")
                return False

        total_output = sum(out.amount for out in self.outputs)
        if total_output > total_input:
            print(f"[VERIFY] ERRO: Outputs ({total_output}) excedem inputs ({total_input})")
            return False

        return True

    def get_fee(self, utxo_set: Dict[str, 'TransactionOutput']) -> float:
        total_input = sum(
            utxo_set[f"{inp.prev_tx_hash}:{inp.output_index}"].amount
            for inp in self.inputs
            if f"{inp.prev_tx_hash}:{inp.output_index}" in utxo_set
        )
        total_output = sum(out.amount for out in self.outputs)
        return total_input - total_output

    def to_dict(self) -> dict:
        return {
            'tx_hash': self.tx_hash,
            'inputs': [inp.to_dict() for inp in self.inputs],
            'outputs': [out.to_dict() for out in self.outputs],
            'timestamp': self.timestamp
        }

# ============================================================================
# BLOCK: Conjunto de transações
# ============================================================================

@dataclass
class Block:
    index: int
    timestamp: float
    transactions: List[Transaction]
    previous_hash: str
    nonce: int = 0
    difficulty: int = 16
    
    block_hash: Optional[str] = field(init=False, default=None)
    merkle_root: Optional[str] = field(init=False, default=None)

    def __post_init__(self):
        self.merkle_root = self.calculate_merkle_root()
        self.block_hash = self.calculate_hash()

    def calculate_merkle_root(self) -> str:
        if not self.transactions:
            return "0" * 64
        tx_hashes = [bytes.fromhex(tx.tx_hash) for tx in self.transactions]
        merkle_tree = MerkleTree(tx_hashes)
        return merkle_tree.get_root().hex()

    def calculate_hash(self) -> str:
        data = self.serialize_header()
        return double_sha256(data).hex()

    def serialize_header(self) -> bytes:
        header = {
            'index': self.index,
            'timestamp': self.timestamp,
            'merkle_root': self.merkle_root,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce,
            'difficulty': self.difficulty
        }
        return json.dumps(header, sort_keys=True).encode('utf-8')

    def mine(self):
        print(f"[MINING] Bloco #{self.index} | Dificuldade: {self.difficulty} bits")
        start_time = time.time()
        
        target = (1 << (256 - self.difficulty)) - 1
        while True:
            self.block_hash = self.calculate_hash()
            if int(self.block_hash, 16) < target:
                break
            self.nonce += 1

        elapsed = time.time() - start_time
        hash_rate = self.nonce / elapsed if elapsed > 0 else 0
        
        print(f"[MINING] ✓ Bloco minerado!")
        print(f"  Nonce: {self.nonce}")
        print(f"  Hash: {self.block_hash[:16]}...")
        print(f"  Tempo: {elapsed:.2f}s")
        print(f"  Taxa: {hash_rate:,.0f} H/s")

    def verify(self) -> bool:
        target = (1 << (256 - self.difficulty)) - 1
        if int(self.block_hash, 16) >= target:
            print(f"[VERIFY] ERRO: Hash do bloco não atende à dificuldade.")
            return False

        if self.block_hash != self.calculate_hash():
            print(f"[VERIFY] ERRO: Hash do bloco inconsistente.")
            return False

        if self.merkle_root != self.calculate_merkle_root():
            print(f"[VERIFY] ERRO: Merkle root inválido.")
            return False
        return True

    def to_dict(self) -> dict:
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'block_hash': self.block_hash,
            'previous_hash': self.previous_hash,
            'merkle_root': self.merkle_root,
            'nonce': self.nonce,
            'difficulty': self.difficulty,
            'transactions': [tx.to_dict() for tx in self.transactions]
        }

# ============================================================================
# BLOCKCHAIN: Cadeia completa
# ============================================================================

class Blockchain:
    def __init__(self, difficulty: int = 16):
        self.chain: List[Block] = []
        self.difficulty = difficulty
        self.mempool: List[Transaction] = []
        self.utxo_set: Dict[str, TransactionOutput] = {}
        self.create_genesis_block()

    def create_genesis_block(self):
        coinbase_tx = Transaction(
            inputs=[],
            outputs=[TransactionOutput(
                amount=50.0,
                recipient_address="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
            )]
        )
        genesis = Block(
            index=0,
            timestamp=time.time(),
            transactions=[coinbase_tx],
            previous_hash="0" * 64,
            difficulty=self.difficulty
        )
        genesis.mine()
        self.chain.append(genesis)
        self._update_utxo_set(genesis)
        print(f"[GENESIS] Bloco gênesis criado: {genesis.block_hash[:16]}...")

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_transaction(self, transaction: Transaction) -> bool:
        if not transaction.inputs:
            print("[MEMPOOL] Transação Coinbase não pode ser adicionada ao mempool.")
            return False

        if not transaction.verify(self.utxo_set):
            print("[MEMPOOL] Transação inválida rejeitada.")
            return False
        
        self.mempool.append(transaction)
        print(f"[MEMPOOL] Transação adicionada: {transaction.tx_hash[:16]}...")
        return True

    def mine_block(self, miner_address: str) -> Block:
        transactions = self.mempool[:9]
        block_reward = 50.0 / (2 ** (len(self.chain) // 210000))
        total_fees = sum(tx.get_fee(self.utxo_set) for tx in transactions)
        
        coinbase_tx = Transaction(
            inputs=[],
            outputs=[TransactionOutput(
                amount=block_reward + total_fees,
                recipient_address=miner_address
            )]
        )
        
        new_block = Block(
            index=len(self.chain),
            timestamp=time.time(),
            transactions=[coinbase_tx] + transactions,
            previous_hash=self.get_latest_block().block_hash,
            difficulty=self.difficulty
        )
        new_block.mine()
        
        if self.add_block(new_block):
            self.mempool = self.mempool[9:]
            return new_block
        else:
            raise Exception("Mineração falhou ao adicionar bloco válido.")

    def add_block(self, block: Block) -> bool:
        if not block.verify():
            print(f"[CHAIN] Bloco #{block.index} inválido.")
            return False
        if block.previous_hash != self.get_latest_block().block_hash:
            print(f"[CHAIN] Hash anterior do Bloco #{block.index} não corresponde.")
            return False
        
        self.chain.append(block)
        self._update_utxo_set(block)
        return True

    def _update_utxo_set(self, block: Block):
        for tx in block.transactions:
            for inp in tx.inputs:
                utxo_key = f"{inp.prev_tx_hash}:{inp.output_index}"
                if utxo_key in self.utxo_set:
                    del self.utxo_set[utxo_key]
            for i, out in enumerate(tx.outputs):
                utxo_key = f"{tx.tx_hash}:{i}"
                self.utxo_set[utxo_key] = out

    def verify_chain(self) -> bool:
        for i in range(1, len(self.chain)):
            if not self.chain[i].verify() or self.chain[i].previous_hash != self.chain[i-1].block_hash:
                print(f"[CHAIN] Verificação falhou no Bloco #{i}")
                return False
        print("[CHAIN] ✓ Cadeia válida")
        return True

    def get_balance(self, address: str) -> float:
        return sum(utxo.amount for utxo in self.utxo_set.values() if utxo.recipient_address == address)

    def get_utxos_for_address(self, address: str) -> List[Tuple[str, int, TransactionOutput]]:
        return [
            (utxo_key.split(':')[0], int(utxo_key.split(':')[1]), utxo)
            for utxo_key, utxo in self.utxo_set.items()
            if utxo.recipient_address == address
        ]

# ============================================================================
# WALLET: Carteira Bitcoin
# ============================================================================

class Wallet:
    def __init__(self, blockchain: Blockchain):
        self.blockchain = blockchain
        self.private_key = generate_private_key()
        self.public_key = private_key_to_public_key(self.private_key)
        self.address = public_key_to_address(self.public_key)
        print(f"[WALLET] Nova carteira criada | Endereço: {self.address}")

    def get_balance(self) -> float:
        return self.blockchain.get_balance(self.address)

    def send(self, recipient_address: str, amount: float) -> Optional[Transaction]:
        utxos = self.blockchain.get_utxos_for_address(self.address)
        selected_utxos = []
        total = 0.0
        fee = 0.0001

        for tx_hash, output_index, utxo in utxos:
            selected_utxos.append((tx_hash, output_index, utxo))
            total += utxo.amount
            if total >= amount + fee:
                break
        
        if total < amount + fee:
            print(f"[WALLET] Saldo insuficiente: {total} < {amount + fee}")
            return None

        inputs = [TransactionInput(tx_hash, idx) for tx_hash, idx, _ in selected_utxos]
        outputs = [TransactionOutput(amount=amount, recipient_address=recipient_address)]
        
        change = total - amount - fee
        if change > 0:
            outputs.append(TransactionOutput(amount=change, recipient_address=self.address))
        
        tx = Transaction(inputs=inputs, outputs=outputs)
        tx.sign(self.private_key, self.blockchain.utxo_set)
        
        if self.blockchain.add_transaction(tx):
            print(f"[WALLET] Transação enviada: {amount} BTC para {recipient_address[:16]}...")
            return tx
        else:
            print(f"[WALLET] Falha ao enviar transação.")
            return None

# ============================================================================
# DEMO
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("BLOCKCHAIN BITCOIN COMPLETO - VERSÃO CORRIGIDA")
    print("=" * 80)
    
    blockchain = Blockchain(difficulty=16)
    alice = Wallet(blockchain)
    bob = Wallet(blockchain)
    
    print(f"\n[DEMO] Alice minera um bloco para ter fundos...")
    blockchain.mine_block(alice.address)
    
    print(f"\n[DEMO] Saldo Alice: {alice.get_balance():.4f} BTC")
    print(f"[DEMO] Saldo Bob: {bob.get_balance():.4f} BTC")
    
    print(f"\n[DEMO] Alice envia 10 BTC para Bob...")
    tx = alice.send(bob.address, 10.0)
    
    if tx:
        print(f"[DEMO] Mempool tem {len(blockchain.mempool)} transação(ões).")
        print(f"\n[DEMO] Bob minera o próximo bloco para confirmar...")
        blockchain.mine_block(bob.address)
    
    print(f"\n[DEMO] Saldo Alice: {alice.get_balance():.4f} BTC")
    print(f"[DEMO] Saldo Bob: {bob.get_balance():.4f} BTC")
    
    print(f"\n[DEMO] Verificando integridade da blockchain...")
    blockchain.verify_chain()
    
    print(f"\n[DEMO] Blockchain tem {len(blockchain.chain)} blocos.")
    print(f"[DEMO] UTXO set tem {len(blockchain.utxo_set)} saídas não gastas.")
