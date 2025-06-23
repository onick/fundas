/**
 * QUICK TEST - PayPalProcessor Loading
 */

console.log('🧪 === TEST RÁPIDO PAYPAL PROCESSOR ===');

setTimeout(() => {
    console.log('\n🔍 Verificando PayPalProcessor específicamente:');
    
    // Verificar si existe
    const exists = typeof window.PayPalProcessor !== 'undefined';
    console.log(`PayPalProcessor exists: ${exists}`);
    
    if (exists) {
        console.log('✅ PayPalProcessor está disponible');
        console.log('Type:', typeof window.PayPalProcessor);
        
        // Intentar crear instancia
        try {
            const testInstance = new PayPalProcessor({});
            console.log('✅ Instancia de PayPalProcessor creada exitosamente');
            console.log('Instance name:', testInstance.name);
        } catch (error) {
            console.error('❌ Error creando instancia de PayPalProcessor:', error);
        }
    } else {
        console.log('❌ PayPalProcessor NO está disponible');
        
        // Verificar PaymentProcessor
        console.log('PaymentProcessor disponible:', typeof window.PaymentProcessor !== 'undefined');
        
        // Listar todas las variables globales relacionadas con Payment
        const paymentGlobals = Object.keys(window).filter(key => 
            key.toLowerCase().includes('payment')
        );
        console.log('Variables globales relacionadas con Payment:', paymentGlobals);
    }
    
    // Forzar creación manual de PayPalProcessor si es necesario
    if (!exists && typeof window.PaymentProcessor !== 'undefined') {
        console.log('🔧 Intentando crear PayPalProcessor manualmente...');
        
        try {
            // Código mínimo de PayPalProcessor
            eval(`
                class PayPalProcessor extends PaymentProcessor {
                    constructor(config) {
                        super(config);
                        this.name = 'paypal';
                        this.paypalLoaded = false;
                        console.log('🔧 PayPalProcessor creado manualmente');
                    }
                }
                window.PayPalProcessor = PayPalProcessor;
            `);
            
            console.log('✅ PayPalProcessor creado manualmente exitosamente');
            
            // Verificar nuevamente
            if (window.PaymentSystemInitializer) {
                setTimeout(() => {
                    console.log('🔄 Intentando reinicializar sistema...');
                    window.PaymentSystemInitializer.forceReinitialize();
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Error creando PayPalProcessor manualmente:', error);
        }
    }
    
}, 1000);

window.testPayPalProcessor = function() {
    console.log('🧪 Test manual de PayPalProcessor:');
    console.log('Exists:', typeof window.PayPalProcessor !== 'undefined');
    console.log('PaymentProcessor:', typeof window.PaymentProcessor !== 'undefined');
    
    if (typeof window.PayPalProcessor !== 'undefined') {
        try {
            const test = new PayPalProcessor({});
            console.log('✅ Test exitoso');
        } catch (e) {
            console.log('❌ Test fallido:', e.message);
        }
    }
};

console.log('✅ Quick test cargado. Usa testPayPalProcessor() para test manual.');
