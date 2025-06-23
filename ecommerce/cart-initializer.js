/**
 * EMPÁCAME - INICIALIZACIÓN FINAL DEL CARRITO
 * Script que asegura la inicialización correcta del carrito
 */

console.log('🚀 === INICIALIZACIÓN FINAL DEL CARRITO ===');

// Datos de productos que coinciden con las tarjetas en el HTML
const PRODUCT_MAPPING = {
    // Productos basados en las tarjetas existentes en el HTML
    '6x9-100': { productKey: '6x9', quantity: 100, name: '6" × 9"', price: 9.99 },
    '6x9-1000': { productKey: '6x9', quantity: 1000, name: '6" × 9"', price: 39.99 },
    '12x15.5-500': { productKey: '12x15.5', quantity: 500, name: '12" × 15.5"', price: 46.99 },
    '10x13-100': { productKey: '10x13', quantity: 100, name: '10" × 13"', price: 8.99 }
};

// Función para detectar automáticamente el tipo de producto de una tarjeta
function detectProductFromCard(card) {
    const titleElement = card.querySelector('h3');
    const sizeElement = card.querySelector('.text-xs.font-bold');
    
    if (!titleElement || !sizeElement) return null;
    
    const title = titleElement.textContent.trim();
    const sizeText = sizeElement.textContent.trim();
    
    // Detectar tamaño
    let productKey = '10x13'; // default
    if (sizeText.includes('6" × 9"')) productKey = '6x9';
    else if (sizeText.includes('12" × 15.5"')) productKey = '12x15.5';
    else if (sizeText.includes('10" × 13"')) productKey = '10x13';
    
    // Detectar cantidad
    let quantity = 100; // default
    if (title.includes('1000')) quantity = 1000;
    else if (title.includes('500')) quantity = 500;
    else if (title.includes('100')) quantity = 100;
    
    return { productKey, quantity };
}

// Función para crear botones de carrito en las tarjetas
function createCartButtons() {
    console.log('🔗 Creando botones de carrito...');
    
    const productCards = document.querySelectorAll('.product-card');
    let buttonsCreated = 0;
    
    productCards.forEach((card, index) => {
        const container = card.querySelector('.cart-button-container');
        const whatsappFallback = card.querySelector('.whatsapp-fallback');
        
        if (!container) return;
        
        // Detectar producto automáticamente
        const productInfo = detectProductFromCard(card);
        if (!productInfo) {
            console.warn(`❌ No se pudo detectar producto en tarjeta ${index + 1}`);
            return;
        }
        
        // Crear botón de carrito
        const cartButton = document.createElement('button');
        cartButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all hover:transform hover:scale-105 flex items-center justify-center space-x-2 add-to-cart-btn';
        cartButton.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span>Agregar al Carrito</span>
        `;
        
        // Event listener para el botón
        cartButton.addEventListener('click', function() {
            if (!window.empacameCart) {
                console.error('❌ Carrito no disponible');
                return;
            }
            
            // Agregar clase de loading
            this.classList.add('loading');
            this.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                <span>Agregando...</span>
            `;
            
            // Simular pequeño delay para mejor UX
            setTimeout(() => {
                const success = window.empacameCart.addToCart(productInfo.productKey, productInfo.quantity);
                
                // Restaurar botón
                this.classList.remove('loading');
                this.innerHTML = `
                    <i class="fas fa-shopping-cart"></i>
                    <span>Agregar al Carrito</span>
                `;
                
                if (success) {
                    console.log(`✅ Producto agregado: ${productInfo.productKey}-${productInfo.quantity}`);
                    
                    // Efecto visual de éxito
                    this.classList.add('bg-green-600');
                    this.innerHTML = `
                        <i class="fas fa-check"></i>
                        <span>¡Agregado!</span>
                    `;
                    
                    setTimeout(() => {
                        this.classList.remove('bg-green-600');
                        this.innerHTML = `
                            <i class="fas fa-shopping-cart"></i>
                            <span>Agregar al Carrito</span>
                        `;
                    }, 1500);
                } else {
                    console.error('❌ Error agregando producto al carrito');
                }
            }, 300);
        });
        
        // Limpiar container y agregar el botón
        container.innerHTML = '';
        container.appendChild(cartButton);
        
        // Ocultar botón de WhatsApp fallback
        if (whatsappFallback) {
            whatsappFallback.style.display = 'none';
        }
        
        buttonsCreated++;
    });
    
    console.log(`✅ ${buttonsCreated} botones de carrito creados`);
    return buttonsCreated;
}

// Función para verificar que el carrito esté completamente listo
function verifyCartSystem() {
    const checks = {
        cartClass: typeof EmpacameCart !== 'undefined',
        cartInstance: typeof window.empacameCart !== 'undefined' && window.empacameCart !== null,
        cartButton: !!document.getElementById('cartButton'),
        cartSidebar: !!document.getElementById('cartSidebar'),
        productCards: document.querySelectorAll('.product-card').length > 0
    };
    
    const allChecksPass = Object.values(checks).every(check => check);
    
    console.log('🔍 Verificación del sistema de carrito:');
    Object.entries(checks).forEach(([key, value]) => {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
    });
    
    return allChecksPass;
}

// Función principal de inicialización
function initializeCartSystem() {
    console.log('🔄 Inicializando sistema de carrito...');
    
    // Verificar si el carrito ya está listo
    if (verifyCartSystem()) {
        console.log('✅ Sistema de carrito ya está listo');
        createCartButtons();
        return true;
    }
    
    // Si no está listo, intentar inicializar
    if (typeof EmpacameCart !== 'undefined' && !window.empacameCart) {
        console.log('🔧 Creando instancia de carrito...');
        try {
            window.empacameCart = new EmpacameCart();
        } catch (error) {
            console.error('❌ Error creando carrito:', error);
            return false;
        }
    }
    
    // Verificar de nuevo después de intentar crear
    setTimeout(() => {
        if (verifyCartSystem()) {
            console.log('✅ Sistema de carrito inicializado exitosamente');
            createCartButtons();
            
            // Conectar con sistema de pagos si está disponible
            if (window.PaymentManager) {
                console.log('💳 Conectando con sistema de pagos...');
                // Aquí se puede agregar la integración específica con el sistema de pagos
            }
            
            // Emitir evento de que el carrito está listo
            window.dispatchEvent(new CustomEvent('empacameCartReady', {
                detail: { cart: window.empacameCart }
            }));
            
        } else {
            console.error('❌ Sistema de carrito no se pudo inicializar completamente');
            
            // Fallback: mostrar botones de WhatsApp
            const whatsappButtons = document.querySelectorAll('.whatsapp-fallback');
            whatsappButtons.forEach(btn => {
                btn.style.display = 'flex';
                btn.classList.remove('hidden');
            });
            
            console.log('⚠️ Usando botones de WhatsApp como fallback');
        }
    }, 500);
    
    return true;
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeCartSystem, 100);
    });
} else {
    setTimeout(initializeCartSystem, 100);
}

// También verificar en window load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.empacameCart || !document.getElementById('cartButton')) {
            console.log('🔄 Reintentando inicialización...');
            initializeCartSystem();
        }
    }, 1000);
});

// Función global para debugging
window.debugCart = function() {
    console.log('\n🛠️ INFORMACIÓN DE DEBUG DEL CARRITO:');
    console.log('Cart Class:', typeof EmpacameCart);
    console.log('Cart Instance:', window.empacameCart);
    console.log('Cart Items:', window.empacameCart?.items?.length || 0);
    console.log('DOM Elements:', {
        cartButton: !!document.getElementById('cartButton'),
        cartSidebar: !!document.getElementById('cartSidebar'),
        productCards: document.querySelectorAll('.product-card').length
    });
    
    if (window.empacameCart && window.empacameCart.items) {
        console.log('Cart Contents:', window.empacameCart.items);
        console.log('Cart Totals:', window.empacameCart.getCartTotals());
    }
};

console.log('✅ Inicializador final del carrito cargado');
console.log('💡 Usa debugCart() para información de debug');
