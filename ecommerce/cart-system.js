/**
 * EMPÁCAME E-COMMERCE SYSTEM
 * Sistema de carrito inteligente para bolsas de envío
 * Integrado con diseño existente y optimizado para República Dominicana
 */

class EmpacameCart {
    constructor() {
        this.items = this.loadCart();
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createCartHTML();
        this.bindEvents();
        this.updateCartDisplay();
    }

    // Estructura de productos actualizada con tamaños disponibles
    getProducts() {
        return {
            '6x9': {
                name: '6" × 9"',
                subtitle: 'Ideal para joyería, cosméticos',
                sizes: {
                    100: { price: 9.99, pricePerUnit: 0.10 },
                    1000: { price: 39.99, pricePerUnit: 0.04, savings: 60 }
                }
            },
            '5x7': {
                name: '5" × 7"',
                subtitle: 'Ideal para documentos pequeños, tarjetas',
                sizes: {
                    100: { price: 8.99, pricePerUnit: 0.09 },
                    1000: { price: 35.99, pricePerUnit: 0.036, savings: 60 }
                }
            },
            '5x9': {
                name: '5" × 9"',
                subtitle: 'Documentos, boletos, invitaciones',
                sizes: {
                    100: { price: 9.99, pricePerUnit: 0.10 },
                    1000: { price: 39.99, pricePerUnit: 0.04, savings: 60 }
                }
            },
            '9x6': {
                name: '9" × 6"',
                subtitle: 'Formato horizontal, fotos, documentos',
                sizes: {
                    100: { price: 9.99, pricePerUnit: 0.10 },
                    1000: { price: 39.99, pricePerUnit: 0.04, savings: 60 }
                }
            },
            '9x12': {
                name: '9" × 12"',
                subtitle: 'Ropa ligera, accesorios',
                sizes: {
                    100: { price: 15.95, pricePerUnit: 0.16 },
                    1000: { price: 59.95, pricePerUnit: 0.06, savings: 62 }
                }
            },
            '10x13': {
                name: '10" × 13"',
                subtitle: 'Ropa mediana, libros',
                sizes: {
                    100: { price: 8.99, pricePerUnit: 0.09, originalPrice: 9.99 },
                    500: { price: 38.95, pricePerUnit: 0.08 },
                    1000: { price: 59.99, pricePerUnit: 0.06 },
                    2000: { price: 110.99, pricePerUnit: 0.055 }
                }
            },
            '12x15': {
                name: '12" × 15"',
                subtitle: 'Ropa estándar, productos medianos',
                sizes: {
                    100: { price: 16.50, pricePerUnit: 0.165 },
                    500: { price: 45.99, pricePerUnit: 0.092 },
                    1000: { price: 87.99, pricePerUnit: 0.088 }
                }
            },
            '12x15.5': {
                name: '12" × 15.5"',
                subtitle: 'Ropa estándar, zapatos',
                popular: true,
                sizes: {
                    100: { price: 16.90, pricePerUnit: 0.17 },
                    500: { price: 46.99, pricePerUnit: 0.09, savings: 47, bestValue: true },
                    1000: { price: 89.99, pricePerUnit: 0.09 }
                }
            },
            '14.5x19': {
                name: '14.5" × 19"',
                subtitle: 'Ropa grande, múltiples productos',
                sizes: {
                    100: { price: 19.99, pricePerUnit: 0.20 },
                    400: { price: 69.99, pricePerUnit: 0.17, savings: 15 },
                    1000: { price: 149.99, pricePerUnit: 0.15, savings: 25 }
                }
            },
            '19x24': {
                name: '19" × 24"',
                subtitle: 'Productos voluminosos, múltiples items',
                sizes: {
                    50: { price: 19.98, pricePerUnit: 0.40 },
                    100: { price: 35.95, pricePerUnit: 0.36 },
                    200: { price: 68.90, pricePerUnit: 0.34, savings: 15 },
                    400: { price: 99.99, pricePerUnit: 0.25, savings: 37 }
                }
            },
            '24x24': {
                name: '24" × 24"',
                subtitle: 'Productos extra grandes, paquetes voluminosos',
                sizes: {
                    25: { price: 24.99, pricePerUnit: 1.00 },
                    50: { price: 44.99, pricePerUnit: 0.90, savings: 10 },
                    100: { price: 79.99, pricePerUnit: 0.80, savings: 20 },
                    200: { price: 149.99, pricePerUnit: 0.75, savings: 25 }
                }
            }
        };
    }

    // Agregar producto al carrito
    addToCart(productKey, quantity, customQuantity = null) {
        const products = this.getProducts();
        const product = products[productKey];
        
        if (!product) return false;

        const finalQuantity = customQuantity || quantity;
        const priceData = product.sizes[quantity];
        
        if (!priceData) return false;

        const itemId = `${productKey}-${quantity}`;
        const existingItem = this.items.find(item => item.id === itemId);

        const cartItem = {
            id: itemId,
            productKey,
            productName: product.name,
            subtitle: product.subtitle,
            quantity: finalQuantity,
            originalQuantity: quantity,
            unitPrice: priceData.price,
            pricePerUnit: priceData.pricePerUnit,
            savings: priceData.savings || 0,
            popular: product.popular || false,
            bestValue: priceData.bestValue || false,
            originalPrice: priceData.originalPrice || null
        };

        if (existingItem) {
            existingItem.quantity = finalQuantity;
        } else {
            this.items.push(cartItem);
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showAddedNotification(cartItem);
        return true;
    }

    // Remover producto del carrito
    removeFromCart(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
    }

    // Actualizar cantidad
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    // Calcular totales
    getCartTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity / item.originalQuantity), 0);
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const shipping = 5.99; // Envío fijo
        const total = subtotal + shipping;

        return {
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            total: total.toFixed(2),
            totalItems,
            freeShipping: false
        };
    }

    // Método para compatibilidad con sistema de pagos
    getSubtotal() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity / item.originalQuantity), 0);
        return parseFloat(subtotal.toFixed(2));
    }

    // Método para obtener el total
    getTotal() {
        const totals = this.getCartTotals();
        return parseFloat(totals.total);
    }

    // Método para obtener el costo de envío
    getShipping() {
        return 5.99;
    }

    // Crear HTML del carrito
    createCartHTML() {
        const cartHTML = `
            <!-- Cart Button -->
            <div class="cart-button" id="cartButton">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count" id="cartCount">0</span>
                <span class="cart-total" id="cartTotal">$0.00</span>
            </div>

            <!-- Cart Sidebar -->
            <div class="cart-sidebar" id="cartSidebar">
                <div class="cart-header">
                    <h3><i class="fas fa-shopping-cart"></i> Tu Carrito</h3>
                    <button class="close-cart" id="closeCart">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="cart-content">
                    <div class="cart-items" id="cartItems">
                        <!-- Items se cargan dinámicamente -->
                    </div>
                    
                    <div class="cart-summary" id="cartSummary">
                        <!-- Resumen se carga dinámicamente -->
                    </div>
                </div>
                
                <div class="cart-actions">
                    <button class="btn-checkout" id="proceedCheckout">
                        <i class="fas fa-credit-card"></i>
                        Proceder al Pago
                    </button>
                    <button class="btn-whatsapp" id="checkoutWhatsApp">
                        <i class="fab fa-whatsapp"></i>
                        Pedir por WhatsApp
                    </button>
                </div>
            </div>

            <!-- Cart Overlay -->
            <div class="cart-overlay" id="cartOverlay"></div>

            <!-- Notification -->
            <div class="cart-notification" id="cartNotification">
                <i class="fas fa-check-circle"></i>
                <span id="notificationText">Producto agregado al carrito</span>
            </div>
            
            <!-- Checkout Button for Payment System -->
            <button id="checkoutButton" style="display: none;"></button>
        `;

        // Insertar en el body
        document.body.insertAdjacentHTML('beforeend', cartHTML);

        // Sincronizar botones
        this.syncCheckoutButtons();
    }

    // Método para sincronizar los botones de checkout
    syncCheckoutButtons() {
        const proceedBtn = document.getElementById('proceedCheckout');
        const checkoutBtn = document.getElementById('checkoutButton');
        
        if (proceedBtn && checkoutBtn) {
            proceedBtn.addEventListener('click', () => {
                checkoutBtn.click();
            });
        }
    }

    // Actualizar display del carrito
    updateCartDisplay() {
        const totals = this.getCartTotals();
        
        // Actualizar botón del carrito (verificar que existe)
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartCount) {
            cartCount.textContent = totals.totalItems;
        }
        if (cartTotal) {
            cartTotal.textContent = `$${totals.total}`;
        }
        
        // Actualizar items (solo si los elementos existen)
        this.updateCartItems();
        
        // Actualizar resumen (solo si los elementos existen)
        this.updateCartSummary();

        // Toggle cart button visibility (verificar que existe)
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            if (totals.totalItems > 0) {
                cartButton.classList.add('has-items');
            } else {
                cartButton.classList.remove('has-items');
            }
        }
    }

    // Actualizar items del carrito
    updateCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        
        // Verificar que el elemento existe y está visible
        if (!cartItemsContainer) {
            console.log('💡 cartItems no disponible (posiblemente en checkout)');
            return;
        }
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                    <span>Agrega productos para comenzar</span>
                </div>
            `;
            return;
        }

        const itemsHTML = this.items.map(item => {
            const itemTotal = (item.unitPrice * item.quantity / item.originalQuantity).toFixed(2);
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-info">
                        <div class="item-name">
                            ${item.productName}
                            ${item.popular ? '<span class="popular-badge">Popular</span>' : ''}
                            ${item.bestValue ? '<span class="best-value-badge">Mejor Valor</span>' : ''}
                        </div>
                        <div class="item-subtitle">${item.subtitle}</div>
                        <div class="item-details">
                            Pack de ${item.originalQuantity} unidades
                            ${item.savings ? `<span class="savings">Ahorras ${item.savings}%</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="item-quantity">
                        <button class="qty-btn minus" onclick="empacameCart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="qty">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="empacameCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    
                    <div class="item-price">
                        <div class="price">$${itemTotal}</div>
                        <button class="remove-item" onclick="empacameCart.removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        cartItemsContainer.innerHTML = itemsHTML;
    }

    // Actualizar resumen del carrito
    updateCartSummary() {
        const totals = this.getCartTotals();
        const cartSummary = document.getElementById('cartSummary');
        
        // Verificar que el elemento existe y está visible
        if (!cartSummary) {
            console.log('💡 cartSummary no disponible (posiblemente en checkout)');
            return;
        }
        
        cartSummary.innerHTML = `
            <div class="summary-line">
                <span>Subtotal (${totals.totalItems} items)</span>
                <span>$${totals.subtotal}</span>
            </div>
            <div class="summary-line shipping">
                <span>Envío</span>
                <span>$${totals.shipping}</span>
            </div>
            <div class="summary-line total">
                <span>Total</span>
                <span>$${totals.total}</span>
            </div>
        `;
    }

    // Mostrar notificación
    showAddedNotification(item) {
        const notification = document.getElementById('cartNotification');
        const text = document.getElementById('notificationText');
        
        // Verificar que los elementos existen
        if (text && notification) {
            text.textContent = `${item.productName} agregado al carrito`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        } else {
            // Fallback: log en consola
            console.log(`✅ ${item.productName} agregado al carrito`);
        }
    }

    // Eventos
    bindEvents() {
        // Abrir carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartButton')) {
                this.openCart();
            }
        });

        // Cerrar carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('#closeCart') || e.target.closest('#cartOverlay')) {
                this.closeCart();
            }
        });

        // Checkout WhatsApp
        document.addEventListener('click', (e) => {
            if (e.target.closest('#checkoutWhatsApp')) {
                this.checkoutWhatsApp();
            }
        });

        // Proceder al pago
        document.addEventListener('click', (e) => {
            if (e.target.closest('#proceedCheckout')) {
                this.proceedToCheckout();
            }
        });

        // ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    // Abrir carrito
    openCart() {
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.add('show');
        document.body.classList.add('cart-open');
        this.isOpen = true;
    }

    // Cerrar carrito
    closeCart() {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('show');
        document.body.classList.remove('cart-open');
        this.isOpen = false;
    }

    // Checkout por WhatsApp
    checkoutWhatsApp() {
        if (this.items.length === 0) return;

        const totals = this.getCartTotals();
        let message = `¡Hola! Quiero hacer un pedido de Empácame:\n\n`;
        
        this.items.forEach(item => {
            const itemTotal = (item.unitPrice * item.quantity / item.originalQuantity).toFixed(2);
            message += `• ${item.productName} (${item.subtitle})\n`;
            message += `  Pack de ${item.originalQuantity} unidades x ${item.quantity} = $${itemTotal}\n\n`;
        });

        message += `RESUMEN:\n`;
        message += `Subtotal: $${totals.subtotal}\n`;
        message += `Envío: ${totals.freeShipping ? 'GRATIS' : '$' + totals.shipping}\n`;
        message += `TOTAL: $${totals.total}\n\n`;
        message += `¿Podemos procesar este pedido?`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/18494496394?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }

    // Proceder al checkout con PayPal
    proceedToCheckout() {
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
    }

    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem('empacame_cart', JSON.stringify(this.items));
    }

    // Cargar carrito desde localStorage
    loadCart() {
        const saved = localStorage.getItem('empacame_cart');
        return saved ? JSON.parse(saved) : [];
    }

    // Limpiar carrito
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    // Método para restaurar la vista del carrito
    restoreCartView() {
        console.log('🔄 Restaurando vista del carrito...');
        
        // Prevenir múltiples ejecuciones
        if (this._restoringView) {
            console.log('⚠️ Ya se está restaurando la vista, saltando...');
            return;
        }
        this._restoringView = true;
        
        // Cerrar cualquier interfaz de pagos
        const paymentContainer = document.getElementById('payment-container');
        if (paymentContainer) {
            paymentContainer.style.display = 'none';
            paymentContainer.remove(); // Eliminar completamente
        }
        
        // Cerrar contenedores temporales de checkout
        const tempContainers = document.querySelectorAll('.cart-content-temp, .enhanced-checkout-form');
        tempContainers.forEach(container => {
            container.remove();
        });
        
        // Verificar si el carrito existe, si no, recrearlo
        let cartSidebar = document.getElementById('cartSidebar');
        if (!cartSidebar) {
            console.log('🔧 Recreando carrito...');
            this.createCartHTML();
            this.bindEvents();
        }
        
        // Asegurar que el carrito esté visible
        setTimeout(() => {
            this.openCart();
            
            // Forzar actualización del display
            setTimeout(() => {
                this.updateCartDisplay();
                this._restoringView = false; // Liberar flag
            }, 100);
        }, 50);
        
        console.log('✅ Vista del carrito restaurada');
    }

    // Método mejorado para abrir carrito
    openCart() {
        // Ocultar interfaz de pagos si está abierta
        const paymentContainer = document.getElementById('payment-container');
        if (paymentContainer) {
            paymentContainer.style.display = 'none';
        }
        
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartSidebar && cartOverlay) {
            // Verificar que el contenido del carrito esté presente
            const cartContent = cartSidebar.querySelector('.cart-content');
            if (!cartContent || cartContent.innerHTML.trim() === '') {
                console.log('🔧 Recreando contenido del carrito...');
                
                // Recrear el contenido básico del carrito
                const newCartContent = document.createElement('div');
                newCartContent.className = 'cart-content';
                newCartContent.innerHTML = `
                    <div class="cart-items" id="cartItems">
                        <!-- Items se cargan dinámicamente -->
                    </div>
                    
                    <div class="cart-summary" id="cartSummary">
                        <!-- Resumen se carga dinámicamente -->
                    </div>
                `;
                
                // Reemplazar contenido
                if (cartContent) {
                    cartContent.replaceWith(newCartContent);
                } else {
                    cartSidebar.appendChild(newCartContent);
                }
            }
            
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('show');
            document.body.classList.add('cart-open');
            this.isOpen = true;
            
            // Actualizar display después de abrir
            setTimeout(() => {
                this.updateCartDisplay();
            }, 50);
        } else {
            console.log('⚠️ Elementos del carrito no encontrados, recreando...');
            this.createCartHTML();
            this.bindEvents();
            
            // Intentar abrir de nuevo
            setTimeout(() => {
                this.openCart();
            }, 100);
        }
    }
}

// Inicializar carrito global
window.empacameCart = new EmpacameCart();