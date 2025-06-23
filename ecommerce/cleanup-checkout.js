/**
 * EMPÁCAME - LIMPIEZA CHECKOUT
 * Script para limpiar completamente la interfaz de checkout
 */

console.log('🧹 === LIMPIEZA CHECKOUT CARGADA ===');

// Función para limpiar completamente el checkout y restaurar carrito
window.limpiarCheckout = function() {
    console.log('🧹 Limpiando interfaz de checkout...');
    
    // 1. Eliminar todos los contenedores de pago
    const paymentContainers = document.querySelectorAll('#payment-container, .payment-container, [id*="payment"]');
    paymentContainers.forEach(container => {
        container.remove();
        console.log('🗑️ Contenedor de pago eliminado');
    });
    
    // 2. Eliminar formularios de checkout
    const checkoutForms = document.querySelectorAll('.enhanced-checkout-form, .checkout-form, [class*="checkout"]');
    checkoutForms.forEach(form => {
        form.remove();
        console.log('🗑️ Formulario de checkout eliminado');
    });
    
    // 3. Eliminar contenedores temporales
    const tempContainers = document.querySelectorAll('.cart-content-temp, [class*="temp"]');
    tempContainers.forEach(container => {
        container.remove();
        console.log('🗑️ Contenedor temporal eliminado');
    });
    
    // 4. Restaurar carrito original
    if (window.empacameCart) {
        // Forzar recreación del carrito
        const existingCart = document.getElementById('cartSidebar');
        if (existingCart) {
            existingCart.remove();
        }
        
        // Recrear desde cero
        window.empacameCart.createCartHTML();
        window.empacameCart.bindEvents();
        window.empacameCart.updateCartDisplay();
        
        console.log('✅ Carrito recreado desde cero');
    }
    
    // 5. Limpiar cualquier overlay o backdrop
    const overlays = document.querySelectorAll('[class*="overlay"], [class*="backdrop"], [class*="modal"]');
    overlays.forEach(overlay => {
        if (overlay.id !== 'cartOverlay') { // Preservar overlay del carrito
            overlay.remove();
        }
    });
    
    console.log('🎉 Limpieza completa terminada');
};

// Función para restaurar carrito de emergencia
window.restaurarCarritoEmergencia = function() {
    console.log('🚨 Restauración de emergencia del carrito...');
    
    // Limpiar todo
    limpiarCheckout();
    
    // Esperar un momento y abrir carrito
    setTimeout(() => {
        if (window.empacameCart) {
            window.empacameCart.openCart();
            console.log('✅ Carrito restaurado en modo emergencia');
        }
    }, 500);
};

// Auto-limpiar si hay problemas detectados
setTimeout(() => {
    const problemas = document.querySelectorAll('.enhanced-checkout-form').length > 1 ||
                     document.querySelectorAll('#payment-container').length > 1 ||
                     document.querySelectorAll('.cart-content-temp').length > 0;
                     
    if (problemas) {
        console.log('⚠️ Problemas detectados, auto-limpiando...');
        limpiarCheckout();
    }
}, 2000);

console.log('✅ Sistema de limpieza cargado');
console.log('💡 Comandos disponibles:');
console.log('   - limpiarCheckout(): Limpia interfaz checkout');
console.log('   - restaurarCarritoEmergencia(): Restauración completa');
