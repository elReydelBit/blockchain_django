from datetime import datetime
from typing import Dict, Any
from .blockchain import blockchain

class SaludoContract:
    def __init__(self):
        self.address = "0x1234567890abcdef"
        self.storage = {
            "mensaje": "Hola Web3!",
            "owner": "0xowner123",
            "created_at": datetime.now().isoformat()
        }
        self.events = []
    
    def get_mensaje(self) -> str:
        """Función pública para leer el mensaje"""
        return self.storage["mensaje"]
    
    def cambiar_mensaje(self, nuevo_mensaje: str, from_address: str) -> Dict[str, Any]:
        """Función para cambiar el mensaje (simula una transacción)"""
        
        # Validaciones básicas
        if not nuevo_mensaje:
            raise ValueError("El mensaje no puede estar vacío")
        
        if len(nuevo_mensaje) > 280:
            raise ValueError("El mensaje no puede exceder 280 caracteres")
        
        # Crear transacción
        transaction_data = {
            "contract_address": self.address,
            "function": "cambiar_mensaje",
            "old_value": self.storage["mensaje"],
            "new_value": nuevo_mensaje,
            "gas_used": 21000
        }
        
        transaction = blockchain.create_transaction(
            from_address=from_address,
            to_address=self.address,
            amount=0,  # No hay transferencia de tokens
            data=transaction_data
        )
        
        # Añadir transacción a la blockchain
        blockchain.add_transaction(transaction)
        
        # Minar bloque (en producción esto sería automático)
        blockchain.mine_pending_transactions(from_address)
        
        # Actualizar el estado del contrato
        old_mensaje = self.storage["mensaje"]
        self.storage["mensaje"] = nuevo_mensaje
        self.storage["last_updated"] = datetime.now().isoformat()
        
        # Emitir evento
        event = {
            "event": "MensajeCambiado",
            "old_mensaje": old_mensaje,
            "new_mensaje": nuevo_mensaje,
            "from": from_address,
            "timestamp": datetime.now().isoformat(),
            "block_number": len(blockchain.chain) - 1
        }
        self.events.append(event)
        
        return {
            "success": True,
            "transaction_hash": blockchain.get_latest_block().hash,
            "block_number": len(blockchain.chain) - 1,
            "gas_used": 21000,
            "event": event
        }
    
    def get_contract_info(self) -> Dict[str, Any]:
        """Obtiene información del contrato"""
        return {
            "address": self.address,
            "mensaje_actual": self.storage["mensaje"],
            "owner": self.storage["owner"],
            "created_at": self.storage["created_at"],
            "last_updated": self.storage.get("last_updated", "Nunca"),
            "total_events": len(self.events)
        }
    
    def get_events(self, limit: int = 10) -> list:
        """Obtiene los eventos más recientes"""
        return self.events[-limit:]
    
    def get_transaction_history(self) -> list:
        """Obtiene el historial de transacciones del contrato"""
        history = []
        for block in blockchain.chain:
            for transaction in block.transactions:
                if (transaction.get("to") == self.address or 
                    transaction.get("data", {}).get("contract_address") == self.address):
                    history.append({
                        "block_number": block.index,
                        "transaction_hash": block.hash,
                        "from": transaction.get("from"),
                        "timestamp": transaction.get("timestamp"),
                        "data": transaction.get("data", {})
                    })
        return history

# Instancia global del contrato
saludo_contract = SaludoContract()
