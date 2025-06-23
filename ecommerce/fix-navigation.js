/**
 * EMPÁCAME - CORRECCIÓN NAVEGACIÓN CARRITO ↔ CHECKOUT
 * Script para corregir errores al navegar entre carrito y checkout
 */

console.log('🔄 === CORRECCIÓN NAVEGACIÓN CARRITO-CHECKOUT ===');

// Función para corregir la navegación entre carrito y checkout
function corregirNavegacionCarrito() {
    console.log('🔧 Aplicando correcciones de navegación...');
    
    if (window.empacameCart) {
        
        // 1. Método mejorado para restaurar carrito
        window.empacameCart.restoreCartView = function() {
            console.log('🔄 Restaurando vista del carrito...');
            
            // Cerrar cualquier interfaz de pagos
            const paymentContainer = document.getElementById('payment-container');
            if (paymentContainer) {
                paymentContainer.style.display = 'none';
            }
            
            // Cerrar contenedores temporales de checkout
            const tempContainers = document.querySelectorAll('.cart-content-temp');
            tempContainers.forEach(container => {
                container.style.display = 'none';
            });
            
            // Asegurar que el carrito esté visible
            this.openCart();
            
            // Forzar actualización del display
            setTimeout(() => {
                this.updateCartDisplay();
            }, 100);
            
            console.log('✅ Vista del carrito restaurada');
        };
        
        // 2. Método updateCartDisplay más robusto
        const originalUpdateDisplay = window.empacameCart.updateCartDisplay;
        window.empacameCart.updateCartDisplay = function() {
            try {
                // Verificar si estamos en modo checkout
                const paymentContainer = document.getElementById('payment-container');
                const isInCheckout = paymentContainer && paymentContainer.style.display !== 'none';
                
                if (isInCheckout) {
                    console.log('💡 En modo checkout, saltando actualización de carrito');
                    return;
                }
                
                // Llamar al método original
                originalUpdateDisplay.call(this);
                
            } catch (error) {
                console.log('⚠️ Error en updateCartDisplay, usando método seguro:', error.message);
                
                // Método de emergencia: solo actualizar elementos que existen
                const totals = this.getCartTotals();
                
                const cartCount = document.getElementById('cartCount');
                const cartTotal = document.getElementById('cartTotal');
                const cartButton = document.getElementById('cartButton');
                
                if (cartCount) cartCount.textContent = totals.totalItems;
                if (cartTotal) cartTotal.textContent = `$${totals.total}`;
                if (cartButton) {
                    if (totals.totalItems > 0) {
                        cartButton.classList.add('has-items');
                    } else {
                        cartButton.classList.remove('has-items');
                    }
                }
            }
        };
        
        // 3. Agregar event listeners para el botón "Volver al carrito" (con prevención de bucles)
        let isNavigating = false;
        document.addEventListener('click', function(e) {
            if ((e.target.classList.contains('back-to-cart') || 
                e.target.closest('.back-to-cart')) && !isNavigating) {
                
                e.preventDefault();
                e.stopPropagation();
                
                isNavigating = true;
                console.log('🔄 Navegando al carrito...');
                
                window.empacameCart.restoreCartView();
                
                // Liberar el flag después de un momento
                setTimeout(() => {
                    isNavigating = false;
                }, 1000);
            }
        });
        
        // 4. Prevenir múltiples renderizados de checkout
        let lastCheckoutTime = 0;
        const originalProceedToCheckout = window.empacameCart.proceedToCheckout;
        
        window.empacameCart.proceedToCheckout = function() {
            const now = Date.now();
            if (now - lastCheckoutTime < 1000) { // Prevenir múltiples clicks en 1 segundo
                console.log('⚠️ Checkout ya se está procesando, esperando...');
                return;
            }
            lastCheckoutTime = now;
            
            // Llamar al método original
            originalProceedToCheckout.call(this);
        };
        
        // 4. Detectar cuando se abre la interfaz de pagos y preparar el retorno
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Si se agregó un contenedor de checkout
                        if (node.classList && (node.classList.contains('enhanced-checkout-form') || 
                            node.querySelector && node.querySelector('.enhanced-checkout-form'))) {
                            
                            // Agregar botón de retorno si no existe
                            const checkoutForm = node.classList.contains('enhanced-checkout-form') 
                                ? node 
                                : node.querySelector('.enhanced-checkout-form');
                                
                            if (checkoutForm && !checkoutForm.querySelector('.back-to-cart')) {
                                const header = checkoutForm.querySelector('.checkout-header') || checkoutForm;
                                
                                if (header) {
                                    const backButton = document.createElement('button');
                                    backButton.className = 'back-to-cart';
                                    backButton.innerHTML = '← Volver al carrito';
                                    backButton.style.cssText = `
                                        background: #6b7280;
                                        color: white;
                                        border: none;
                                        padding: 8px 16px;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        float: right;
                                        margin-top: 10px;
                                    `;
                                    
                                    backButton.addEventListener('click', function() {
                                        window.empacameCart.restoreCartView();
                                    });
                                    
                                    header.appendChild(backButton);
                                    console.log('✅ Botón "Volver al carrito" agregado');
                                }
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Correcciones de navegación aplicadas');
        
    } else {
        console.log('❌ window.empacameCart no disponible');
    }
}

// Función para test rápido
window.testNavegacion = function() {
    console.log('🧪 Testing navegación carrito-checkout...');
    
    if (window.empacameCart) {
        // Test 1: Agregar producto
        window.empacameCart.addToCart('6x9', 100);
        console.log('✅ Producto agregado');
        
        // Test 2: Abrir checkout
        setTimeout(() => {
            window.empacameCart.proceedToCheckout();
            console.log('✅ Checkout abierto');
            
            // Test 3: Volver al carrito
            setTimeout(() => {
                window.empacameCart.restoreCartView();
                console.log('✅ Regreso al carrito');
            }, 2000);
        }, 1000);
        
    } else {
        console.log('❌ Carrito no disponible para testing');
    }
};

// Auto-ejecutar correcciones
setTimeout(corregirNavegacionCarrito, 1000);

console.log('✅ Script de corrección de navegación cargado');
console.log('💡 Usa testNavegacion() para probar el flujo');
