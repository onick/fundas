/**
 * PAYMENT FORMATTING UTILITIES
 * Funciones de formateo comunes para datos de pago
 */

const PaymentFormatting = {

    /**
     * Formatea datos de orden para PayPal
     * @param {Object} cartData - Datos del carrito
     * @param {Object} customerData - Datos del cliente
     * @returns {Object} - Datos formateados para PayPal
     */
    formatForPayPal(cartData, customerData) {
        const items = cartData.items.map(item => ({
            name: item.name,
            description: item.subtitle || item.description || '',
            quantity: item.quantity.toString(),
            unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2)
            }
        }));

        const totalAmount = cartData.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );

        // Agregar envío si aplica
        const shippingAmount = cartData.shipping || 5.99;
        
        return {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: this.generateOrderId(),
                description: 'Compra en Empácame - Bolsas de envío premium',
                custom_id: `empacame_${Date.now()}`,
                invoice_id: `INV_${Date.now()}`,
                
                amount: {
                    currency_code: 'USD',
                    value: (totalAmount + shippingAmount).toFixed(2),
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: totalAmount.toFixed(2)
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: shippingAmount.toFixed(2)
                        }
                    }
                },
                
                items: items,
                
                shipping: {
                    name: {
                        full_name: customerData.name || 'Cliente Empácame'
                    },
                    address: {
                        address_line_1: customerData.address || '',
                        admin_area_2: customerData.city || 'Santo Domingo',
                        admin_area_1: customerData.state || 'Nacional',
                        postal_code: customerData.postalCode || '10000',
                        country_code: 'DO'
                    }
                },
                
                payee: {
                    email_address: 'empacame@outlook.com',
                    merchant_id: 'EMPACAME_MERCHANT_ID'
                }
            }],
            
            application_context: {
                brand_name: 'Empácame',
                locale: 'es-DO',
                landing_page: 'BILLING',
                shipping_preference: 'SET_PROVIDED_ADDRESS',
                user_action: 'PAY_NOW',
                return_url: `${window.location.origin}/payment-success`,
                cancel_url: `${window.location.origin}/payment-cancel`
            }
        };
    },

    /**
     * Formatea datos para procesadores locales (Azul, CardNet)
     * @param {Object} cartData - Datos del carrito
     * @param {Object} customerData - Datos del cliente
     * @returns {Object} - Datos formateados para procesadores locales
     */
    formatForLocalProcessor(cartData, customerData) {
        const totalAmount = cartData.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const shippingAmount = cartData.shipping || 5.99;
        const finalAmount = totalAmount + shippingAmount;

        return {
            orderId: this.generateOrderId(),
            amount: (finalAmount * 60).toFixed(2), // Convertir USD a DOP aproximado
            currency: 'DOP',
            description: 'Compra en Empácame',
            
            customer: {
                name: customerData.name || '',
                email: customerData.email || '',
                phone: customerData.phone || '',
                address: {
                    street: customerData.address || '',
                    city: customerData.city || 'Santo Domingo',
                    state: customerData.state || 'Nacional',
                    zipCode: customerData.postalCode || '10000',
                    country: 'DO'
                }
            },
            
            items: cartData.items.map(item => ({
                id: item.id,
                name: item.name,
                description: item.subtitle || '',
                quantity: item.quantity,
                unitPrice: (item.price * 60).toFixed(2), // USD a DOP
                totalPrice: (item.price * item.quantity * 60).toFixed(2)
            })),
            
            shipping: {
                cost: (shippingAmount * 60).toFixed(2),
                method: 'Envío estándar'
            },
            
            metadata: {
                source: 'empacame_website',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer
            }
        };
    },

    /**
     * Genera un ID único para la orden
     * @returns {string} - ID único
     */
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `EMP_${timestamp}_${random.toUpperCase()}`;
    },

    /**
     * Genera un ID único para transacciones
     * @returns {string} - ID de transacción único
     */
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TXN_${timestamp}_${random.toUpperCase()}`;
    },

    /**
     * Formatea el resumen de la orden para mostrar al usuario
     * @param {Object} orderData - Datos de la orden
     * @returns {Object} - Resumen formateado
     */
    formatOrderSummary(orderData) {
        const subtotal = orderData.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const shipping = orderData.shipping || 5.99;
        const total = subtotal + shipping;

        return {
            items: orderData.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: this.formatMoney(item.price),
                totalPrice: this.formatMoney(item.price * item.quantity)
            })),
            
            totals: {
                subtotal: this.formatMoney(subtotal),
                shipping: this.formatMoney(shipping),
                total: this.formatMoney(total)
            },
            
            itemCount: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
            
            formatted: {
                currency: 'USD',
                locale: 'es-DO'
            }
        };
    },

    /**
     * Formatea un monto como dinero
     * @param {number} amount - Monto
     * @param {string} currency - Moneda
     * @returns {string} - Monto formateado
     */
    formatMoney(amount, currency = 'USD') {
        const locale = currency === 'DOP' ? 'es-DO' : 'en-US';
        
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            return `${currency} ${amount.toFixed(2)}`;
        }
    },

    /**
     * Convierte USD a DOP (aproximado)
     * @param {number} usdAmount - Monto en USD
     * @param {number} exchangeRate - Tasa de cambio (opcional)
     * @returns {number} - Monto en DOP
     */
    convertUSDtoDOP(usdAmount, exchangeRate = 60) {
        return parseFloat((usdAmount * exchangeRate).toFixed(2));
    },

    /**
     * Convierte DOP a USD (aproximado)
     * @param {number} dopAmount - Monto en DOP
     * @param {number} exchangeRate - Tasa de cambio (opcional)
     * @returns {number} - Monto en USD
     */
    convertDOPtoUSD(dopAmount, exchangeRate = 60) {
        return parseFloat((dopAmount / exchangeRate).toFixed(2));
    },

    /**
     * Formatea datos para webhooks/callbacks
     * @param {Object} transactionData - Datos de la transacción
     * @returns {Object} - Datos formateados para webhook
     */
    formatWebhookData(transactionData) {
        return {
            eventType: transactionData.eventType,
            timestamp: new Date().toISOString(),
            transactionId: transactionData.transactionId,
            orderId: transactionData.orderId,
            amount: transactionData.amount,
            currency: transactionData.currency,
            status: transactionData.status,
            processor: transactionData.processor,
            
            customer: {
                email: transactionData.customer?.email,
                name: transactionData.customer?.name
            },
            
            metadata: {
                userAgent: navigator.userAgent,
                source: 'empacame_payments',
                version: '1.0.0'
            }
        };
    },

    /**
     * Formatea errores para el usuario
     * @param {Error} error - Error original
     * @param {string} processor - Nombre del procesador
     * @returns {Object} - Error formateado
     */
    formatError(error, processor = 'unknown') {
        return {
            message: this.getUserFriendlyErrorMessage(error.message),
            code: error.code || 'UNKNOWN_ERROR',
            processor: processor,
            timestamp: new Date().toISOString(),
            technical: error.message, // Para debugging
            
            actions: {
                retry: true,
                contact: error.code === 'CONFIGURATION_ERROR' ? false : true
            }
        };
    },

    /**
     * Convierte mensajes técnicos a mensajes amigables
     * @param {string} technicalMessage - Mensaje técnico
     * @returns {string} - Mensaje amigable para el usuario
     */
    getUserFriendlyErrorMessage(technicalMessage) {
        const errorMap = {
            'INSUFFICIENT_FUNDS': 'Fondos insuficientes en tu cuenta',
            'CARD_DECLINED': 'Tu tarjeta fue declinada',
            'NETWORK_ERROR': 'Error de conexión. Por favor, intenta nuevamente',
            'TIMEOUT': 'La transacción tomó demasiado tiempo. Intenta nuevamente',
            'INVALID_AMOUNT': 'El monto ingresado no es válido',
            'CONFIGURATION_ERROR': 'Error de configuración. Contacta al soporte',
            'AUTHENTICATION_FAILED': 'Error de autenticación'
        };

        // Buscar mensajes conocidos
        for (const [code, message] of Object.entries(errorMap)) {
            if (technicalMessage.includes(code)) {
                return message;
            }
        }

        // Mensaje genérico si no se encuentra uno específico
        return 'Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.';
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentFormatting;
}

// También hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.PaymentFormatting = PaymentFormatting;
}
