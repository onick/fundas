/**
 * CHECKOUT TEST - Funcionalidad específica de checkout
 */

console.log('🛒 === CHECKOUT TEST CARGADO ===');

// Función para test rápido de checkout
window.quickCheckoutTest = function() {
    console.log('🧪 Iniciando test rápido de checkout...');
    
    // 1. Verificar carrito
    if (!window.empacameCart) {
        console.log('❌ Carrito no disponible');
        return;
    }
    
    // 2. Limpiar carrito y agregar item de prueba
    window.empacameCart.items = [];
    console.log('🛒 Agregando item de prueba...');
    
    const testItem = {
        id: 'test-6x9-100',
        productName: '6" × 9" - Prueba',
        subtitle: 'Pack de 100 unidades para testing',
        quantity: 100,
        price: 8.99,
        image: 'img/6x9.webp'
    };
    
    window.empacameCart.items.push(testItem);
    window.empacameCart.updateCartDisplay();
    
    // 3. Abrir carrito
    console.log('🛒 Abriendo carrito...');
    window.empacameCart.openCart();
    
    // 4. Esperar y hacer clic en checkout
    setTimeout(() => {
        console.log('🛒 Ejecutando checkout...');
        
        // Buscar y hacer clic en el botón de checkout
        const checkoutButton = document.querySelector('.checkout-btn, #checkoutBtn, [onclick*="proceedToCheckout"]');
        
        if (checkoutButton) {
            console.log('✅ Botón de checkout encontrado, haciendo clic...');
            checkoutButton.click();
        } else {
            console.log('⚠️ Botón de checkout no encontrado, ejecutando directamente...');
            if (window.empacameCart.proceedToCheckout) {
                window.empacameCart.proceedToCheckout();
            } else {
                console.log('❌ proceedToCheckout no disponible');
            }
        }
    }, 2000);
};

// Función para verificar elementos de la interfaz
window.checkUIElements = function() {
    console.log('🔍 Verificando elementos de la interfaz...');
    
    const elements = {
        cartSidebar: document.getElementById('cartSidebar'),
        cartContent: document.querySelector('.cart-content'),
        cartNotification: document.getElementById('cartNotification'),
        notificationText: document.getElementById('notificationText'),
        checkoutButton: document.querySelector('.checkout-btn, #checkoutBtn')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`${element ? '✅' : '❌'} ${name}: ${element ? 'encontrado' : 'NO encontrado'}`);
    });
    
    return elements;
};

// Auto-test después de que todo esté cargado
setTimeout(() => {
    console.log('🔍 Verificando estado de elementos UI...');
    checkUIElements();
}, 4000);

console.log('✅ Checkout test cargado.');
console.log('💡 Usa quickCheckoutTest() para probar checkout automáticamente');
console.log('💡 Usa checkUIElements() para verificar elementos de la interfaz');
