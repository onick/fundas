/**
 * EMPÁCAME - DIAGNÓSTICO RÁPIDO
 * Script para verificar rápidamente el estado del carrito
 */

console.log('🩺 === DIAGNÓSTICO RÁPIDO INICIADO ===');

function quickDiagnosis() {
    console.log('\n📊 Estado del Sistema:');
    
    // 1. Verificar clase EmpacameCart
    const cartClassExists = typeof EmpacameCart !== 'undefined';
    console.log(`1. Clase EmpacameCart: ${cartClassExists ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
    
    // 2. Verificar instancia global
    const cartInstanceExists = typeof window.empacameCart !== 'undefined';
    console.log(`2. window.empacameCart: ${cartInstanceExists ? '✅ CREADA' : '❌ NO CREADA'}`);
    
    // 3. Verificar elementos DOM
    const cartButton = document.getElementById('cartButton');
    const cartSidebar = document.getElementById('cartSidebar');
    console.log(`3. Elementos DOM:`);
    console.log(`   - cartButton: ${cartButton ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    console.log(`   - cartSidebar: ${cartSidebar ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    // 4. Verificar sistema de pagos
    const paymentSystem = typeof window.PaymentManager !== 'undefined';
    console.log(`4. Sistema de Pagos: ${paymentSystem ? '✅ DISPONIBLE' : '⚠️ NO DISPONIBLE'}`);
    
    // 5. Contar tarjetas de producto
    const productCards = document.querySelectorAll('.product-card');
    console.log(`5. Tarjetas de Producto: ${productCards.length} encontradas`);
    
    // 6. Verificar botones de carrito
    const cartButtons = document.querySelectorAll('.cart-button-container button');
    console.log(`6. Botones de Carrito: ${cartButtons.length} encontrados`);
    
    // Resultado final
    const isFullyFunctional = cartClassExists && cartInstanceExists && cartButton && cartSidebar;
    console.log(`\n${isFullyFunctional ? '🎉 CARRITO COMPLETAMENTE FUNCIONAL' : '⚠️ CARRITO NECESITA CORRECCIÓN'}`);
    
    return {
        cartClassExists,
        cartInstanceExists,
        domElementsExist: !!(cartButton && cartSidebar),
        paymentSystem,
        productCards: productCards.length,
        cartButtons: cartButtons.length,
        isFullyFunctional
    };
}

// Auto-ejecutar diagnóstico
setTimeout(quickDiagnosis, 1000);
setTimeout(quickDiagnosis, 3000);
setTimeout(quickDiagnosis, 5000);

// Función global para diagnóstico manual
window.diagnose = quickDiagnosis;

console.log('💡 Usa diagnose() para verificar el estado actual');
