// Sistema de inventario para mostrar stock disponible
// Mejora inspirada en el repositorio CodeIgniter para Empácame

class InventoryManager {
    constructor() {
        // Base de datos de inventario (simulado con datos locales)
        this.inventory = {
            '5x7-100': { stock: 45, threshold: 10 },
            '5x7-500': { stock: 23, threshold: 5 },
            '5x9-100': { stock: 67, threshold: 10 },
            '5x9-500': { stock: 12, threshold: 5 },
            '9x6-100': { stock: 89, threshold: 10 },
            '9x6-500': { stock: 34, threshold: 5 },
            '9x12-100': { stock: 156, threshold: 15 },
            '9x12-500': { stock: 42, threshold: 8 },
            '10x13-100': { stock: 8, threshold: 10 }, // Stock bajo!
            '10x13-500': { stock: 28, threshold: 5 },
            '12x15-100': { stock: 73, threshold: 10 },
            '12x15-500': { stock: 19, threshold: 5 },
            '12x15.5-100': { stock: 91, threshold: 10 },
            '12x15.5-500': { stock: 37, threshold: 5 },
            '14.5x19-100': { stock: 44, threshold: 8 },
            '14.5x19-400': { stock: 15, threshold: 3 },
            '19x24-50': { stock: 62, threshold: 12 },
            '19x24-100': { stock: 25, threshold: 6 },
            '19x24-200': { stock: 13, threshold: 4 },
            '24x24-25': { stock: 38, threshold: 8 },
            '24x24-50': { stock: 22, threshold: 5 }
        };
        
        this.loadInventoryFromStorage();
        this.init();
    }

    init() {
        console.log('📦 Inicializando sistema de inventario...');
        this.addInventoryIndicators();
        this.updateInventoryDisplays();
        console.log('✅ Sistema de inventario listo');
    }

    // Obtener stock actual de un producto
    getStock(productId) {
        return this.inventory[productId]?.stock || 0;
    }

    // Verificar si está en stock bajo
    isLowStock(productId) {
        const item = this.inventory[productId];
        if (!item) return false;
        return item.stock <= item.threshold;
    }

    // Verificar si está agotado
    isOutOfStock(productId) {
        return this.getStock(productId) === 0;
    }

    // Actualizar stock (cuando se hace una compra)
    updateStock(productId, quantity) {
        if (this.inventory[productId]) {
            this.inventory[productId].stock = Math.max(0, this.inventory[productId].stock - quantity);
            this.saveInventoryToStorage();
            this.updateInventoryDisplays();
            console.log(`📉 Stock actualizado: ${productId} -${quantity} unidades`);
        }
    }

    // Agregar indicadores de inventario a las tarjetas de producto
    addInventoryIndicators() {
        const productCards = document.querySelectorAll('.product-card, [data-product-id]');
        
        productCards.forEach(card => {
            // Intentar obtener el ID del producto de diferentes formas
            let productId = card.getAttribute('data-product-id');
            
            if (!productId) {
                // Buscar en el botón de agregar al carrito
                const addButton = card.querySelector('button[onclick*="addToCart"]');
                if (addButton) {
                    const onclick = addButton.getAttribute('onclick');
                    const match = onclick.match(/'([^']+)'/);
                    if (match) {
                        productId = match[1];
                    }
                }
            }
            
            if (productId && this.inventory[productId]) {
                const stock = this.getStock(productId);
                
                // Crear indicador de stock
                const stockIndicator = this.createStockIndicator(productId, stock);
                
                // Buscar dónde insertar el indicador (después del precio)
                const priceElement = card.querySelector('.text-2xl, .text-xl, .font-bold');
                if (priceElement && !card.querySelector('.stock-indicator')) {
                    priceElement.parentNode.insertBefore(stockIndicator, priceElement.nextSibling);
                }
            }
        });
    }

    createStockIndicator(productId, stock) {
        const div = document.createElement('div');
        div.className = 'stock-indicator mt-2 mb-2';
        
        let content = '';
        let className = '';

        if (this.isOutOfStock(productId)) {
            content = '❌ Agotado';
            className = 'text-red-600 font-semibold bg-red-50 px-2 py-1 rounded text-sm';
        } else if (this.isLowStock(productId)) {
            content = `⚠️ ¡Solo quedan ${stock}!`;
            className = 'text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded text-sm animate-pulse';
        } else if (stock <= 30) {
            content = `📦 ${stock} disponibles`;
            className = 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm';
        } else {
            content = `✅ En stock (${stock}+)`;
            className = 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm';
        }

        div.innerHTML = `<span class="${className}">${content}</span>`;
        return div;
    }

    // Actualizar todos los displays de inventario
    updateInventoryDisplays() {
        const stockIndicators = document.querySelectorAll('.stock-indicator');
        
        stockIndicators.forEach(indicator => {
            const card = indicator.closest('.product-card, [data-product-id]');
            if (card) {
                // Obtener product ID del card
                let productId = card.getAttribute('data-product-id');
                
                if (!productId) {
                    const addButton = card.querySelector('button[onclick*="addToCart"]');
                    if (addButton) {
                        const onclick = addButton.getAttribute('onclick');
                        const match = onclick.match(/'([^']+)'/);
                        if (match) {
                            productId = match[1];
                        }
                    }
                }
                
                if (productId) {
                    const stock = this.getStock(productId);
                    const newIndicator = this.createStockIndicator(productId, stock);
                    indicator.replaceWith(newIndicator);
                }
            }
        });

        // Actualizar botones de productos agotados
        this.updateAddToCartButtons();
    }

    // Actualizar botones "Agregar al Carrito"
    updateAddToCartButtons() {
        const productCards = document.querySelectorAll('.product-card, [data-product-id]');
        
        productCards.forEach(card => {
            let productId = card.getAttribute('data-product-id');
            const addButton = card.querySelector('button[onclick*="addToCart"]');
            
            if (!productId && addButton) {
                const onclick = addButton.getAttribute('onclick');
                const match = onclick.match(/'([^']+)'/);
                if (match) {
                    productId = match[1];
                }
            }
            
            if (addButton && productId && this.isOutOfStock(productId)) {
                addButton.disabled = true;
                addButton.textContent = '❌ Agotado';
                addButton.className = addButton.className.replace('bg-orange-500', 'bg-gray-400');
                addButton.className = addButton.className.replace('hover:bg-orange-600', '');
                addButton.style.cursor = 'not-allowed';
            }
        });
    }

    // Verificar stock antes de agregar al carrito
    canAddToCart(productId, quantity = 1) {
        const stock = this.getStock(productId);
        const currentInCart = this.getCurrentCartQuantity(productId);
        
        return (currentInCart + quantity) <= stock;
    }

    // Obtener cantidad actual en el carrito
    getCurrentCartQuantity(productId) {
        if (window.empacameCart && window.empacameCart.cart) {
            const cartItem = window.empacameCart.cart.find(item => item.id === productId);
            return cartItem ? cartItem.quantity : 0;
        }
        return 0;
    }

    // Mostrar alerta de stock insuficiente
    showStockAlert(productId, requested, available) {
        const alert = document.createElement('div');
        alert.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
        alert.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-3">⚠️</span>
                <div>
                    <div class="font-semibold">Stock insuficiente</div>
                    <div class="text-sm">Solo hay ${available} unidades disponibles</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // Guardar inventario en localStorage
    saveInventoryToStorage() {
        localStorage.setItem('empacame_inventory', JSON.stringify(this.inventory));
    }

    // Cargar inventario desde localStorage
    loadInventoryFromStorage() {
        const saved = localStorage.getItem('empacame_inventory');
        if (saved) {
            try {
                const savedInventory = JSON.parse(saved);
                // Merge con inventario por defecto
                this.inventory = { ...this.inventory, ...savedInventory };
            } catch (e) {
                console.warn('Error cargando inventario desde storage:', e);
            }
        }
    }

    // Simular restock (para admin)
    restockProduct(productId, amount) {
        if (this.inventory[productId]) {
            this.inventory[productId].stock += amount;
            this.saveInventoryToStorage();
            this.updateInventoryDisplays();
            console.log(`📈 Restock: ${productId} +${amount} unidades`);
            return true;
        }
        return false;
    }

    // Obtener productos con stock bajo
    getLowStockProducts() {
        return Object.entries(this.inventory)
            .filter(([id, data]) => data.stock <= data.threshold)
            .map(([id, data]) => ({ id, stock: data.stock, threshold: data.threshold }));
    }

    // Obtener reporte de inventario
    getInventoryReport() {
        const total = Object.values(this.inventory).reduce((sum, item) => sum + item.stock, 0);
        const lowStock = this.getLowStockProducts();
        const outOfStock = Object.entries(this.inventory).filter(([id, data]) => data.stock === 0);

        return {
            totalProducts: Object.keys(this.inventory).length,
            totalStock: total,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            lowStockProducts: lowStock,
            outOfStockProducts: outOfStock.map(([id]) => id)
        };
    }

    // Método para obtener alertas críticas
    getCriticalAlerts() {
        const alerts = [];
        
        // Productos agotados
        Object.entries(this.inventory).forEach(([id, data]) => {
            if (data.stock === 0) {
                alerts.push({
                    type: 'critical',
                    message: `Producto ${id} AGOTADO`,
                    productId: id
                });
            } else if (data.stock <= data.threshold) {
                alerts.push({
                    type: 'warning',
                    message: `Stock bajo en ${id}: ${data.stock} unidades`,
                    productId: id
                });
            }
        });
        
        return alerts;
    }
}

// Integración con el sistema de carrito existente
function integrateInventoryWithCart() {
    if (window.empacameCart && window.inventoryManager) {
        console.log('🔗 Integrando inventario con carrito...');
        
        // Interceptar el método addToCart original
        const originalAddToCart = window.empacameCart.addToCart.bind(window.empacameCart);
        
        window.empacameCart.addToCart = function(productId, productName, price, quantity = 1) {
            console.log(`🛒 Intentando agregar: ${productId} x${quantity}`);
            
            // TEMPORALMENTE DESHABILITADO - Verificación de stock
            // TODO: Restaurar cuando el inventario esté correctamente configurado
            /*
            if (!window.inventoryManager.canAddToCart(productId, quantity)) {
                const available = window.inventoryManager.getStock(productId);
                const inCart = window.inventoryManager.getCurrentCartQuantity(productId);
                const canAdd = available - inCart;
                
                console.log(`❌ Stock insuficiente: disponible=${available}, en carrito=${inCart}, puede agregar=${canAdd}`);
                
                window.inventoryManager.showStockAlert(productId, quantity, canAdd);
                return false;
            }
            */
            
            // Proceder normalmente sin verificación de stock
            console.log(`✅ Agregando producto (verificación de stock deshabilitada)`);
            const result = originalAddToCart(productId, productName, price, quantity);
            
            return result;
        };
        
        console.log('✅ Integración completada');
    }
}

// Función para inicializar el sistema de inventario
function initInventorySystem() {
    console.log('🚀 Iniciando sistema de inventario...');
    
    // Crear instancia global del manager de inventario
    window.inventoryManager = new InventoryManager();
    
    // Integrar con el carrito cuando esté disponible
    if (window.empacameCart) {
        integrateInventoryWithCart();
    } else {
        // Esperar a que se cargue el carrito
        let attempts = 0;
        const checkCart = setInterval(() => {
            attempts++;
            if (window.empacameCart) {
                integrateInventoryWithCart();
                clearInterval(checkCart);
            } else if (attempts > 50) { // Timeout después de 5 segundos
                console.warn('⚠️ No se pudo integrar con el carrito (timeout)');
                clearInterval(checkCart);
            }
        }, 100);
    }
    
    return window.inventoryManager;
}

// Auto-inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInventorySystem);
} else {
    initInventorySystem();
}

// Consola de administración para testing (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    window.inventoryAdmin = {
        restock: (productId, amount) => window.inventoryManager?.restockProduct(productId, amount),
        report: () => window.inventoryManager?.getInventoryReport(),
        alerts: () => window.inventoryManager?.getCriticalAlerts(),
        stock: (productId) => window.inventoryManager?.getStock(productId)
    };
    
    console.log('🔧 Consola de admin disponible: window.inventoryAdmin');
}
