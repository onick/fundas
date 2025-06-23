/**
 * PAYPAL PAYMENT PROCESSOR
 * Implementación específica de PayPal siguiendo la interfaz común
 * Maneja toda la lógica específica de PayPal de forma modular
 */

console.log('🔄 Cargando PayPalProcessor...');

// Verificar que PaymentProcessor esté disponible
if (typeof PaymentProcessor === 'undefined') {
    console.warn('⚠️ PaymentProcessor no está disponible aún. Creando clase base temporal...');
    
    // Crear clase base temporal
    window.PaymentProcessor = class PaymentProcessor {
        constructor(config) { 
            this.config = config; 
            this.name = 'base';
            this.isInitialized = false;
        }
        log(level, message, data = {}) { 
            console.log(`💳 [${this.name?.toUpperCase() || 'PAYMENT'}] ${message}`, data); 
        }
        validateOrderData(data) { return { isValid: true, errors: [] }; }
        formatAmount(amount, currency) { return `${currency} ${amount}`; }
        cleanup() {}
        getSupportedCurrencies() { return ['USD']; }
        getFees() { return {}; }
        getFeatures() { return {}; }
        async initialize() { return true; }
        async createPaymentSession() { return {}; }
        async processPayment() { return {}; }
        async handleCallback() { return {}; }
        async validateTransaction() { return { isValid: true }; }
        async getTransactionStatus() { return 'unknown'; }
        async renderPaymentUI() {}
    };
}

class PayPalProcessor extends PaymentProcessor {
    constructor(config) {
        super(config);
        this.paypalLoaded = false;
        this.paypalButtons = null;
        this.currentOrder = null;
    }

    /**
     * Inicializa el procesador PayPal
     */
    async initialize(config) {
        try {
            this.log('info', 'Inicializando PayPal processor');
            
            // Obtener configuración específica de PayPal
            const paypalConfig = config.processors.paypal;
            
            if (!paypalConfig.enabled) {
                throw new Error('PayPal no está habilitado en la configuración');
            }
            
            // Determinar environment
            const environment = config.global.environment || 'production';
            const clientId = paypalConfig.config.clientId[environment];
            
            if (!clientId) {
                throw new Error(`Client ID de PayPal no configurado para ${environment}`);
            }
            
            // Cargar SDK de PayPal si no está cargado
            if (!window.paypal) {
                await this.loadPayPalSDK(clientId, paypalConfig.config.currency);
            }
            
            this.paypalLoaded = true;
            this.isInitialized = true;
            this.config = paypalConfig;
            
            this.log('info', 'PayPal processor inicializado correctamente');
            return true;
            
        } catch (error) {
            this.log('error', 'Error inicializando PayPal processor', { error: error.message });
            throw error;
        }
    }

    /**
     * Carga el SDK de PayPal dinámicamente
     */
    async loadPayPalSDK(clientId, currency = 'USD') {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            if (window.paypal) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&locale=es_ES`;
            script.async = true;
            
            script.onload = () => {
                this.log('info', 'PayPal SDK cargado correctamente');
                resolve();
            };
            
            script.onerror = () => {
                const error = 'Error cargando PayPal SDK';
                this.log('error', error);
                reject(new Error(error));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Crea una sesión de pago PayPal
     */
    async createPaymentSession(orderData) {
        try {
            this.log('info', 'Creando sesión de pago PayPal', { orderId: orderData.orderId });
            
            // Validar datos de la orden
            const validation = this.validateOrderData(orderData);
            if (!validation.isValid) {
                throw new Error(`Datos de orden inválidos: ${validation.errors.join(', ')}`);
            }
            
            // Formatear datos para PayPal
            const paypalOrderData = PaymentFormatting.formatForPayPal(orderData, orderData.customer);
            
            this.currentOrder = {
                ...orderData,
                paypalData: paypalOrderData,
                sessionId: PaymentFormatting.generateTransactionId(),
                createdAt: new Date().toISOString()
            };
            
            this.log('info', 'Sesión de pago PayPal creada', { sessionId: this.currentOrder.sessionId });
            
            return {
                sessionId: this.currentOrder.sessionId,
                processor: 'paypal',
                data: paypalOrderData
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
            this.log('info', 'Renderizando interfaz PayPal');
            
            if (!this.isInitialized) {
                throw new Error('PayPal processor no está inicializado');
            }
            
            // Limpiar contenedor
            container.innerHTML = '';
            
            // Crear contenedor específico para PayPal
            const paypalContainer = document.createElement('div');
            paypalContainer.id = 'paypal-button-container';
            paypalContainer.className = 'paypal-container';
            container.appendChild(paypalContainer);
            
            // Crear sesión de pago
            const session = await this.createPaymentSession(orderData);
            
            // Renderizar botones de PayPal
            this.paypalButtons = window.paypal.Buttons({
                style: {
                    layout: this.config.config.style.layout,
                    color: this.config.config.style.color,
                    shape: this.config.config.style.shape,
                    label: this.config.config.style.label,
                    height: this.config.config.style.height
                },
                
                createOrder: (data, actions) => {
                    this.log('info', 'PayPal createOrder llamado');
                    
                    return actions.order.create(this.currentOrder.paypalData);
                },
                
                onApprove: (data, actions) => {
                    this.log('info', 'PayPal onApprove llamado', { orderID: data.orderID });
                    
                    return actions.order.capture().then((details) => {
                        return this.handlePaymentSuccess(details, data);
                    });
                },
                
                onError: (err) => {
                    this.log('error', 'Error en PayPal', { error: err });
                    this.handlePaymentError(err);
                },
                
                onCancel: (data) => {
                    this.log('info', 'Pago PayPal cancelado', data);
                    this.handlePaymentCancel(data);
                }
            });
            
            // Renderizar en el contenedor
            await this.paypalButtons.render('#paypal-button-container');
            
            this.log('info', 'Interfaz PayPal renderizada correctamente');
            
        } catch (error) {
            this.log('error', 'Error renderizando interfaz PayPal', { error: error.message });
            this.showError(container, error.message);
            throw error;
        }
    }

    /**
     * Maneja el éxito del pago
     */
    async handlePaymentSuccess(details, data) {
        try {
            this.log('info', 'Pago PayPal exitoso', { 
                transactionId: details.id,
                orderID: data.orderID 
            });
            
            const result = {
                success: true,
                transactionId: details.id,
                orderId: data.orderID,
                amount: details.purchase_units[0].amount.value,
                currency: details.purchase_units[0].amount.currency_code,
                processor: 'paypal',
                timestamp: new Date().toISOString(),
                details: details
            };
            
            // Notificar al sistema principal
            this.notifyPaymentComplete(result);
            
            // Mostrar mensaje de éxito
            this.showSuccess();
            
            return result;
            
        } catch (error) {
            this.log('error', 'Error procesando éxito de PayPal', { error: error.message });
            throw error;
        }
    }

    /**
     * Maneja errores de pago
     */
    handlePaymentError(error) {
        this.log('error', 'Error en pago PayPal', { error });
        
        const formattedError = PaymentFormatting.formatError(error, 'paypal');
        
        // Notificar al sistema principal
        this.notifyPaymentError(formattedError);
        
        // Mostrar error al usuario
        this.showError(null, formattedError.message);
    }

    /**
     * Maneja cancelación de pago
     */
    handlePaymentCancel(data) {
        this.log('info', 'Pago PayPal cancelado por el usuario', data);
        
        // Notificar al sistema principal
        this.notifyPaymentCancel({
            processor: 'paypal',
            orderId: data.orderID,
            timestamp: new Date().toISOString()
        });
        
        // Mostrar mensaje de cancelación
        this.showCancel();
    }

    /**
     * Procesa un pago (para compatibilidad con la interfaz)
     */
    async processPayment(paymentData) {
        // En PayPal, el procesamiento se maneja en el callback onApprove
        // Este método existe para compatibilidad con la interfaz
        throw new Error('processPayment no se usa directamente en PayPal. Use renderPaymentUI.');
    }

    /**
     * Maneja callbacks (para webhooks futuros)
     */
    async handleCallback(response) {
        this.log('info', 'Callback recibido de PayPal', response);
        
        // Aquí se manejarían webhooks de PayPal para confirmación adicional
        return {
            success: true,
            processed: true,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Valida una transacción
     */
    async validateTransaction(transactionId) {
        try {
            this.log('info', 'Validando transacción PayPal', { transactionId });
            
            // En un entorno real, aquí harías una llamada a la API de PayPal
            // para verificar el estado de la transacción
            
            return {
                isValid: true,
                transactionId: transactionId,
                status: 'completed',
                processor: 'paypal'
            };
            
        } catch (error) {
            this.log('error', 'Error validando transacción PayPal', { error: error.message });
            throw error;
        }
    }

    /**
     * Obtiene el estado de una transacción
     */
    async getTransactionStatus(transactionId) {
        try {
            // En un entorno real, aquí harías una llamada a la API de PayPal
            return 'completed';
            
        } catch (error) {
            this.log('error', 'Error obteniendo estado de transacción', { error: error.message });
            return 'unknown';
        }
    }

    /**
     * Obtiene monedas soportadas
     */
    getSupportedCurrencies() {
        return this.config.supportedCurrencies || ['USD', 'EUR', 'CAD'];
    }

    /**
     * Obtiene información de tarifas
     */
    getFees() {
        return this.config.fees || { domestic: { percent: 4.0, fixed: 0.30 } };
    }

    /**
     * Obtiene características soportadas
     */
    getFeatures() {
        return this.config.features || {
            refunds: true,
            subscriptions: true,
            multiCurrency: true,
            savedCards: false,
            webhooks: true,
            expressCheckout: true
        };
    }
                    <p>Tu orden ha sido procesada correctamente.</p>
                    <p>Recibirás un email de confirmación en breve.</p>
                </div>
            `;
        }
    }

    /**
     * Muestra mensaje de error
     */
    showError(container, message) {
        const targetContainer = container || document.getElementById('paypal-button-container');
        if (targetContainer) {
            targetContainer.innerHTML = `
                <div class="payment-error">
                    <div class="error-icon">❌</div>
                    <h3>Error al procesar el pago</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-button">
                        Intentar nuevamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Muestra mensaje de cancelación
     */
    showCancel() {
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = `
                <div class="payment-cancel">
                    <div class="cancel-icon">⚠️</div>
                    <h3>Pago cancelado</h3>
                    <p>Has cancelado el proceso de pago.</p>
                    <button onclick="location.reload()" class="retry-button">
                        Intentar nuevamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Obtiene información específica de PayPal
     */
    getPayPalInfo() {
        return {
            ...this.getInfo(),
            sdkLoaded: this.paypalLoaded,
            currentSession: this.currentOrder ? {
                sessionId: this.currentOrder.sessionId,
                createdAt: this.currentOrder.createdAt
            } : null,
            environment: this.config?.config?.environment || 'production'
        };
    }

    /**
     * Habilita modo debug (para desarrollo)
     */
    enableDebugMode() {
        this.debugMode = true;
        this.log('info', 'Modo debug habilitado para PayPal');
        
        // Agregar información de debug al DOM
        if (this.debugMode) {
            const debugInfo = document.createElement('div');
            debugInfo.id = 'paypal-debug-info';
            debugInfo.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
                max-width: 300px;
            `;
            debugInfo.innerHTML = `
                <strong>PayPal Debug</strong><br>
                Inicializado: ${this.isInitialized}<br>
                SDK Cargado: ${this.paypalLoaded}<br>
                Sesión activa: ${this.currentOrder ? 'Sí' : 'No'}
            `;
            document.body.appendChild(debugInfo);
        }
    }

    /**
     * Deshabilita modo debug
     */
    disableDebugMode() {
        this.debugMode = false;
        const debugInfo = document.getElementById('paypal-debug-info');
        if (debugInfo) {
            debugInfo.remove();
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PayPalProcessor;
}

// También hacer disponible globalmente para fácil acceso
if (typeof window !== 'undefined') {
    window.PayPalProcessor = PayPalProcessor;
}

console.log('✅ PayPalProcessor cargado correctamente');
