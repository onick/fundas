/**
 * PAYMENT CONFIGURATION
 * Configuración centralizada para todos los procesadores de pago
 * Permite fácil gestión y escalabilidad
 */

const PaymentConfig = {
    
    // 🌍 Configuración global
    global: {
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'DOP'],
        fallbackCurrency: 'USD',
        timeout: 30000, // 30 segundos
        retryAttempts: 3,
        environment: 'sandbox', // Cambiar a 'production' cuando esté listo para ventas reales
        
        // 🏪 Información del comercio
        merchant: {
            name: 'Empácame',
            description: 'Bolsas de envío premium para República Dominicana',
            contactEmail: 'empacame@outlook.com',
            phone: '849-449-6394',
            website: 'https://empacame.com',
            address: {
                country: 'DO',
                city: 'Santo Domingo',
                region: 'Nacional'
            }
        },

        // 📊 Analytics
        analytics: {
            enabled: true,
            trackConversion: true,
            trackErrors: true,
            trackPerformance: true
        }
    },

    // 💳 Configuración de procesadores
    processors: {
        
        // 🅿️ PayPal Configuration
        paypal: {
            enabled: true,
            priority: 1,
            name: 'PayPal',
            displayName: 'PayPal',
            description: 'Paga de forma segura con PayPal',
            logo: 'assets/img/logos/paypal-logo.svg',
            
            // Configuración específica de PayPal
            config: {
                clientId: {
                    sandbox: 'YOUR_PAYPAL_SANDBOX_CLIENT_ID',
                    production: 'YOUR_PAYPAL_PRODUCTION_CLIENT_ID'
                },
                currency: 'USD',
                intent: 'capture', // 'capture' o 'authorize'
                
                // Configuración de interfaz
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal',
                    height: 40
                },
                
                // Configuración de experiencia
                experience: {
                    input_fields: {
                        no_shipping: 0, // Permitir dirección de envío
                        address_override: 0
                    },
                    flow_config: {
                        landing_page_type: 'billing',
                        bank_txn_pending_url: 'https://empacame.com'
                    }
                }
            },
            
            fees: {
                domestic: { percent: 4.0, fixed: 0.30 },
                international: { percent: 4.4, fixed: 0.30 }
            },
            
            features: {
                refunds: true,
                subscriptions: true,
                multiCurrency: true,
                savedCards: false,
                webhooks: true,
                expressCheckout: true
            },
            
            limits: {
                minAmount: 1.00,
                maxAmount: 10000.00
            },
            
            supportedCurrencies: ['USD', 'EUR', 'CAD', 'GBP']
        },

        // 🔵 Azul Configuration (Para futuro)
        azul: {
            enabled: false,
            priority: 2,
            name: 'azul',
            displayName: 'Azul',
            description: 'Paga con tarjetas de crédito y débito',
            logo: 'assets/img/logos/azul-logo.svg',
            
            config: {
                merchantId: '',
                apiKey: '',
                environment: 'sandbox', // 'sandbox' o 'production'
                currency: 'DOP'
            },
            
            fees: {
                credit: { percent: 3.5, fixed: 0 },
                debit: { percent: 2.5, fixed: 0 }
            },
            
            features: {
                refunds: true,
                subscriptions: false,
                multiCurrency: false,
                savedCards: true,
                webhooks: true
            },
            
            limits: {
                minAmount: 50.00, // DOP
                maxAmount: 500000.00 // DOP
            },
            
            supportedCurrencies: ['DOP']
        },

        // 📱 tPago Configuration (Para futuro)
        tpago: {
            enabled: false,
            priority: 3,
            name: 'tpago',
            displayName: 'tPago',
            description: 'Pago móvil rápido y seguro',
            logo: 'assets/img/logos/tpago-logo.svg',
            
            config: {
                merchantCode: '',
                apiKey: '',
                environment: 'sandbox'
            },
            
            fees: {
                mobile: { percent: 2.0, fixed: 0 }
            },
            
            features: {
                refunds: false,
                subscriptions: false,
                multiCurrency: false,
                savedCards: false,
                webhooks: false
            },
            
            limits: {
                minAmount: 100.00, // DOP
                maxAmount: 50000.00 // DOP
            },
            
            supportedCurrencies: ['DOP']
        }
    },

    // 🎨 Configuración de UI
    ui: {
        theme: {
            primaryColor: '#FF8C00',
            secondaryColor: '#1A2332',
            accentColor: '#00A8CC',
            successColor: '#00B96B',
            errorColor: '#FF4757'
        },
        
        layout: {
            showProcessorLogos: true,
            showFees: false,
            showSecurity: true,
            compactMode: false
        },
        
        messages: {
            es: {
                selectPayment: 'Selecciona tu método de pago',
                processing: 'Procesando pago...',
                success: '¡Pago completado exitosamente!',
                error: 'Error al procesar el pago',
                cancel: 'Pago cancelado',
                retry: 'Intentar nuevamente',
                back: 'Volver'
            },
            en: {
                selectPayment: 'Select your payment method',
                processing: 'Processing payment...',
                success: 'Payment completed successfully!',
                error: 'Error processing payment',
                cancel: 'Payment cancelled',
                retry: 'Try again',
                back: 'Back'
            }
        },
        
        defaultLanguage: 'es'
    },

    // 🔐 Configuración de seguridad
    security: {
        enableCSRF: true,
        enableEncryption: true,
        sessionTimeout: 1800000, // 30 minutos
        
        validation: {
            strictAmountValidation: true,
            allowDecimalAmounts: true,
            maxDecimalPlaces: 2
        }
    },

    // 📈 Configuración de analytics
    analytics: {
        events: {
            paymentStarted: 'payment_started',
            paymentCompleted: 'payment_completed',
            paymentFailed: 'payment_failed',
            paymentCancelled: 'payment_cancelled',
            processorSelected: 'processor_selected'
        },
        
        trackingEnabled: true,
        debugMode: false
    }
};

/**
 * Obtiene la configuración de un procesador específico
 * @param {string} processorName - Nombre del procesador
 * @returns {Object|null} - Configuración del procesador
 */
PaymentConfig.getProcessorConfig = function(processorName) {
    return this.processors[processorName] || null;
};

/**
 * Obtiene solo los procesadores habilitados
 * @returns {Object} - Procesadores habilitados ordenados por prioridad
 */
PaymentConfig.getEnabledProcessors = function() {
    const enabled = Object.entries(this.processors)
        .filter(([name, config]) => config.enabled)
        .sort(([,a], [,b]) => a.priority - b.priority);
    
    return Object.fromEntries(enabled);
};

/**
 * Actualiza la configuración de un procesador
 * @param {string} processorName - Nombre del procesador
 * @param {Object} updates - Actualizaciones a aplicar
 */
PaymentConfig.updateProcessorConfig = function(processorName, updates) {
    if (this.processors[processorName]) {
        this.processors[processorName] = {
            ...this.processors[processorName],
            ...updates
        };
    }
};

/**
 * Habilita o deshabilita un procesador
 * @param {string} processorName - Nombre del procesador
 * @param {boolean} enabled - Estado habilitado
 */
PaymentConfig.toggleProcessor = function(processorName, enabled) {
    if (this.processors[processorName]) {
        this.processors[processorName].enabled = enabled;
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentConfig;
}

// También hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.PaymentConfig = PaymentConfig;
}
