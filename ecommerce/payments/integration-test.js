/**
 * INTEGRATION TEST - Quick Test for Cart Integration
 */

console.log('🧪 === INTEGRATION TEST CARGADO ===');

// Test específico para la integración del carrito
setTimeout(() => {
    console.log('\n🔍 Verificando integración con carrito:');
    
    if (window.empacameCart) {
        console.log('✅ Carrito encontrado');
        console.log('Métodos disponibles:');
        console.log('- checkout:', typeof window.empacameCart.checkout);
        console.log('- proceedToCheckout:', typeof window.empacameCart.proceedToCheckout);
        console.log('- showCheckoutForm:', typeof window.empacameCart.showCheckoutForm);
        console.log('- items length:', window.empacameCart.items.length);
        
        // Test de PaymentIntegration
        if (window.PaymentIntegration) {
            console.log('✅ PaymentIntegration disponible');
            console.log('Estado:', window.PaymentIntegration.getStatus?.() || 'No disponible');
        } else {
            console.log('❌ PaymentIntegration no disponible');
        }
        
        // Test de PaymentManager  
        if (window.PaymentManager) {
            console.log('✅ PaymentManager disponible');
            console.log('Estado:', window.PaymentManager.getStatus?.() || 'No disponible');
        } else {
            console.log('❌ PaymentManager no disponible');
        }
        
    } else {
        console.log('❌ Carrito no encontrado');
    }
    
}, 3000);

// Función para testing manual del flujo completo
window.testFullFlow = function() {
    console.log('🧪 Testing flujo completo...');
    
    // 1. Verificar carrito
    if (!window.empacameCart) {
        console.log('❌ Carrito no disponible');
        return;
    }
    
    // 2. Agregar item de prueba si está vacío
    if (window.empacameCart.items.length === 0) {
        console.log('🛒 Agregando item de prueba al carrito...');
        window.empacameCart.addItem('test-item', 'Producto de Prueba', 'Para testing', 1, 10.99);
    }
    
    // 3. Abrir carrito
    console.log('🛒 Abriendo carrito...');
    window.empacameCart.openCart();
    
    // 4. Simular clic en proceedToCheckout
    setTimeout(() => {
        console.log('🛒 Simulando checkout...');
        if (window.empacameCart.proceedToCheckout) {
            window.empacameCart.proceedToCheckout();
        } else {
            console.log('❌ proceedToCheckout no disponible');
        }
    }, 1000);
};

// Función para verificar estado del sistema
window.checkSystemStatus = function() {
    console.log('📊 === ESTADO DEL SISTEMA ===');
    
    const status = {
        cart: {
            available: !!window.empacameCart,
            items: window.empacameCart?.items?.length || 0,
            methods: {
                checkout: typeof window.empacameCart?.checkout,
                proceedToCheckout: typeof window.empacameCart?.proceedToCheckout,
                showCheckoutForm: typeof window.empacameCart?.showCheckoutForm
            }
        },
        paymentSystem: {
            manager: {
                available: !!window.PaymentManager,
                initialized: window.PaymentManager?.isInitialized || false,
                activeProcessor: window.PaymentManager?.activeProcessor || null
            },
            integration: {
                available: !!window.PaymentIntegration,
                initialized: window.PaymentIntegration?.isInitialized || false
            }
        },
        modules: {
            PaymentConfig: typeof window.PaymentConfig,
            PaymentValidation: typeof window.PaymentValidation,
            PaymentFormatting: typeof window.PaymentFormatting,
            PaymentProcessor: typeof window.PaymentProcessor,
            PayPalProcessor: typeof window.PayPalProcessor
        }
    };
    
    console.table(status.cart);
    console.table(status.paymentSystem.manager);
    console.table(status.paymentSystem.integration);
    console.table(status.modules);
    
    return status;
};

console.log('✅ Integration test cargado.');
console.log('💡 Usa testFullFlow() para probar el flujo completo');
console.log('💡 Usa checkSystemStatus() para ver estado detallado');
