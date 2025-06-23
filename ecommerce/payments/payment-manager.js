/**
 * PAYMENT MANAGER
 * Orquestador principal del sistema de pagos modular
 * Gestiona múltiples procesadores de forma unificada
 */

class PaymentManager {
    constructor() {
        this.processors = new Map();
        this.activeProcessor = null;
        this.config = null;
        this.isInitialized = false;
        this.currentOrder = null;
        this.analytics = {
            attempts: 0,
            successes: 0,
            failures: 0,
            cancellations: 0,
            processorStats: {}
        };
    }

    /**
     * Inicializa el Payment Manager
     * @param {Object} config - Configuración completa del sistema
     */
    async initialize(config) {
        try {
            console.log('🚀 Inicializando Payment Manager');
            
            this.config = config;
            
            // Registrar procesadores habilitados
            await this.registerEnabledProcessors();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Inicializar analytics
            this.initializeAnalytics();
            
            this.isInitialized = true;
            
            console.log('✅ Payment Manager inicializado correctamente');
            console.log(`📊 Procesadores disponibles: ${Array.from(this.processors.keys()).join(', ')}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando Payment Manager:', error);
            throw error;
        }
    }

    /**
     * Registra todos los procesadores habilitados
     */
    async registerEnabledProcessors() {
        const enabledProcessors = PaymentConfig.getEnabledProcessors();
        
        for (const [name, processorConfig] of Object.entries(enabledProcessors)) {
            try {
                await this.registerProcessor(name, processorConfig);
            } catch (error) {
                console.warn(`⚠️ No se pudo registrar procesador ${name}:`, error.message);
            }
        }
        
        if (this.processors.size === 0) {
            throw new Error('No se pudo registrar ningún procesador de pago');
        }
    }

    /**
     * Registra un procesador específico
     * @param {string} name - Nombre del procesador
     * @param {Object} config - Configuración del procesador
     */
    async registerProcessor(name, config) {
        try {
            let processor;
            
            switch (name) {
                case 'paypal':
                    processor = new PayPalProcessor(config);
                    break;
                case 'azul':
                    // Para futuro: processor = new AzulProcessor(config);
                    console.log('🔮 Azul processor pendiente de implementación');
                    return;
                case 'tpago':
                    // Para futuro: processor = new TPagoProcessor(config);
                    console.log('🔮 tPago processor pendiente de implementación');
                    return;
                default:
                    throw new Error(`Procesador desconocido: ${name}`);
            }
            
            // Inicializar el procesador
            await processor.initialize(this.config);
            
            // Registrar en el mapa
            this.processors.set(name, processor);
            
            // Configurar como procesador por defecto si es el primero o tiene prioridad más alta
            if (!this.activeProcessor || config.priority < this.getActiveProcessor()?.config?.priority) {
                this.activeProcessor = name;
            }
            
            // Inicializar stats del procesador
            this.analytics.processorStats[name] = {
                attempts: 0,
                successes: 0,
                failures: 0,
                revenue: 0
            };
            
            console.log(`✅ Procesador ${name} registrado exitosamente`);
            
        } catch (error) {
            console.error(`❌ Error registrando procesador ${name}:`, error);
            throw error;
        }
    }

    /**
     * Configura event listeners para el sistema
     */
    setupEventListeners() {
        // Listeners para eventos de pago
        document.addEventListener('paymentComplete', (event) => {
            this.handlePaymentComplete(event.detail);
        });
        
        document.addEventListener('paymentError', (event) => {
            this.handlePaymentError(event.detail);
        });
        
        document.addEventListener('paymentCancel', (event) => {
            this.handlePaymentCancel(event.detail);
        });

        // Listener para cambios de procesador
        document.addEventListener('processorChanged', (event) => {
            this.handleProcessorChange(event.detail);
        });
    }

    /**
     * Inicializa el sistema de analytics
     */
    initializeAnalytics() {
        // Configurar analytics básico
        this.analytics.sessionId = this.generateSessionId();
        this.analytics.startTime = new Date().toISOString();
        
        console.log(`📊 Analytics inicializado - Sesión: ${this.analytics.sessionId}`);
    }

    /**
     * Inicia un proceso de pago
     * @param {Object} orderData - Datos de la orden
     * @param {string} processorName - Procesador específico (opcional)
     */
    async startPayment(orderData, processorName = null) {
        try {
            console.log('💳 Iniciando proceso de pago');
            
            if (!this.isInitialized) {
                throw new Error('Payment Manager no está inicializado');
            }
            
            // Validar datos de la orden
            const validation = PaymentValidation.validateOrderData(orderData);
            if (!validation.isValid) {
                throw new Error(`Datos de orden inválidos: ${validation.errors.join(', ')}`);
            }
            
            // Determinar procesador a usar
            const processor = processorName ? 
                this.getProcessor(processorName) : 
                this.getActiveProcessor();
            
            if (!processor) {
                throw new Error('No hay procesadores disponibles');
            }
            
            // Agregar metadata a la orden
            this.currentOrder = {
                ...orderData,
                sessionId: this.analytics.sessionId,
                processorName: processor.name,
                startTime: new Date().toISOString(),
                orderId: orderData.orderId || PaymentFormatting.generateOrderId()
            };
            
            // Registrar intento
            this.recordAttempt(processor.name);
            
            // Crear sesión de pago
            const session = await processor.createPaymentSession(this.currentOrder);
            
            console.log(`✅ Sesión de pago creada con ${processor.name}`);
            
            return {
                success: true,
                session: session,
                processor: processor.name,
                orderId: this.currentOrder.orderId
            };
            
        } catch (error) {
            console.error('❌ Error iniciando pago:', error);
            this.recordFailure(processorName || this.activeProcessor);
            throw error;
        }
    }

    /**
     * Renderiza la interfaz de pago
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @param {Object} orderData - Datos de la orden
     * @param {Object} options - Opciones de renderizado
     */
    async renderPaymentInterface(container, orderData, options = {}) {
        try {
            console.log('🎨 Renderizando interfaz de pago');
            
            // Limpiar contenedor
            container.innerHTML = '';
            
            // Crear estructura base
            const paymentWrapper = this.createPaymentWrapper(container);
            
            // Si hay múltiples procesadores, mostrar selector
            if (this.processors.size > 1 && !options.hideSelector) {
                this.renderProcessorSelector(paymentWrapper.selectorContainer);
            }
            
            // Renderizar procesador activo
            await this.renderActiveProcessor(paymentWrapper.processorContainer, orderData);
            
        } catch (error) {
            console.error('❌ Error renderizando interfaz:', error);
            this.showError(container, error.message);
        }
    }

    /**
     * Crea la estructura base de la interfaz de pago
     */
    createPaymentWrapper(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'payment-manager-wrapper';
        wrapper.innerHTML = `
            <div class="payment-header">
                <h3>Método de pago</h3>
            </div>
            <div class="payment-selector-container"></div>
            <div class="payment-processor-container"></div>
            <div class="payment-footer">
                <div class="security-badge">
                    🔒 Pago 100% seguro y encriptado
                </div>
            </div>
        `;
        
        container.appendChild(wrapper);
        
        return {
            wrapper: wrapper,
            selectorContainer: wrapper.querySelector('.payment-selector-container'),
            processorContainer: wrapper.querySelector('.payment-processor-container'),
            footerContainer: wrapper.querySelector('.payment-footer')
        };
    }

    /**
     * Renderiza el selector de procesadores
     */
    renderProcessorSelector(container) {
        const enabledProcessors = Array.from(this.processors.entries());
        
        if (enabledProcessors.length <= 1) {
            return;
        }
        
        const selector = document.createElement('div');
        selector.className = 'processor-selector';
        selector.innerHTML = `
            <div class="selector-title">Elige tu método de pago:</div>
            <div class="processor-options">
                ${enabledProcessors.map(([name, processor]) => `
                    <button class="processor-option ${name === this.activeProcessor ? 'active' : ''}" 
                            data-processor="${name}">
                        <img src="${processor.config.logo}" alt="${processor.config.displayName}" 
                             onerror="this.style.display='none'">
                        <span>${processor.config.displayName}</span>
                        <small>${processor.config.description}</small>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Agregar event listeners
        selector.querySelectorAll('.processor-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const processorName = e.currentTarget.dataset.processor;
                this.switchProcessor(processorName);
            });
        });
        
        container.appendChild(selector);
    }

    /**
     * Renderiza el procesador activo
     */
    async renderActiveProcessor(container, orderData) {
        const processor = this.getActiveProcessor();
        
        if (!processor) {
            throw new Error('No hay procesador activo');
        }
        
        console.log(`🎨 Renderizando procesador: ${processor.name}`);
        
        await processor.renderPaymentUI(container, orderData);
    }

    /**
     * Cambia el procesador activo
     */
    async switchProcessor(processorName) {
        try {
            console.log(`🔄 Cambiando a procesador: ${processorName}`);
            
            const processor = this.getProcessor(processorName);
            if (!processor) {
                throw new Error(`Procesador ${processorName} no encontrado`);
            }
            
            // Limpiar procesador anterior
            if (this.activeProcessor) {
                const oldProcessor = this.getActiveProcessor();
                if (oldProcessor) {
                    oldProcessor.cleanup();
                }
            }
            
            // Cambiar procesador activo
            this.activeProcessor = processorName;
            
            // Actualizar UI del selector
            document.querySelectorAll('.processor-option').forEach(button => {
                button.classList.toggle('active', button.dataset.processor === processorName);
            });
            
            // Re-renderizar procesador
            const container = document.querySelector('.payment-processor-container');
            if (container && this.currentOrder) {
                await this.renderActiveProcessor(container, this.currentOrder);
            }
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('processorChanged', {
                detail: { oldProcessor: this.activeProcessor, newProcessor: processorName }
            }));
            
        } catch (error) {
            console.error('❌ Error cambiando procesador:', error);
        }
    }

    /**
     * Maneja completado exitoso de pago
     */
    handlePaymentComplete(result) {
        console.log('✅ Pago completado exitosamente:', result);
        
        // Registrar éxito
        this.recordSuccess(result.processor, result.amount);
        
        // Limpiar orden actual
        this.currentOrder = null;
        
        // Notificar a sistemas externos
        this.notifyExternalSystems('payment_completed', result);
        
        // Disparar evento global
        window.dispatchEvent(new CustomEvent('empacamePaymentSuccess', { 
            detail: result 
        }));
        
        // Analytics
        if (this.config.analytics.trackConversion) {
            this.trackConversion(result);
        }
    }

    /**
     * Maneja errores de pago
     */
    handlePaymentError(error) {
        console.error('❌ Error en pago:', error);
        
        // Registrar fallo
        this.recordFailure(error.processor);
        
        // Notificar a sistemas externos
        this.notifyExternalSystems('payment_failed', error);
        
        // Disparar evento global
        window.dispatchEvent(new CustomEvent('empacamePaymentError', { 
            detail: error 
        }));
        
        // Analytics
        if (this.config.analytics.trackErrors) {
            this.trackError(error);
        }
    }

    /**
     * Maneja cancelación de pago
     */
    handlePaymentCancel(data) {
        console.log('⚠️ Pago cancelado:', data);
        
        // Registrar cancelación
        this.recordCancellation(data.processor);
        
        // Limpiar orden actual
        this.currentOrder = null;
        
        // Notificar a sistemas externos
        this.notifyExternalSystems('payment_cancelled', data);
        
        // Disparar evento global
        window.dispatchEvent(new CustomEvent('empacamePaymentCancel', { 
            detail: data 
        }));
    }

    /**
     * Maneja cambio de procesador
     */
    handleProcessorChange(data) {
        console.log('🔄 Procesador cambiado:', data);
        
        // Analytics del cambio
        this.analytics.processorChanges = (this.analytics.processorChanges || 0) + 1;
    }

    /**
     * Obtiene un procesador por nombre
     */
    getProcessor(name) {
        return this.processors.get(name);
    }

    /**
     * Obtiene el procesador activo
     */
    getActiveProcessor() {
        return this.processors.get(this.activeProcessor);
    }

    /**
     * Obtiene todos los procesadores disponibles
     */
    getAvailableProcessors() {
        return Array.from(this.processors.keys());
    }

    /**
     * Obtiene información del estado actual
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            activeProcessor: this.activeProcessor,
            availableProcessors: this.getAvailableProcessors(),
            currentOrder: this.currentOrder ? {
                orderId: this.currentOrder.orderId,
                processorName: this.currentOrder.processorName,
                startTime: this.currentOrder.startTime
            } : null,
            analytics: { ...this.analytics }
        };
    }

    /**
     * Registra un intento de pago
     */
    recordAttempt(processorName) {
        this.analytics.attempts++;
        if (this.analytics.processorStats[processorName]) {
            this.analytics.processorStats[processorName].attempts++;
        }
    }

    /**
     * Registra un pago exitoso
     */
    recordSuccess(processorName, amount = 0) {
        this.analytics.successes++;
        if (this.analytics.processorStats[processorName]) {
            this.analytics.processorStats[processorName].successes++;
            this.analytics.processorStats[processorName].revenue += parseFloat(amount) || 0;
        }
    }

    /**
     * Registra un fallo de pago
     */
    recordFailure(processorName) {
        this.analytics.failures++;
        if (this.analytics.processorStats[processorName]) {
            this.analytics.processorStats[processorName].failures++;
        }
    }

    /**
     * Registra una cancelación
     */
    recordCancellation(processorName) {
        this.analytics.cancellations++;
        // Las cancelaciones no se consideran fallos del procesador
    }

    /**
     * Obtiene analytics del sistema
     */
    getAnalytics() {
        const conversionRate = this.analytics.attempts > 0 ? 
            (this.analytics.successes / this.analytics.attempts * 100).toFixed(2) : 0;
        
        return {
            ...this.analytics,
            conversionRate: `${conversionRate}%`,
            totalRevenue: Object.values(this.analytics.processorStats)
                .reduce((total, stats) => total + stats.revenue, 0)
        };
    }

    /**
     * Genera un ID único para la sesión
     */
    generateSessionId() {
        return `PM_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    /**
     * Notifica a sistemas externos
     */
    notifyExternalSystems(eventType, data) {
        // Aquí se pueden agregar integraciones con:
        // - Google Analytics
        // - Facebook Pixel
        // - Sistemas de CRM
        // - Webhooks externos
        
        console.log(`📡 Notificando sistemas externos: ${eventType}`, data);
        
        // Ejemplo de integración con Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                event_category: 'ecommerce',
                event_label: data.processor,
                value: data.amount || 0
            });
        }
    }

    /**
     * Rastrea conversión para analytics
     */
    trackConversion(result) {
        console.log('📊 Rastreando conversión:', result);
        
        // Aquí se pueden agregar múltiples servicios de analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                transaction_id: result.transactionId,
                value: result.amount,
                currency: result.currency,
                items: this.currentOrder?.items || []
            });
        }
    }

    /**
     * Rastrea errores para analytics
     */
    trackError(error) {
        console.log('📊 Rastreando error:', error);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    /**
     * Muestra error en la interfaz
     */
    showError(container, message) {
        container.innerHTML = `
            <div class="payment-error">
                <div class="error-icon">❌</div>
                <h3>Error en el sistema de pagos</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-button">
                    Reintentar
                </button>
            </div>
        `;
    }

    /**
     * Limpia todos los procesadores
     */
    cleanup() {
        console.log('🧹 Limpiando Payment Manager');
        
        // Limpiar todos los procesadores
        this.processors.forEach(processor => {
            try {
                processor.cleanup();
            } catch (error) {
                console.warn('Error limpiando procesador:', error);
            }
        });
        
        // Limpiar estado
        this.processors.clear();
        this.activeProcessor = null;
        this.currentOrder = null;
        this.isInitialized = false;
    }

    /**
     * Habilita modo debug
     */
    enableDebugMode() {
        console.log('🐛 Habilitando modo debug');
        this.debugMode = true;
        
        // Habilitar debug en todos los procesadores
        this.processors.forEach(processor => {
            if (processor.enableDebugMode) {
                processor.enableDebugMode();
            }
        });
        
        // Mostrar información de debug
        this.showDebugInfo();
    }

    /**
     * Muestra información de debug
     */
    showDebugInfo() {
        const debugInfo = document.createElement('div');
        debugInfo.id = 'payment-manager-debug';
        debugInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 400px;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        const status = this.getStatus();
        const analytics = this.getAnalytics();
        
        debugInfo.innerHTML = `
            <strong>🚀 Payment Manager Debug</strong><br>
            <hr style="margin: 10px 0;">
            <strong>Estado:</strong><br>
            • Inicializado: ${status.isInitialized}<br>
            • Procesador activo: ${status.activeProcessor}<br>
            • Procesadores: ${status.availableProcessors.join(', ')}<br>
            <br>
            <strong>Analytics:</strong><br>
            • Intentos: ${analytics.attempts}<br>
            • Éxitos: ${analytics.successes}<br>
            • Fallos: ${analytics.failures}<br>
            • Conversión: ${analytics.conversionRate}<br>
            • Revenue: $${analytics.totalRevenue.toFixed(2)}<br>
            <br>
            <button onclick="document.getElementById('payment-manager-debug').remove()" 
                    style="background: #ff4757; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                Cerrar
            </button>
        `;
        
        document.body.appendChild(debugInfo);
    }
}

// Crear instancia global
const paymentManager = new PaymentManager();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.PaymentManager = paymentManager;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentManager;
}
