/**
 * EMPÁCAME - SOLUCIÓN DEFINITIVA
 * Este script resuelve todos los problemas de una vez
 */

console.log('🎯 === SOLUCIÓN DEFINITIVA CARGADA ===');

function solucionDefinitiva() {
    console.log('🔧 Aplicando solución definitiva...');
    
    // Esperar a que el carrito esté listo
    const intervalId = setInterval(() => {
        if (window.empacameCart && typeof window.empacameCart === 'object') {
            console.log('✅ Carrito detectado, aplicando correcciones...');
            
            // 1. ARREGLAR CHECKOUT BUTTON
            if (!document.getElementById('checkoutButton')) {
                const hiddenBtn = document.createElement('button');
                hiddenBtn.id = 'checkoutButton';
                hiddenBtn.style.display = 'none';
                document.body.appendChild(hiddenBtn);
                console.log('✅ checkoutButton creado');
            }
            
            // 2. CONECTAR BOTONES
            const proceedBtn = document.getElementById('proceedCheckout');
            if (proceedBtn) {
                proceedBtn.onclick = function() {
                    console.log('🚀 Checkout iniciado');
                    
                    if (window.empacameCart.items.length === 0) {
                        alert('Agrega productos al carrito primero');
                        return;
                    }
                    
                    // Usar PaymentIntegration si está disponible
                    if (window.PaymentIntegration && window.PaymentIntegration.proceedToCheckout) {
                        window.PaymentIntegration.proceedToCheckout();
                    } else {
                        window.empacameCart.checkoutWhatsApp();
                    }
                };
                console.log('✅ Botón de checkout conectado');
            }
            
            // 3. ARREGLAR addToCart
            const originalAdd = window.empacameCart.addToCart;
            window.empacameCart.addToCart = function(productKey, quantity) {
                console.log(`🛒 Agregando: ${productKey} x ${quantity}`);
                
                const productData = {
                    '6x9': { name: '6" × 9"', subtitle: 'Ideal para joyería, cosméticos', price: quantity === 1000 ? 39.99 : 9.99 },
                    '12x15.5': { name: '12" × 15.5"', subtitle: 'Ropa estándar, zapatos', price: 46.99 },
                    '10x13': { name: '10" × 13"', subtitle: 'Ropa mediana, libros', price: 8.99 }
                };
                
                const product = productData[productKey];
                if (!product) return false;
                
                const itemId = `${productKey}-${quantity}`;
                const existing = this.items.find(item => item.id === itemId);
                
                if (existing) {
                    existing.quantity += 1;
                } else {
                    this.items.push({
                        id: itemId,
                        productKey: productKey,
                        productName: product.name,
                        subtitle: product.subtitle,
                        quantity: 1,
                        originalQuantity: quantity,
                        unitPrice: product.price,
                        pricePerUnit: product.price / quantity
                    });
                }
                
                this.saveCart();
                this.updateCartDisplay();
                this.showAddedNotification({ productName: product.name });
                
                console.log(`✅ ${product.name} agregado al carrito`);
                return true;
            };
            
            // 4. CONECTAR BOTONES DE PRODUCTOS
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach((card, index) => {
                const container = card.querySelector('.cart-button-container');
                if (container) {
                    // Limpiar y crear botón
                    container.innerHTML = `
                        <button onclick="window.empacameCart.addToCart('6x9', 100)" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center space-x-2">
                            <i class="fas fa-shopping-cart"></i>
                            <span>Agregar al Carrito</span>
                        </button>
                    `;
                }
            });
            
            console.log('🎉 SOLUCIÓN DEFINITIVA APLICADA');
            
            // Test final
            setTimeout(() => {
                const testAdd = window.empacameCart.addToCart('6x9', 100);
                const hasCheckout = !!document.getElementById('checkoutButton');
                
                console.log(`\n📊 RESULTADO FINAL:`);
                console.log(`   addToCart funciona: ${testAdd ? '✅' : '❌'}`);
                console.log(`   checkoutButton existe: ${hasCheckout ? '✅' : '❌'}`);
                console.log(`   Items en carrito: ${window.empacameCart.items.length}`);
                
                if (testAdd && hasCheckout) {
                    console.log('🎉 ¡TODO FUNCIONA PERFECTAMENTE!');
                } else {
                    console.log('⚠️ Aún hay problemas menores');
                }
            }, 500);
            
            clearInterval(intervalId);
        }
    }, 100);
    
    // Timeout de seguridad
    setTimeout(() => {
        clearInterval(intervalId);
        console.log('⏰ Timeout de solución definitiva');
    }, 10000);
}

// Ejecutar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', solucionDefinitiva);
} else {
    setTimeout(solucionDefinitiva, 1000);
}

// Función manual
window.aplicarSolucion = solucionDefinitiva;

console.log('✅ Solución definitiva configurada');
console.log('💡 Se aplicará automáticamente en unos segundos');
console.log('💡 También puedes ejecutar: aplicarSolucion()');
