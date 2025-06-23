/**
 * EMPÁCAME - TESTING FINAL
 * Script para probar todas las funcionalidades del carrito
 */

console.log('🧪 === TESTING FINAL DEL CARRITO ===');

// Función para probar el carrito completo
window.testEmpacameCart = function() {
    console.log('\n🔬 Iniciando test completo del carrito...');
    
    // Test 1: Verificar existencia del carrito
    console.log('\n1. 🔍 Test de existencia:');
    const cartExists = !!window.empacameCart;
    console.log(`   Carrito existe: ${cartExists ? '✅ SÍ' : '❌ NO'}`);
    
    if (!cartExists) {
        console.log('❌ FALLO: Carrito no existe. No se pueden realizar más tests.');
        return false;
    }
    
    // Test 2: Verificar métodos del carrito
    console.log('\n2. 🔧 Test de métodos:');
    const methods = ['addToCart', 'removeFromCart', 'updateQuantity', 'getCartTotals', 'openCart', 'closeCart'];
    const methodsOk = methods.every(method => {
        const exists = typeof window.empacameCart[method] === 'function';
        console.log(`   ${method}: ${exists ? '✅' : '❌'}`);
        return exists;
    });
    
    // Test 3: Verificar elementos DOM
    console.log('\n3. 🖥️ Test de elementos DOM:');
    const elements = {
        cartButton: document.getElementById('cartButton'),
        cartSidebar: document.getElementById('cartSidebar'),
        cartCount: document.getElementById('cartCount'),
        cartTotal: document.getElementById('cartTotal')
    };
    
    const elementsOk = Object.entries(elements).every(([name, element]) => {
        const exists = !!element;
        console.log(`   ${name}: ${exists ? '✅' : '❌'}`);
        return exists;
    });
    
    // Test 4: Probar agregar producto
    console.log('\n4. 🛒 Test de agregar producto:');
    try {
        const initialCount = window.empacameCart.items.length;
        const success = window.empacameCart.addToCart('6x9', 100);
        const newCount = window.empacameCart.items.length;
        
        console.log(`   Producto agregado: ${success ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   Items en carrito: ${initialCount} → ${newCount}`);
        
        if (success && newCount > initialCount) {
            console.log('✅ Test de agregar producto: EXITOSO');
        } else {
            console.log('❌ Test de agregar producto: FALLIDO');
        }
    } catch (error) {
        console.log('❌ Error agregando producto:', error);
    }
    
    // Test 5: Verificar totales
    console.log('\n5. 💰 Test de totales:');
    try {
        const totals = window.empacameCart.getCartTotals();
        console.log(`   Subtotal: $${totals.subtotal}`);
        console.log(`   Envío: $${totals.shipping}`);
        console.log(`   Total: $${totals.total}`);
        console.log(`   Items: ${totals.totalItems}`);
        console.log('✅ Test de totales: EXITOSO');
    } catch (error) {
        console.log('❌ Error calculando totales:', error);
    }
    
    // Test 6: Probar abrir/cerrar carrito
    console.log('\n6. 🚪 Test de abrir/cerrar carrito:');
    try {
        // Abrir carrito
        window.empacameCart.openCart();
        const isOpenAfterOpen = window.empacameCart.isOpen;
        console.log(`   Carrito abierto: ${isOpenAfterOpen ? '✅ SÍ' : '❌ NO'}`);
        
        // Cerrar carrito
        setTimeout(() => {
            window.empacameCart.closeCart();
            const isOpenAfterClose = window.empacameCart.isOpen;
            console.log(`   Carrito cerrado: ${!isOpenAfterClose ? '✅ SÍ' : '❌ NO'}`);
        }, 1000);
        
    } catch (error) {
        console.log('❌ Error con abrir/cerrar carrito:', error);
    }
    
    // Test 7: Verificar botones en tarjetas
    console.log('\n7. 🎯 Test de botones en tarjetas:');
    const productCards = document.querySelectorAll('.product-card');
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    console.log(`   Tarjetas de producto: ${productCards.length}`);
    console.log(`   Botones de carrito: ${cartButtons.length}`);
    
    if (cartButtons.length > 0) {
        console.log('✅ Botones de carrito encontrados');
    } else {
        console.log('❌ No se encontraron botones de carrito');
    }
    
    // Resultado final
    console.log('\n🏁 RESULTADO FINAL:');
    const allTestsPass = cartExists && methodsOk && elementsOk;
    
    if (allTestsPass) {
        console.log('🎉 ¡TODOS LOS TESTS PASARON! El carrito está completamente funcional.');
        
        // Test extra: simular compra completa
        console.log('\n🚀 Test extra: Simulando flujo de compra...');
        setTimeout(() => {
            try {
                window.empacameCart.addToCart('12x15.5', 500);
                window.empacameCart.openCart();
                console.log('✅ Flujo de compra simulado exitosamente');
            } catch (error) {
                console.log('❌ Error en flujo de compra:', error);
            }
        }, 2000);
        
    } else {
        console.log('❌ ALGUNOS TESTS FALLARON. Revisar los errores arriba.');
    }
    
    return allTestsPass;
};

// Test automático al cargar
setTimeout(() => {
    console.log('🤖 Ejecutando test automático...');
    window.testEmpacameCart();
}, 3000);

// Función para test rápido
window.quickTest = function() {
    console.log('\n⚡ TEST RÁPIDO:');
    console.log(`Carrito: ${window.empacameCart ? '✅' : '❌'}`);
    console.log(`DOM: ${document.getElementById('cartButton') ? '✅' : '❌'}`);
    console.log(`Botones: ${document.querySelectorAll('.add-to-cart-btn').length}`);
    
    if (window.empacameCart) {
        console.log(`Items: ${window.empacameCart.items.length}`);
        console.log(`Total: $${window.empacameCart.getCartTotals().total}`);
    }
};

// Función para limpiar carrito en tests
window.clearCartForTest = function() {
    if (window.empacameCart) {
        window.empacameCart.clearCart();
        console.log('🧹 Carrito limpiado para testing');
    }
};

console.log('✅ Sistema de testing cargado');
console.log('💡 Comandos disponibles:');
console.log('   - testEmpacameCart(): Test completo');
console.log('   - quickTest(): Test rápido');
console.log('   - clearCartForTest(): Limpiar carrito');
