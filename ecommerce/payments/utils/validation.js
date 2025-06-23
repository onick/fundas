/**
 * PAYMENT VALIDATION UTILITIES
 * Funciones de validación comunes para todos los procesadores
 */

const PaymentValidation = {

    /**
     * Valida un monto de pago
     * @param {number} amount - Monto a validar
     * @param {string} currency - Moneda
     * @param {Object} limits - Límites específicos del procesador
     * @returns {Object} - { isValid: boolean, error: string }
     */
    validateAmount(amount, currency = 'USD', limits = {}) {
        // Convertir a número si es string
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        // Verificar si es un número válido
        if (isNaN(numAmount) || !isFinite(numAmount)) {
            return { isValid: false, error: 'El monto debe ser un número válido' };
        }
        
        // Verificar si es positivo
        if (numAmount <= 0) {
            return { isValid: false, error: 'El monto debe ser mayor a cero' };
        }
        
        // Verificar límites mínimos
        const minAmount = limits.minAmount || 0.01;
        if (numAmount < minAmount) {
            return { 
                isValid: false, 
                error: `El monto mínimo es ${this.formatCurrency(minAmount, currency)}` 
            };
        }
        
        // Verificar límites máximos
        const maxAmount = limits.maxAmount || 999999;
        if (numAmount > maxAmount) {
            return { 
                isValid: false, 
                error: `El monto máximo es ${this.formatCurrency(maxAmount, currency)}` 
            };
        }
        
        // Verificar decimales
        const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            return { 
                isValid: false, 
                error: 'El monto no puede tener más de 2 decimales' 
            };
        }
        
        return { isValid: true, error: null };
    },

    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {Object} - { isValid: boolean, error: string }
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'El email es requerido' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, error: 'El formato del email no es válido' };
        }
        
        return { isValid: true, error: null };
    },

    /**
     * Valida los datos de una orden
     * @param {Object} orderData - Datos de la orden
     * @returns {Object} - { isValid: boolean, errors: Array }
     */
    validateOrderData(orderData) {
        const errors = [];
        
        // Validar estructura básica
        if (!orderData || typeof orderData !== 'object') {
            return { isValid: false, errors: ['Los datos de la orden son requeridos'] };
        }
        
        // Validar monto
        const amountValidation = this.validateAmount(orderData.amount, orderData.currency);
        if (!amountValidation.isValid) {
            errors.push(amountValidation.error);
        }
        
        // Validar moneda
        if (!orderData.currency) {
            errors.push('La moneda es requerida');
        }
        
        // Validar items
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            errors.push('Los items de la orden son requeridos');
        } else {
            // Validar cada item
            orderData.items.forEach((item, index) => {
                if (!item.name) {
                    errors.push(`El item ${index + 1} debe tener un nombre`);
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors.push(`El item ${index + 1} debe tener una cantidad válida`);
                }
                if (!item.price || item.price <= 0) {
                    errors.push(`El item ${index + 1} debe tener un precio válido`);
                }
            });
        }
        
        // Validar información del cliente
        if (!orderData.customer) {
            errors.push('La información del cliente es requerida');
        } else {
            const emailValidation = this.validateEmail(orderData.customer.email);
            if (!emailValidation.isValid) {
                errors.push(emailValidation.error);
            }
            
            if (!orderData.customer.name || orderData.customer.name.trim().length < 2) {
                errors.push('El nombre del cliente debe tener al menos 2 caracteres');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Valida un ID de transacción
     * @param {string} transactionId - ID a validar
     * @returns {Object} - { isValid: boolean, error: string }
     */
    validateTransactionId(transactionId) {
        if (!transactionId || typeof transactionId !== 'string') {
            return { isValid: false, error: 'El ID de transacción es requerido' };
        }
        
        if (transactionId.trim().length < 3) {
            return { isValid: false, error: 'El ID de transacción debe tener al menos 3 caracteres' };
        }
        
        return { isValid: true, error: null };
    },

    /**
     * Valida una moneda
     * @param {string} currency - Código de moneda (ISO 4217)
     * @returns {Object} - { isValid: boolean, error: string }
     */
    validateCurrency(currency) {
        if (!currency || typeof currency !== 'string') {
            return { isValid: false, error: 'La moneda es requerida' };
        }
        
        const validCurrencies = ['USD', 'DOP', 'EUR', 'CAD', 'GBP'];
        if (!validCurrencies.includes(currency.toUpperCase())) {
            return { 
                isValid: false, 
                error: `Moneda no soportada. Monedas válidas: ${validCurrencies.join(', ')}` 
            };
        }
        
        return { isValid: true, error: null };
    },

    /**
     * Formatea un monto con moneda
     * @param {number} amount - Monto a formatear
     * @param {string} currency - Moneda
     * @returns {string} - Monto formateado
     */
    formatCurrency(amount, currency = 'USD') {
        const locale = currency === 'DOP' ? 'es-DO' : 'en-US';
        
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            // Fallback si hay error con el formato
            return `${currency} ${amount.toFixed(2)}`;
        }
    },

    /**
     * Sanitiza datos de entrada
     * @param {any} input - Datos a sanitizar
     * @returns {any} - Datos sanitizados
     */
    sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.trim().replace(/[<>]/g, '');
        }
        
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            Object.keys(input).forEach(key => {
                sanitized[key] = this.sanitizeInput(input[key]);
            });
            return sanitized;
        }
        
        return input;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentValidation;
}

// También hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.PaymentValidation = PaymentValidation;
}

console.log('✅ PaymentValidation cargado correctamente');
