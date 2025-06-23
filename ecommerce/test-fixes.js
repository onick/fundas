/**
 * EMPÁCAME - PRUEBA RÁPIDA DE CORRECCIONES
 * Script para verificar que las correcciones funcionen
 */

console.log('🔧 === VERIFICACIÓN DE CORRECCIONES ===');

// Función para probar correcciones específicas
window.testFixes = function() {
    console.log('\n🧪 Testing de correcciones específicas...');
    
    // 1. Test del carrito básico
    console.log('\n1. 🛒 Test básico del carrito:');
    if (window.empacameCart) {
        console.log('   ✅ Carrito existe');
        
        // Test métodos nuevos
        try {
            const subtotal = window.empacameCart.getSubtotal();
            const total = window.empacameCart.getTotal();
            const shipping = window.empacameCart.getShipping();
            
            console.log(`   ✅ getSubtotal(): $${subtotal}`);
            console.log(`   ✅ getTotal(): $${total}`);
            console.log(`   ✅ getShipping(): $${shipping}`);
        } catch (error) {
            console.log('   ❌ Error en métodos del carrito:', error);
        }
    } else {
        console.log('   ❌ Carrito no existe');
    }
    
    // 2. Test elementos DOM
    console.log('\n2. 🖥️ Test elementos DOM:');
    const elements = {
        cartItems: document.getElementById('cartItems'),
        cartSummary: document.getElementById('cartSummary'),
        checkoutButton: document.getElementById('checkoutButton'),
        proceedCheckout: document.getElementById('proceedCheckout')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`   ${name}: ${element ? '✅' : '❌'}`);
    });
    
    // 3. Test agregar producto
    console.log('\n3. 🛒 Test agregar producto y actualizar display:');
    if (window.empacameCart) {
        try {
            // Limpiar carrito primero
            window.empacameCart.clearCart();
            
            // Agregar un producto
            const success = window.empacameCart.addToCart('6x9', 100);
            console.log(`   Producto agregado: ${success ? '✅' : '❌'}`);
            
            // Intentar actualizar display
            window.empacameCart.updateCartDisplay();
            console.log('   ✅ Display actualizado sin errores');
            
        } catch (error) {
            console.log('   ❌ Error actualizando display:', error);
        }
    }
    
    // 4. Test sistema de pagos
    console.log('\n4. 💳 Test sistema de pagos:');
    if (window.PaymentIntegration) {
        console.log('   ✅ PaymentIntegration existe');
        
        try {
            // Verificar que tenga el método showError
            if (window.PaymentIntegration.prototype.showError) {
                console.log('   ✅ Método showError disponible');
            } else {
                console.log('   ❌ Método showError NO disponible');
            }
        } catch (error) {
            console.log('   ❌ Error verificando PaymentIntegration:', error);
        }
    } else {
        console.log('   ❌ PaymentIntegration no existe');
    }
    
    // 5. Test checkout
    console.log('\n5. 🚀 Test checkout (simulado):');
    if (window.empacameCart) {
        try {
            // Asegurar que hay items en el carrito
            if (window.empacameCart.items.length === 0) {
                window.empacameCart.addToCart('6x9', 100);
            }
            
            // Simular click en checkout
            const checkoutBtn = document.getElementById('proceedCheckout');
            if (checkoutBtn) {
                console.log('   ✅ Botón checkout encontrado');
                // No hacer click real, solo verificar que existe
            } else {
                console.log('   ❌ Botón checkout NO encontrado');
            }
            
        } catch (error) {
            console.log('   ❌ Error en test checkout:', error);
        }
    }
    
    console.log('\n🏁 Test de correcciones completado');
};

// Función para limpiar errores y reiniciar
window.resetAndTest = function() {
    console.log('🔄 Reiniciando sistema...');
    
    // Limpiar carrito
    if (window.empacameCart) {
        window.empacameCart.clearCart();
    }
    
    // Esperar un poco y probar
    setTimeout(() => {
        testFixes();
    }, 1000);
};

// Auto-ejecutar test en 2 segundos
setTimeout(() => {
    console.log('🤖 Ejecutando test automático de correcciones...');
    testFixes();
}, 2000);

console.log('✅ Script de verificación de correcciones cargado');
console.log('💡 Comandos disponibles:');
console.log('   - testFixes(): Probar correcciones');
console.log('   - resetAndTest(): Reiniciar y probar');
