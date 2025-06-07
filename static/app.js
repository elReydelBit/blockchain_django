// Variables globales
let currentUser = '0xuser123'; // Simula una wallet conectada

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Saludo en Blockchain iniciado');
    
    // Event listeners
    setupEventListeners();
    
    // Cargar datos iniciales
    cargarMensaje();
    actualizarInfoBlockchain();
    cargarHistorial();
    cargarEventos();
    
    // Auto-refresh cada 30 segundos
    setInterval(() => {
        actualizarInfoBlockchain();
        cargarEventos();
    }, 30000);
});

function setupEventListeners() {
    // Contador de caracteres
    const input = document.getElementById('nuevoMensaje');
    const counter = document.getElementById('charCount');
    
    if (input && counter) {
        input.addEventListener('input', function() {
            const count = this.value.length;
            counter.textContent = count;
            
            // Cambiar color si se acerca al límite
            if (count > 250) {
                counter.style.color = '#e53e3e';
            } else if (count > 200) {
                counter.style.color = '#f6ad55';
            } else {
                counter.style.color = '#718096';
            }
        });
        
        // Enviar con Enter
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                cambiarMensaje();
            }
        });
    }
}

// Función para cargar el mensaje actual
async function cargarMensaje() {
    try {
        const response = await fetch('/api/mensaje/');
        const data = await response.json();
        
        if (data.success) {
            const mensajeElement = document.getElementById('mensaje');
            if (mensajeElement) {
                mensajeElement.textContent = data.mensaje;
                mensajeElement.classList.add('pulse');
                setTimeout(() => mensajeElement.classList.remove('pulse'), 500);
            }
        } else {
            mostrarNotificacion('Error', 'No se pudo cargar el mensaje', 'error');
        }
    } catch (error) {
        console.error('Error al cargar mensaje:', error);
        mostrarNotificacion('Error', 'Error de conexión al cargar el mensaje', 'error');
    }
}

// Función para cambiar el mensaje
async function cambiarMensaje() {
    const input = document.getElementById('nuevoMensaje');
    const btnCambiar = document.getElementById('btnCambiar');
    
    if (!input || !input.value.trim()) {
        mostrarNotificacion('Error', 'Por favor, ingresa un mensaje', 'error');
        return;
    }
    
    const nuevoMensaje = input.value.trim();
    
    if (nuevoMensaje.length > 280) {
        mostrarNotificacion('Error', 'El mensaje no puede exceder 280 caracteres', 'error');
        return;
    }
    
    // Mostrar loading
    mostrarLoading(true);
    btnCambiar.disabled = true;
    btnCambiar.textContent = '⏳ Procesando...';
    
    try {
        const response = await fetch('/api/cambiar-mensaje/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nuevoMensaje: nuevoMensaje,
                fromAddress: currentUser
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Limpiar input
            input.value = '';
            document.getElementById('charCount').textContent = '0';
            
            // Actualizar mensaje en pantalla
            await cargarMensaje();
            
            // Actualizar información
            actualizarInfoBlockchain();
            cargarHistorial();
            cargarEventos();
            
            // Mostrar notificación de éxito
            mostrarNotificacion(
                'Transacción Exitosa', 
                `Mensaje actualizado. Hash: ${data.transaction_hash.substring(0, 20)}...`,
                'success'
            );
            
            console.log('Transacción exitosa:', data);
            
        } else {
            mostrarNotificacion('Error', data.error || 'Error al cambiar el mensaje', 'error');
        }
        
    } catch (error) {
        console.error('Error al cambiar mensaje:', error);
        mostrarNotificacion('Error', 'Error de conexión al cambiar el mensaje', 'error');
    } finally {
        // Restaurar botón
        mostrarLoading(false);
        btnCambiar.disabled = false;
        btnCambiar.textContent = '🚀 Actualizar Mensaje';
    }
}

// Función para actualizar información de la blockchain
async function actualizarInfoBlockchain() {
    try {
        const response = await fetch('/api/blockchain/');
        const data = await response.json();
        
        if (data.success) {
            // Actualizar contador de bloques
            const blockCountElement = document.getElementById('blockCount');
            if (blockCountElement) {
                blockCountElement.textContent = data.chain_length;
            }
            
            // Actualizar estado
            const statusElement = document.getElementById('blockchainStatus');
            if (statusElement) {
                if (data.is_valid) {
                    statusElement.textContent = '✅ Válida';
                    statusElement.className = 'status-valid';
                } else {
                    statusElement.textContent = '❌ Inválida';
                    statusElement.className = 'status-invalid';
                }
            }
            
            // Actualizar hash del último bloque
            const lastBlockElement = document.getElementById('lastBlockHash');
            if (lastBlockElement && data.latest_block) {
                lastBlockElement.textContent = data.latest_block.hash.substring(0, 20) + '...';
                lastBlockElement.title = data.latest_block.hash; // Tooltip con hash completo
            }
            
        }
    } catch (error) {
        console.error('Error al actualizar info blockchain:', error);
    }
}

// Función para cargar historial de transacciones
async function cargarHistorial() {
    try {
        const response = await fetch('/api/contract-info/');
        const data = await response.json();
        
        if (data.success && data.transaction_history) {
            const historyContainer = document.getElementById('transactionHistory');
            
            if (data.transaction_history.length === 0) {
                historyContainer.innerHTML = '<p class="loading">No hay transacciones aún</p>';
                return;
            }
            
            const historyHTML = data.transaction_history.map(tx => `
                <div class="transaction-item">
                    <div class="transaction-header">
                        <span class="transaction-hash" title="${tx.transaction_hash}">
                            ${tx.transaction_hash ? tx.transaction_hash.substring(0, 16) + '...' : 'N/A'}
                        </span>
                        <span class="transaction-time">
                            ${formatearFecha(tx.timestamp)}
                        </span>
                    </div>
                    <div class="transaction-details">
                        <strong>Bloque:</strong> #${tx.block_number} |
                        <strong>De:</strong> <span class="transaction-from">${tx.from ? tx.from.substring(0, 8) + '...' : 'Sistema'}</span>
                        ${tx.data && tx.data.function ? `| <strong>Función:</strong> ${tx.data.function}` : ''}
                    </div>
                    ${tx.data && tx.data.new_value ? `
                        <div class="transaction-details" style="margin-top: 5px;">
                            <strong>Nuevo mensaje:</strong> "${tx.data.new_value}"
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
            historyContainer.innerHTML = historyHTML;
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
        const historyContainer = document.getElementById('transactionHistory');
        if (historyContainer) {
            historyContainer.innerHTML = '<p class="loading">Error al cargar historial</p>';
        }
    }
}

// Función para cargar eventos del contrato
async function cargarEventos() {
    try {
        const response = await fetch('/api/events/?limit=5');
        const data = await response.json();
        
        if (data.success) {
            const eventsContainer = document.getElementById('contractEvents');
            
            if (data.events.length === 0) {
                eventsContainer.innerHTML = '<p class="loading">No hay eventos aún</p>';
                return;
            }
            
            const eventsHTML = data.events.map(event => `
                <div class="event-item">
                    <div class="event-header">
                        <span class="event-type">📡 ${event.event}</span>
                        <span class="event-time">${formatearFecha(event.timestamp)}</span>
                    </div>
                    <div class="event-details">
                        <strong>Bloque:</strong> #${event.block_number} |
                        <strong>De:</strong> <span class="transaction-from">${event.from ? event.from.substring(0, 8) + '...' : 'Sistema'}</span>
                    </div>
                    ${event.old_mensaje && event.new_mensaje ? `
                        <div class="event-details" style="margin-top: 8px;">
                            <div><strong>Mensaje anterior:</strong> "${event.old_mensaje}"</div>
                            <div><strong>Mensaje nuevo:</strong> "<span style="color: #38a169;">${event.new_mensaje}</span>"</div>
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
            eventsContainer.innerHTML = eventsHTML;
        }
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        const eventsContainer = document.getElementById('contractEvents');
        if (eventsContainer) {
            eventsContainer.innerHTML = '<p class="loading">Error al cargar eventos</p>';
        }
    }
}

// Función para mostrar/ocultar loading overlay
function mostrarLoading(mostrar) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = mostrar ? 'flex' : 'none';
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    
    notification.innerHTML = `
        <div class="notification-title">${titulo}</div>
        <div class="notification-message">${mensaje}</div>
    `;
    
    notificationsContainer.appendChild(notification);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Función para formatear fechas
function formatearFecha(isoString) {
    if (!isoString) return 'Fecha no disponible';
    
    try {
        const fecha = new Date(isoString);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
            return 'Hace un momento';
        } else if (diffMins < 60) {
            return `Hace ${diffMins} min`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours}h`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays}d`;
        } else {
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Fecha inválida';
    }
}

// Función para simular conexión de wallet
function conectarWallet() {
    // En una implementación real, aquí conectarías con MetaMask u otra wallet
    const wallets = [
        '0xuser123',
        '0xalice456',
        '0xbob789',
        '0xcharlie012'
    ];
    
    currentUser = wallets[Math.floor(Math.random() * wallets.length)];
    mostrarNotificacion('Wallet Conectada', `Conectado como ${currentUser.substring(0, 10)}...`, 'success');
    
    console.log('Usuario actual:', currentUser);
}

// Función para copiar al portapapeles
function copiarAlPortapapeles(texto, elemento = null) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('Copiado', 'Texto copiado al portapapeles', 'info');
        
        if (elemento) {
            const originalText = elemento.textContent;
            elemento.textContent = '✅ Copiado';
            setTimeout(() => {
                elemento.textContent = originalText;
            }, 2000);
        }
    }).catch(err => {
        console.error('Error al copiar:', err);
        mostrarNotificacion('Error', 'No se pudo copiar al portapapeles', 'error');
    });
}

// Agregar event listeners para elementos que necesiten funcionalidad de copiado
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('hash-text') || 
        e.target.classList.contains('transaction-hash') || 
        e.target.classList.contains('contract-address')) {
        const texto = e.target.title || e.target.textContent;
        copiarAlPortapapeles(texto, e.target);
    }
});

// Función para exportar datos de la blockchain (funcionalidad adicional)
async function exportarBlockchain() {
    try {
        const response = await fetch('/api/blockchain/');
        const data = await response.json();
        
        if (data.success) {
            const exportData = {
                timestamp: new Date().toISOString(),
                blockchain_info: data,
                current_message: document.getElementById('mensaje').textContent
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blockchain_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            mostrarNotificacion('Exportación Exitosa', 'Datos de blockchain exportados', 'success');
        }
    } catch (error) {
        console.error('Error al exportar:', error);
        mostrarNotificacion('Error', 'Error al exportar datos', 'error');
    }
}

// Agregar animación de slideOut para las notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ JavaScript del Sistema de Saludo en Blockchain cargado completamente');
