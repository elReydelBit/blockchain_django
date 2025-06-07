# 🔗 Sistema de Saludo en Blockchain con Django

## Descripción

Este proyecto implementa una **blockchain sencilla** integrada con **Django** que simula el comportamiento de un contrato inteligente para almacenar y modificar mensajes. Es una alternativa al proyecto original que usaba Ganache, implementando toda la funcionalidad blockchain directamente en Python.

## 🚀 Características

- **Blockchain básica** implementada en Python puro
- **Contrato inteligente simulado** para gestionar mensajes
- **Algoritmo de minería** con Proof of Work
- **API REST** para interactuar con la blockchain
- **Interfaz web moderna** y responsive
- **Sistema de eventos** y notificaciones en tiempo real
- **Historial de transacciones** completo
- **Validación de integridad** de la cadena

## 🛠️ Tecnologías Utilizadas

- **Backend**: Django 4.2.7 + Python
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Blockchain**: Implementación personalizada en Python
- **Base de datos**: SQLite (para Django, blockchain en memoria)

## 📦 Estructura del Proyecto

```
blockchain_django/
├── core/                          # Núcleo de la blockchain
│   ├── __init__.py
│   ├── blockchain.py              # Implementación de la blockchain
│   └── smart_contract.py          # Contrato inteligente simulado
├── saludo_app/                    # Aplicación Django
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   └── views.py                   # API endpoints
├── templates/
│   └── index.html                 # Interfaz principal
├── static/
│   ├── style.css                  # Estilos de la aplicación
│   └── app.js                     # Lógica del frontend
├── manage.py                      # Comando principal Django
├── settings.py                    # Configuración Django
├── urls.py                        # URLs principales
└── requirements.txt               # Dependencias
```

## 🔧 Instalación y Configuración

### 1. Prerrequisitos
- Python 3.8+
- pip

### 2. Clonar e instalar dependencias
```bash
cd blockchain_django
pip install -r requirements.txt
```

### 3. Configurar Django
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### 4. Ejecutar el servidor
```bash
python manage.py runserver
```

### 5. Acceder a la aplicación
Abrir navegador en: `http://127.0.0.1:8000`

## 🎮 Uso de la Aplicación

### Interfaz Web
1. **Ver mensaje actual**: Se muestra automáticamente al cargar
2. **Cambiar mensaje**: Escribir nuevo mensaje y hacer clic en "Cambiar Mensaje"
3. **Ver historial**: Lista de todas las transacciones realizadas
4. **Estado de minería**: Indicador visual del proceso de minado

### API Endpoints

#### GET `/api/mensaje/`
Obtiene el mensaje actual del contrato
```json
{
    "mensaje": "Hola Web3!",
    "bloque": 1,
    "timestamp": "2025-06-06T10:30:00Z"
}
```

#### POST `/api/mensaje/`
Cambia el mensaje del contrato
```json
{
    "nuevo_mensaje": "Mi nuevo saludo blockchain!"
}
```

#### GET `/api/blockchain/`
Obtiene información completa de la blockchain
```json
{
    "cadena": [...],
    "longitud": 3,
    "valida": true,
    "ultimo_bloque": {...}
}
```

#### GET `/api/historial/`
Obtiene el historial de transacciones
```json
{
    "transacciones": [
        {
            "mensaje": "Hola Web3!",
            "timestamp": "2025-06-06T10:00:00Z",
            "bloque": 1
        }
    ]
}
```

## 🔍 Funcionamiento Técnico

### Blockchain
- **Bloques**: Cada bloque contiene timestamp, datos, hash anterior y nonce
- **Minería**: Algoritmo Proof of Work con dificultad ajustable
- **Validación**: Verificación de integridad de toda la cadena
- **Persistencia**: Blockchain en memoria (se reinicia con el servidor)

### Smart Contract
- **Estado**: Almacena el mensaje actual
- **Funciones**: `get_mensaje()` y `cambiar_mensaje()`
- **Eventos**: Emite eventos cuando cambia el mensaje
- **Validación**: Verifica que el nuevo mensaje no esté vacío

### Minería
- **Dificultad**: 4 ceros iniciales en el hash
- **Algoritmo**: SHA-256
- **Nonce**: Contador incrementa hasta encontrar hash válido
- **Tiempo**: Aproximadamente 1-5 segundos por bloque

## 🧪 Ejemplo de Uso

```python
# Crear instancia de blockchain
from core.blockchain import Blockchain
from core.smart_contract import SaludoContract

# Inicializar
blockchain = Blockchain()
contrato = SaludoContract()

# Leer mensaje actual
mensaje = contrato.get_mensaje()
print(f"Mensaje: {mensaje}")

# Cambiar mensaje
contrato.cambiar_mensaje("Nuevo saludo!")
blockchain.agregar_transaccion("cambiar_mensaje", "Nuevo saludo!")
blockchain.minar_bloque()

# Verificar cambio
nuevo_mensaje = contrato.get_mensaje()
print(f"Nuevo mensaje: {nuevo_mensaje}")
```

## 🔒 Seguridad

- **Validación de entrada**: Todos los inputs son validados
- **Integridad**: Hash verification en cada bloque
- **Inmutabilidad**: Los bloques minados no pueden modificarse
- **Consenso**: Algoritmo Proof of Work previene alteraciones

## 🚀 Extensiones Posibles

1. **Persistencia**: Guardar blockchain en base de datos
2. **Red P2P**: Conectar múltiples nodos
3. **Más contratos**: Implementar otros smart contracts
4. **Wallets**: Sistema de cuentas y firmas digitales
5. **Consenso avanzado**: Proof of Stake, etc.
6. **Interfaz mejorada**: Framework como React/Vue

## 🐛 Troubleshooting

### Error: "No module named 'django'"
```bash
pip install django
```

### Error: "Port already in use"
```bash
python manage.py runserver 8001
```

### Blockchain se reinicia
Es normal, la blockchain está en memoria. Para persistencia, implementar base de datos.

## 📝 Notas de Desarrollo

- **Simplicidad**: Implementación educativa, no para producción
- **Rendimiento**: Optimizado para demostración, no para escala
- **Seguridad**: Básica, no incluye criptografía avanzada

## 👨‍💻 Autor

Proyecto desarrollado como alternativa a Ganache usando Django y Python puro.

---

**¡Disfruta explorando tu propia blockchain!** 🎉