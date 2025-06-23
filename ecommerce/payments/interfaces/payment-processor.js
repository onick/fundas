/**
 * PAYMENT PROCESSOR INTERFACE
 * Interface común para todos los procesadores de pago
 * Garantiza consistencia y facilita el intercambio de procesadores
 */

class PaymentProcessor {
    constructor(config) {
        if (new.target === PaymentProcessor) {
            throw new Error("PaymentProcessor es una interfaz abstracta");
        }
        this.config = config;
        this.isInitialized = false;
        this.name = this.constructor.name.replace('Processor', '').toLowerCase();
    }

    /**
     * Inicializa el procesador de pago
     * @param {Object} config - Configuración específica del procesador
     * @returns {Promise<boolean>} - True si se inicializó correctamente
     */
    async initialize(config) {
        throw new Error("Método initialize() debe ser implementado");
    }

    /**
     * Crea una sesión de pago
     * @param {Object} orderData - Datos de la orden
     * @param {number} orderData.amount - Monto total
     * @param {string} orderData.currency - Moneda (USD, DOP, etc.)
     * @param {Object} orderData.items - Items del carrito
     * @param {Object} orderData.customer - Datos del cliente
     * @returns {Promise<Object>} - Datos de la sesión de pago
     */
    async createPaymentSession(orderData) {
        throw new Error("Método createPaymentSession() debe ser implementado");
    }

    /**
     * Procesa el pago
     * @param {Object} paymentData - Datos del pago
     * @returns {Promise<Object>} - Resultado del pago
     */
    async processPayment(paymentData) {
        throw new Error("Método processPayment() debe ser implementado");
    }

    /**
     * Maneja las respuestas/callbacks del procesador
     * @param {Object} response - Respuesta del procesador
     * @returns {Promise<Object>} - Resultado procesado
     */
    async handleCallback(response) {
        throw new Error("Método handleCallback() debe ser implementado");
    }

    /**
     * Valida una transacción
     * @param {string} transactionId - ID de la transacción
     * @returns {Promise<Object>} - Estado de la transacción
     */
    async validateTransaction(transactionId) {
        throw new Error("Método validateTransaction() debe ser implementado");
    }

    /**
     * Obtiene el estado de una transacción
     * @param {string} transactionId - ID de la transacción
     * @returns {Promise<string>} - Estado: 'pending', 'completed', 'failed', 'cancelled'
     */
    async getTransactionStatus(transactionId) {
        throw new Error("Método getTransactionStatus() debe ser implementado");
    }

    /**
     * Renderiza la interfaz de pago
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @param {Object} orderData - Datos de la orden
     * @returns {Promise<void>}
     */
    async renderPaymentUI(container, orderData) {
        throw new Error("Método renderPaymentUI() debe ser implementado");
    }

    /**
     * Limpia la interfaz de pago
     * @returns {void}
     */
    cleanup() {
        // Implementación base - puede ser sobrescrita
        console.log(`🧹 Limpiando interfaz de ${this.name}`);
    }

    /**
     * Obtiene información del procesador
     * @returns {Object} - Información del procesador
     */
    getInfo() {
        return {
            name: this.name,
            isInitialized: this.isInitialized,
            supportedCurrencies: this.getSupportedCurrencies(),
            fees: this.getFees(),
            features: this.getFeatures()
        };
    }

    /**
     * Obtiene las monedas soportadas
     * @returns {Array<string>} - Array de códigos de moneda
     */
    getSupportedCurrencies() {
        throw new Error("Método getSupportedCurrencies() debe ser implementado");
    }

    /**
     * Obtiene la estructura de tarifas
     * @returns {Object} - Objeto con tarifas
     */
    getFees() {
        throw new Error("Método getFees() debe ser implementado");
    }

    /**
     * Obtiene las características soportadas
     * @returns {Object} - Características soportadas
     */
    getFeatures() {
        return {
            refunds: false,
            subscriptions: false,
            multiCurrency: false,
            savedCards: false,
            webhooks: false
        };
    }

    /**
     * Valida datos de orden antes de procesar
     * @param {Object} orderData - Datos a validar
     * @returns {Object} - { isValid: boolean, errors: Array }
     */
    validateOrderData(orderData) {
        const errors = [];

        if (!orderData.amount || orderData.amount <= 0) {
            errors.push("El monto debe ser mayor a 0");
        }

        if (!orderData.currency) {
            errors.push("La moneda es requerida");
        }

        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            errors.push("Los items son requeridos");
        }

        if (!orderData.customer || !orderData.customer.email) {
            errors.push("El email del cliente es requerido");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Formatea el monto según el procesador
     * @param {number} amount - Monto a formatear
     * @param {string} currency - Moneda
     * @returns {string} - Monto formateado
     */
    formatAmount(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Log específico del procesador
     * @param {string} level - Nivel: 'info', 'warn', 'error'
     * @param {string} message - Mensaje
     * @param {Object} data - Datos adicionales
     */
    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            processor: this.name,
            level,
            message,
            data
        };
        
        console.log(`💳 [${this.name.toUpperCase()}] ${message}`, data);
        
        // Aquí podrías enviar a un servicio de logging
        if (level === 'error') {
            this.reportError(logEntry);
        }
    }

    /**
     * Reporta errores para analytics
     * @param {Object} errorData - Datos del error
     */
    reportError(errorData) {
        // Implementación base - enviar a analytics
        window.paymentAnalytics?.reportError(errorData);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentProcessor;
}

// También hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.PaymentProcessor = PaymentProcessor;
}
