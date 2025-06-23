/**
 * PAYPAL CONFIGURATION SETUP
 * Configuración específica para PayPal - IMPORTANTE: Configurar con claves reales
 */

// 🚨 IMPORTANTE: CONFIGURAR ESTAS CLAVES ANTES DE USAR EN PRODUCCIÓN
const PAYPAL_CONFIG = {
    // Client IDs de PayPal (obtener desde https://developer.paypal.com)
    CLIENT_IDS: {
        // Client ID sandbox para testing
        sandbox: 'AVMFnGbh1zUGeLZf8dROoY7WcKHg7HFsU5uK_NvhiTMsRcJ__SSj9TRkMf8a8c7EzfU4xHrGDw83DM73',
        
        // Client ID producción (usar el mismo por ahora, cambiar cuando tengas uno de producción)
        production: 'EPv5C9CY2I3jXxf59gEbNQtxF8zqr2YpsfNPhyT_nI1yyOTVCEq11ugxvxQIUQMM1WWlsWGfyQusMfZx'
    },
    
    // Configuración del negocio
    MERCHANT_INFO: {
        businessName: 'Empácame',
        merchantId: 'EMPACAME_MERCHANT_ID',
        contactEmail: 'empacame@outlook.com',
        supportPhone: '849-449-6394'
    },
    
    // URLs de retorno (ajustar según tu dominio)
    URLS: {
        returnUrl: 'https://empacame.com/payment-success',
        cancelUrl: 'https://empacame.com/payment-cancel',
        webhookUrl: 'https://empacame.com/webhook/paypal' // Para futuro
    }
};

/**
 * Actualiza la configuración de PayPal con las claves reales
 */
function setupPayPalConfiguration() {
    if (typeof PaymentConfig !== 'undefined') {
        // Actualizar configuración con claves reales
        PaymentConfig.processors.paypal.config.clientId = PAYPAL_CONFIG.CLIENT_IDS;
        
        // Actualizar información del negocio
        PaymentConfig.global.merchant = {
            ...PaymentConfig.global.merchant,
            ...PAYPAL_CONFIG.MERCHANT_INFO
        };
        
        console.log('✅ Configuración de PayPal actualizada');
    } else {
        console.warn('⚠️ PaymentConfig no está disponible aún');
    }
}

// Aplicar configuración cuando esté disponible
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupPayPalConfiguration, 100);
});

// También aplicar si PaymentConfig ya está disponible
if (typeof PaymentConfig !== 'undefined') {
    setupPayPalConfiguration();
}

/**
 * Guía de configuración de PayPal:
 * 
 * 1. Crear cuenta de desarrollador en https://developer.paypal.com
 * 2. Crear una aplicación
 * 3. Obtener Client ID para sandbox y production
 * 4. Reemplazar las claves en PAYPAL_CONFIG.CLIENT_IDS
 * 5. Configurar webhooks si es necesario
 * 6. Actualizar URLs de retorno según tu dominio
 * 
 * Para testing:
 * - Usar environment: 'sandbox'
 * - Usar cuentas de prueba de PayPal
 * 
 * Para producción:
 * - Cambiar environment a 'production'
 * - Usar Client ID de producción
 * - Configurar webhooks reales
 */

console.log('🔧 PayPal configuration loaded - Recuerda configurar tus claves reales');
