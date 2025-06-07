import hashlib
import json
from datetime import datetime
from typing import List, Dict, Any

class Block:
    def __init__(self, index: int, transactions: List[Dict], timestamp: str, previous_hash: str, nonce: int = 0):
        self.index = index
        self.transactions = transactions
        self.timestamp = timestamp
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calcula el hash del bloque"""
        block_string = json.dumps({
            "index": self.index,
            "transactions": self.transactions,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty: int):
        """Mina el bloque con proof of work"""
        target = "0" * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        print(f"Bloque minado: {self.hash}")

class SimpleBlockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.difficulty = 2
        self.pending_transactions: List[Dict] = []
        self.mining_reward = 10
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Crea el bloque génesis"""
        genesis_block = Block(0, [], datetime.now().isoformat(), "0")
        genesis_block.mine_block(self.difficulty)
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Obtiene el último bloque de la cadena"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Dict):
        """Añade una transacción pendiente"""
        self.pending_transactions.append(transaction)
    
    def mine_pending_transactions(self, mining_reward_address: str):
        """Mina las transacciones pendientes"""
        reward_transaction = {
            "from": None,
            "to": mining_reward_address,
            "amount": self.mining_reward,
            "type": "mining_reward"
        }
        self.pending_transactions.append(reward_transaction)
        
        block = Block(
            len(self.chain),
            self.pending_transactions,
            datetime.now().isoformat(),
            self.get_latest_block().hash
        )
        block.mine_block(self.difficulty)
        
        self.chain.append(block)
        self.pending_transactions = []
    
    def create_transaction(self, from_address: str, to_address: str, amount: float, data: Dict = None):
        """Crea una nueva transacción"""
        transaction = {
            "from": from_address,
            "to": to_address,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "data": data or {}
        }
        return transaction
    
    def is_chain_valid(self) -> bool:
        """Valida la integridad de la blockchain"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            if current_block.hash != current_block.calculate_hash():
                return False
            
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
    
    def get_balance(self, address: str) -> float:
        """Calcula el balance de una dirección"""
        balance = 0
        
        for block in self.chain:
            for transaction in block.transactions:
                if transaction.get("from") == address:
                    balance -= transaction.get("amount", 0)
                if transaction.get("to") == address:
                    balance += transaction.get("amount", 0)
        
        return balance
    
    def get_chain_data(self) -> List[Dict]:
        """Obtiene los datos de la cadena en formato JSON"""
        chain_data = []
        for block in self.chain:
            chain_data.append({
                "index": block.index,
                "transactions": block.transactions,
                "timestamp": block.timestamp,
                "previous_hash": block.previous_hash,
                "hash": block.hash,
                "nonce": block.nonce
            })
        return chain_data

# Instancia global de la blockchain
blockchain = SimpleBlockchain()
