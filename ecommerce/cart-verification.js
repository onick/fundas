/**
 * EMPÁCAME - CART VERIFICATION
 * Script para verificar y asegurar que el carrito se inicialice correctamente
 */

console.log('🔍 Cart Verification iniciado...');

// Función para verificar que el carrito esté listo
function verifyCartReady() {
    return new Promise((resolve) => {
        const checkCart = () => {
            if (window.empacameCart && document.getElementById('cartButton')) {
                console.log('✅ Carrito verificado y listo');
                resolve(true);
                return;
            }
            
            // Si el carrito no está listo, intentar reinicializar
            if (typeof EmpacameCart !== 'undefined' && !window.empacameCart) {
                console.log('🔧 Reinicializando carrito...');
                try {
                    window.empacameCart = new EmpacameCart();
                    if (document.getElementById('cartButton')) {
                        console.log('✅ Carrito reinicializado exitosamente');
                        resolve(true);
                        return;
                    }
                } catch (error) {
                    console.error('❌ Error reinicializando carrito:', error);
                }
            }
            
            // Seguir verificando
            setTimeout(checkCart, 100);
        };
        
        checkCart();
    });
}

// Función para integrar botones "Agregar al Carrito"
function integrateCartButtons() {
    console.log('🔗 Integrando botones de carrito...');
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const buttonContainer = card.querySelector('.cart-button-container');
        const whatsappFallback = card.querySelector('.whatsapp-fallback');
        
        if (buttonContainer && window.empacameCart) {
            // Obtener datos del producto desde el HTML o usando los datos por defecto
            const productName = card.querySelector('h3')?.textContent || 'Producto';
            const productSize = productName.split(' ')[0]; // ej: "100" de "100 Unidades"
            const sizeInfo = card.querySelector('.text-xs.font-bold')?.textContent; // ej: "6" × 9""
            
            // Determinar el productKey basado en el tamaño
            let productKey = '10x13'; // default
            let quantity = 100; // default
            
            if (sizeInfo?.includes('6" × 9"')) {
                productKey = '6x9';
                quantity = productName.includes('1000') ? 1000 : 100;
            } else if (sizeInfo?.includes('12" × 15.5"')) {
                productKey = '12x15.5';
                quantity = productName.includes('500') ? 500 : 100;
            } else if (sizeInfo?.includes('10" × 13"')) {
                productKey = '10x13';
                quantity = productName.includes('100') ? 100 : 500;
            }
            
            // Crear botón "Agregar al Carrito"
            const cartButton = document.createElement('button');
            cartButton.className = 'bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-xl font-semibold text-center transition-all hover:transform hover:scale-105 flex items-center justify-center space-x-2 w-full mb-2';
            cartButton.innerHTML = '<i class="fas fa-shopping-cart"></i><span>Agregar al Carrito</span>';
            
            cartButton.addEventListener('click', () => {
                if (window.empacameCart) {
                    const success = window.empacameCart.addToCart(productKey, quantity);
                    if (success) {
                        console.log(`✅ Producto agregado: ${productKey}-${quantity}`);
                    }
                } else {
                    console.error('❌ Carrito no disponible');
                }
            });
            
            // Insertar el botón
            buttonContainer.innerHTML = '';
            buttonContainer.appendChild(cartButton);
            
            // Ocultar el fallback de WhatsApp
            if (whatsappFallback) {
                whatsappFallback.style.display = 'none';
            }
            
        } else if (whatsappFallback) {
            // Si no hay carrito, mostrar el fallback de WhatsApp
            whatsappFallback.style.display = 'flex';
        }
    });
    
    console.log(`✅ ${productCards.length} tarjetas de producto procesadas`);
}

// Función principal de inicialización
async function initializeCart() {
    console.log('🚀 Inicializando sistema de carrito...');
    
    try {
        // Esperar a que el carrito esté listo
        await verifyCartReady();
        
        // Integrar botones en las tarjetas de producto
        integrateCartButtons();
        
        // Verificar integración con sistema de pagos
        if (window.PaymentManager) {
            console.log('💳 Sistema de pagos detectado');
            
            // Conectar carrito con sistema de pagos
            if (window.empacameCart && window.empacameCart.proceedToCheckout) {
                const originalProceedToCheckout = window.empacameCart.proceedToCheckout;
                
                window.empacameCart.proceedToCheckout = function() {
                    console.log('🚀 Procediendo al checkout con sistema de pagos...');
                    
                    if (this.items.length === 0) {
                        alert('Tu carrito está vacío');
                        return;
                    }
                    
                    // Preparar datos para el sistema de pagos
                    const orderData = {
                        items: this.items,
                        totals: this.getCartTotals()
                    };
                    
                    // Usar el sistema de pagos si está disponible
                    if (window.PaymentManager && window.PaymentManager.processPayment) {
                        window.PaymentManager.processPayment(orderData);
                    } else {
                        // Fallback al método original
                        originalProceedToCheckout.call(this);
                    }
                };
            }
        } else {
            console.log('⚠️ Sistema de pagos no detectado, usando WhatsApp fallback');
        }
        
        console.log('✅ Sistema de carrito inicializado exitosamente');
        
        // Notificar que el carrito está listo
        window.dispatchEvent(new CustomEvent('cartReady', { detail: window.empacameCart }));
        
    } catch (error) {
        console.error('❌ Error inicializando carrito:', error);
        
        // Fallback: mostrar solo botones de WhatsApp
        const whatsappFallbacks = document.querySelectorAll('.whatsapp-fallback');
        whatsappFallbacks.forEach(btn => btn.style.display = 'flex');
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCart);
} else {
    // DOM ya está listo
    setTimeout(initializeCart, 100);
}

// También ejecutar en window.load para asegurar que todo esté cargado
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.empacameCart || !document.getElementById('cartButton')) {
            console.log('🔄 Reintentando inicialización después de window.load...');
            initializeCart();
        }
    }, 500);
});

// Exportar funciones para debugging
window.cartVerification = {
    verify: verifyCartReady,
    integrate: integrateCartButtons,
    init: initializeCart
};

console.log('✅ Cart Verification configurado');
