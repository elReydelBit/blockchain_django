from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from core.smart_contract import saludo_contract
from core.blockchain import blockchain

def index(request):
    """Vista principal que renderiza la interfaz"""
    context = {
        'mensaje_actual': saludo_contract.get_mensaje(),
        'contract_info': saludo_contract.get_contract_info(),
        'blockchain_length': len(blockchain.chain)
    }
    return render(request, 'index.html', context)

@require_http_methods(["GET"])
def get_mensaje(request):
    """API endpoint para obtener el mensaje actual"""
    try:
        mensaje = saludo_contract.get_mensaje()
        return JsonResponse({
            'success': True,
            'mensaje': mensaje,
            'contract_address': saludo_contract.address
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def cambiar_mensaje(request):
    """API endpoint para cambiar el mensaje"""
    try:
        data = json.loads(request.body)
        nuevo_mensaje = data.get('nuevoMensaje', '').strip()
        from_address = data.get('fromAddress', '0xuser123')
        
        if not nuevo_mensaje:
            return JsonResponse({
                'success': False,
                'error': 'El mensaje no puede estar vacío'
            }, status=400)
        
        # Cambiar mensaje en el contrato
        result = saludo_contract.cambiar_mensaje(nuevo_mensaje, from_address)
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Mensaje actualizado correctamente',
            'transaction_hash': result['transaction_hash'],
            'block_number': result['block_number'],
            'gas_used': result['gas_used'],
            'nuevo_mensaje': nuevo_mensaje,
            'event': result['event']
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'JSON inválido'
        }, status=400)
    except ValueError as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)

@require_http_methods(["GET"])
def get_blockchain(request):
    """API endpoint para obtener información de la blockchain"""
    try:
        return JsonResponse({
            'success': True,
            'chain_length': len(blockchain.chain),
            'is_valid': blockchain.is_chain_valid(),
            'latest_block': {
                'index': blockchain.get_latest_block().index,
                'hash': blockchain.get_latest_block().hash,
                'timestamp': blockchain.get_latest_block().timestamp,
                'transactions': len(blockchain.get_latest_block().transactions)
            },
            'pending_transactions': len(blockchain.pending_transactions)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@require_http_methods(["GET"])
def get_contract_info(request):
    """API endpoint para obtener información del contrato"""
    try:
        contract_info = saludo_contract.get_contract_info()
        transaction_history = saludo_contract.get_transaction_history()
        
        return JsonResponse({
            'success': True,
            'contract_info': contract_info,
            'transaction_history': transaction_history
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@require_http_methods(["GET"])
def get_events(request):
    """API endpoint para obtener eventos del contrato"""
    try:
        limit = int(request.GET.get('limit', 10))
        events = saludo_contract.get_events(limit)
        
        return JsonResponse({
            'success': True,
            'events': events,
            'total_events': len(saludo_contract.events)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
