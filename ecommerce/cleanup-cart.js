// Script para limpiar el carrito y restaurar PayPal
// Limpia testing y asegura que PayPal funcione correctamente

console.log('🧹 Limpieza COMPLETA y restauración de PayPal...');

// Limpiar localStorage del carrito y datos relacionados
const itemsToRemove = [
    'empacame_cart',
    'empacame_test_data', 
    'cart_debug_data',
    'empacame_cart_temp',
    'payment_test_data',
    'cart_initialization_attempts'
];

itemsToRemove.forEach(item => {
    localStorage.removeItem(item);
    console.log(`🗑️ Removido: ${item}`);
});

// Si existe el carrito global, limpiarlo completamente
if (window.empacameCart) {
    try {
        window.empacameCart.items = [];
        window.empacameCart.saveCart();
        window.empacameCart.updateCartDisplay();
        
        // Cerrar carrito si está abierto
        if (window.empacameCart.isOpen) {
            window.empacameCart.closeCart();
        }
        
        console.log('✅ Carrito global completamente limpiado');
    } catch (error) {
        console.warn('⚠️ Error limpiando carrito:', error);
    }
}

// Restaurar el método de checkout original para que use PayPal
if (window.empacameCart) {
    // Asegurar que proceedToCheckout use PayPal correctamente
    window.empacameCart.proceedToCheckout = function() {
        console.log('💳 Iniciando checkout con PayPal...');
        
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Verificar si PaymentIntegration está disponible
        if (window.PaymentIntegration) {
            console.log('✅ Usando sistema de pagos PayPal');
            try {
                const paymentIntegration = new window.PaymentIntegration();
                paymentIntegration.processCheckout();
            } catch (error) {
                console.error('❌ Error con PayPal, usando fallback WhatsApp:', error);
                this.checkoutWhatsApp();
            }
        } else {
            console.warn('⚠️ PaymentIntegration no disponible, usando WhatsApp');
            this.checkoutWhatsApp();
        }
    };
    
    console.log('✅ Método proceedToCheckout restaurado para PayPal');
}

// Limpiar elementos DOM del carrito
try {
    const cartItems = document.querySelector('#cartItems');
    if (cartItems) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">Tu carrito está vacío</p>';
    }
    
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary) {
        cartSummary.innerHTML = '<div class="text-center text-gray-500">$0.00</div>';
    }
    
    // Actualizar botón flotante
    const cartButton = document.querySelector('#cartButton');
    if (cartButton) {
        const countElement = cartButton.querySelector('.cart-count');
        if (countElement) {
            countElement.textContent = '0';
            countElement.style.display = 'none';
        }
    }
    
    console.log('✅ Elementos DOM del carrito limpiados');
} catch (error) {
    console.warn('⚠️ Error limpiando DOM:', error);
}

// Deshabilitar funciones de testing que podrían ejecutarse
const testingFunctions = [
    'quickFix',
    'resetAndQuickFix', 
    'testEmpacameCart',
    'aplicarSolucion',
    'testNavegacion',
    'limpiarCheckout',
    'restaurarCarritoEmergencia',
    'debugCart'
];

testingFunctions.forEach(funcName => {
    if (window[funcName]) {
        window[funcName] = function() { 
            console.log(`🔒 Función de testing ${funcName} deshabilitada`); 
        };
    }
});

console.log('🎉 Limpieza COMPLETA y PayPal restaurado - recarga para carrito limpio con PayPal');
console.log('💳 El checkout ahora debe dirigir a PayPal, no a WhatsApp');
console.log('🔒 Funciones de testing deshabilitadas');
