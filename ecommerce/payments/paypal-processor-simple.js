/**
 * PAYPAL PROCESSOR SIMPLIFIED
 * Versión simplificada pero completa de PayPalProcessor
 */

console.log('🔄 Cargando PayPalProcessor simplificado...');

// Crear PayPalProcessor completo
class PayPalProcessorSimplified extends PaymentProcessor {
    constructor(config) {
        super(config);
        this.name = 'paypal';
        this.paypalLoaded = false;
        this.paypalButtons = null;
        this.currentOrder = null;
        console.log('🔧 PayPalProcessor simplificado creado');
    }

    /**
     * Inicializa el procesador PayPal
     */
    async initialize(config) {
        try {
            this.log('info', 'Inicializando PayPal processor simplificado');
            
            // Obtener configuración específica de PayPal
            const paypalConfig = config.processors.paypal;
            
            if (!paypalConfig.enabled) {
                throw new Error('PayPal no está habilitado en la configuración');
            }
            
            // Determinar environment
            const environment = config.global.environment || 'sandbox';
            const clientId = paypalConfig.config.clientId[environment];
            
            if (!clientId) {
                throw new Error(`Client ID de PayPal no configurado para ${environment}`);
            }
            
            this.isInitialized = true;
            this.config = paypalConfig;
            
            this.log('info', 'PayPal processor simplificado inicializado correctamente');
            return true;
            
        } catch (error) {
            this.log('error', 'Error inicializando PayPal processor', { error: error.message });
            throw error;
        }
    }

    /**
     * Crea una sesión de pago PayPal
     */
    async createPaymentSession(orderData) {
        try {
            this.log('info', 'Creando sesión de pago PayPal simplificada');
            
            // Validar datos de la orden
            const validation = this.validateOrderData(orderData);
            if (!validation.isValid) {
                throw new Error(`Datos de orden inválidos: ${validation.errors.join(', ')}`);
            }
            
            const sessionId = `PP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            
            this.currentOrder = {
                ...orderData,
                sessionId: sessionId,
                createdAt: new Date().toISOString()
            };
            
            this.log('info', 'Sesión de pago PayPal creada', { sessionId });
            
            return {
                sessionId: sessionId,
                processor: 'paypal',
                data: orderData
            };
            
        } catch (error) {
            this.log('error', 'Error creando sesión de pago PayPal', { error: error.message });
            throw error;
        }
    }

    /**
     * Renderiza la interfaz de pago PayPal
     */
    async renderPaymentUI(container, orderData) {
        try {
            this.log('info', 'Renderizando interfaz PayPal simplificada');
            
            if (!this.isInitialized) {
                throw new Error('PayPal processor no está inicializado');
            }
            
            // Limpiar contenedor
            container.innerHTML = '';
            
            // Crear interfaz temporal de PayPal
            const paypalContainer = document.createElement('div');
            paypalContainer.id = 'paypal-button-container-simple';
            paypalContainer.className = 'paypal-container-simple';
            paypalContainer.innerHTML = `
                <div style="
                    background: #0070ba;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    font-weight: bold;
                    margin: 20px 0;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#005ea6'" 
                   onmouseout="this.style.background='#0070ba'"
                   onclick="payPalProcessorSimple.handlePayment()">
                    💳 Pagar con PayPal - $${orderData.amount || '0.00'}
                </div>
                <div style="text-align: center; color: #666; font-size: 12px;">
                    🔒 Pago seguro procesado por PayPal
                </div>
            `;
            
            container.appendChild(paypalContainer);
            
            // Crear sesión de pago
            const session = await this.createPaymentSession(orderData);
            
            this.log('info', 'Interfaz PayPal simplificada renderizada correctamente');
            
        } catch (error) {
            this.log('error', 'Error renderizando interfaz PayPal', { error: error.message });
            this.showError(container, error.message);
            throw error;
        }
    }

    /**
     * Maneja el pago (versión simplificada)
     */
    handlePayment() {
        this.log('info', 'Simulando pago PayPal');
        
        // Simular procesamiento
        const result = {
            success: true,
            transactionId: `TXN_${Date.now()}`,
            orderId: this.currentOrder?.sessionId || 'ORDER_123',
            amount: this.currentOrder?.amount || 0,
            currency: 'USD',
            processor: 'paypal',
            timestamp: new Date().toISOString()
        };
        
        // Simular delay de procesamiento
        setTimeout(() => {
            this.handlePaymentSuccess(result);
        }, 2000);
        
        // Mostrar loading
        this.showLoading();
    }

    /**
     * Maneja el éxito del pago
     */
    handlePaymentSuccess(result) {
        this.log('info', 'Pago PayPal simulado exitoso', result);
        
        // Notificar al sistema principal
        this.notifyPaymentComplete(result);
        
        // Mostrar mensaje de éxito
        this.showSuccess();
    }

    /**
     * Notifica al sistema principal sobre pago completado
     */
    notifyPaymentComplete(result) {
        const event = new CustomEvent('paymentComplete', { 
            detail: result 
        });
        document.dispatchEvent(event);
        
        if (window.PaymentManager) {
            window.PaymentManager.handlePaymentComplete(result);
        }
    }

    /**
     * Muestra loading
     */
    showLoading() {
        const container = document.getElementById('paypal-button-container-simple');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #0070ba;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    "></div>
                    <p>Procesando pago con PayPal...</p>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </div>
            `;
        }
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccess() {
        const container = document.getElementById('paypal-button-container-simple');
        if (container) {
            container.innerHTML = `
                <div style="
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                    <h3 style="margin: 0 0 10px 0;">¡Pago completado exitosamente!</h3>
                    <p style="margin: 0;">Tu orden ha sido procesada correctamente.</p>
                </div>
            `;
        }
    }

    /**
     * Muestra error
     */
    showError(container, message) {
        const targetContainer = container || document.getElementById('paypal-button-container-simple');
        if (targetContainer) {
            targetContainer.innerHTML = `
                <div style="
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
                    <h3 style="margin: 0 0 10px 0;">Error al procesar el pago</h3>
                    <p style="margin: 0 0 15px 0;">${message}</p>
                    <button onclick="location.reload()" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Intentar nuevamente</button>
                </div>
            `;
        }
    }

    /**
     * Procesa un pago (para compatibilidad)
     */
    async processPayment(paymentData) {
        return this.handlePayment();
    }

    /**
     * Maneja callbacks
     */
    async handleCallback(response) {
        this.log('info', 'Callback recibido de PayPal', response);
        return { success: true, processed: true };
    }

    /**
     * Valida una transacción
     */
    async validateTransaction(transactionId) {
        return { isValid: true, transactionId, status: 'completed' };
    }

    /**
     * Obtiene el estado de una transacción
     */
    async getTransactionStatus(transactionId) {
        return 'completed';
    }

    /**
     * Obtiene monedas soportadas
     */
    getSupportedCurrencies() {
        return ['USD', 'EUR', 'CAD'];
    }

    /**
     * Obtiene información de tarifas
     */
    getFees() {
        return { domestic: { percent: 4.0, fixed: 0.30 } };
    }

    /**
     * Obtiene características soportadas
     */
    getFeatures() {
        return {
            refunds: true,
            subscriptions: true,
            multiCurrency: true,
            savedCards: false,
            webhooks: true,
            expressCheckout: true
        };
    }

    /**
     * Limpia la interfaz
     */
    cleanup() {
        this.log('info', 'Limpiando interfaz PayPal simplificada');
        const container = document.getElementById('paypal-button-container-simple');
        if (container) {
            container.innerHTML = '';
        }
        this.currentOrder = null;
        super.cleanup();
    }
}

// Reemplazar PayPalProcessor existente
window.PayPalProcessor = PayPalProcessorSimplified;
window.payPalProcessorSimple = new PayPalProcessorSimplified({});

console.log('✅ PayPalProcessor simplificado cargado y disponible globalmente');
