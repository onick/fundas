// Panel de Administración para Empácame
// Sistema de gestión completo inspirado en el repositorio CodeIgniter

class AdminPanel {
    constructor() {
        this.orders = [];
        this.inventory = {};
        this.subscribers = [];
        this.analytics = {};
        this.currentTab = 'orders';
        
        this.init();
    }

    init() {
        console.log('🚀 Inicializando panel de administración...');
        
        this.loadData();
        this.bindEvents();
        this.startAutoRefresh();
        this.updateLastRefresh();
        
        console.log('✅ Panel de administración listo');
    }

    // Cargar todos los datos
    async loadData() {
        console.log('📊 Cargando datos del sistema...');
        
        try {
            await Promise.all([
                this.loadOrders(),
                this.loadInventory(),
                this.loadSubscribers(),
                this.loadAnalytics()
            ]);
            
            this.updateDashboard();
            this.renderCurrentTab();
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.showAlert('Error cargando datos del sistema', 'error');
        }
    }

    // Cargar pedidos simulados
    async loadOrders() {
        // En producción esto vendría de una API o base de datos
        const savedOrders = localStorage.getItem('empacame_orders');
        
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            // Generar datos de ejemplo
            this.orders = this.generateSampleOrders();
            localStorage.setItem('empacame_orders', JSON.stringify(this.orders));
        }
        
        console.log(`📦 ${this.orders.length} pedidos cargados`);
    }

    // Cargar inventario
    async loadInventory() {
        // Intentar cargar desde el sistema de inventario existente
        if (window.inventoryManager) {
            this.inventory = window.inventoryManager.inventory;
        } else {
            // Cargar desde localStorage o usar datos por defecto
            const savedInventory = localStorage.getItem('empacame_inventory');
            if (savedInventory) {
                this.inventory = JSON.parse(savedInventory);
            } else {
                this.inventory = this.getDefaultInventory();
            }
        }
        
        console.log(`📦 ${Object.keys(this.inventory).length} productos en inventario`);
    }

    // Cargar suscriptores del newsletter
    async loadSubscribers() {
        if (window.newsletterSystem) {
            this.subscribers = window.newsletterSystem.subscribers;
        } else {
            const savedSubscribers = localStorage.getItem('empacame_newsletter_subscribers');
            if (savedSubscribers) {
                this.subscribers = JSON.parse(savedSubscribers);
            } else {
                this.subscribers = [];
            }
        }
        
        console.log(`📧 ${this.subscribers.length} suscriptores cargados`);
    }

    // Cargar analytics
    async loadAnalytics() {
        // Generar analytics basados en pedidos
        this.analytics = this.calculateAnalytics();
        console.log('📈 Analytics calculados');
    }

    // Vincular eventos
    bindEvents() {
        // Tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Refresh data
        document.getElementById('refresh-data')?.addEventListener('click', () => {
            this.refreshData();
        });

        // Filtros y acciones
        document.getElementById('order-filter')?.addEventListener('change', () => {
            this.renderOrdersTable();
        });

        document.getElementById('export-orders')?.addEventListener('click', () => {
            this.exportOrders();
        });

        document.getElementById('export-inventory')?.addEventListener('click', () => {
            this.exportInventory();
        });

        document.getElementById('export-subscribers')?.addEventListener('click', () => {
            this.exportSubscribers();
        });

        document.getElementById('restock-all')?.addEventListener('click', () => {
            this.restockAll();
        });

        // Modal
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('order-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'order-modal') {
                this.closeModal();
            }
        });
    }

    // Actualizar dashboard principal
    updateDashboard() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.date).toDateString() === today
        );
        
        const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const lowStockCount = this.getLowStockCount();
        const activeSubscribers = this.getActiveSubscribersCount();

        // Actualizar estadísticas principales
        this.updateElement('orders-today', todayOrders.length);
        this.updateElement('sales-today', `$${todaySales.toFixed(2)}`);
        this.updateElement('low-stock-count', lowStockCount);
        this.updateElement('newsletter-subscribers', activeSubscribers);

        // Mostrar alertas críticas
        this.updateAlerts();
    }

    // Actualizar alertas
    updateAlerts() {
        const alertsContainer = document.getElementById('admin-alerts');
        if (!alertsContainer) return;

        const alerts = [];

        // Alertas de stock bajo
        const lowStockProducts = this.getLowStockProducts();
        if (lowStockProducts.length > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowStockProducts.length} productos con stock bajo`,
                details: lowStockProducts.map(p => p.id).join(', ')
            });
        }

        // Alertas de pedidos pendientes
        const pendingOrders = this.orders.filter(order => order.status === 'pending');
        if (pendingOrders.length > 5) {
            alerts.push({
                type: 'info',
                message: `${pendingOrders.length} pedidos pendientes de procesar`,
                action: 'Ver pedidos'
            });
        }

        // Renderizar alertas
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="bg-${this.getAlertColor(alert.type)}-50 border border-${this.getAlertColor(alert.type)}-200 rounded-lg p-4 mb-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-${this.getAlertIcon(alert.type)} text-${this.getAlertColor(alert.type)}-600"></i>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm font-medium text-${this.getAlertColor(alert.type)}-800">
                            ${alert.message}
                        </p>
                        ${alert.details ? `<p class="text-xs text-${this.getAlertColor(alert.type)}-600 mt-1">${alert.details}</p>` : ''}
                    </div>
                    ${alert.action ? `
                        <div class="flex-shrink-0">
                            <button class="text-${this.getAlertColor(alert.type)}-600 hover:text-${this.getAlertColor(alert.type)}-800 text-sm font-medium">
                                ${alert.action}
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Cambiar tab
    switchTab(tabName) {
        this.currentTab = tabName;

        // Actualizar tabs visuales
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active', 'border-orange-500', 'text-orange-600');
            tab.classList.add('border-transparent', 'text-gray-500');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'border-orange-500', 'text-orange-600');
        document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-gray-500');

        // Mostrar/ocultar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        document.getElementById(`${tabName}-tab`).classList.remove('hidden');

        // Renderizar contenido del tab
        this.renderCurrentTab();
    }

    // Renderizar tab actual
    renderCurrentTab() {
        switch (this.currentTab) {
            case 'orders':
                this.renderOrdersTable();
                break;
            case 'inventory':
                this.renderInventoryTable();
                break;
            case 'newsletter':
                this.renderNewsletterTable();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }

    // Renderizar tabla de pedidos
    renderOrdersTable() {
        const tableBody = document.getElementById('orders-table-body');
        if (!tableBody) return;

        const filter = document.getElementById('order-filter')?.value || 'all';
        let filteredOrders = this.orders;

        if (filter !== 'all') {
            filteredOrders = this.orders.filter(order => order.status === filter);
        }

        tableBody.innerHTML = filteredOrders.map(order => `
            <tr class="table-row cursor-pointer" onclick="adminPanel.showOrderDetails('${order.id}')">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${order.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.customerName}<br>
                    <span class="text-xs text-gray-400">${order.customerEmail}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.items.length} producto(s)
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $${order.total.toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusClass(order.status)}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(order.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="event.stopPropagation(); adminPanel.updateOrderStatus('${order.id}')" 
                            class="text-orange-600 hover:text-orange-900 mr-3">
                        Actualizar
                    </button>
                    <button onclick="event.stopPropagation(); adminPanel.showOrderDetails('${order.id}')" 
                            class="text-blue-600 hover:text-blue-900">
                        Ver
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Renderizar tabla de inventario
    renderInventoryTable() {
        const tableBody = document.getElementById('inventory-table-body');
        if (!tableBody) return;

        const totalStock = Object.values(this.inventory).reduce((sum, item) => sum + item.stock, 0);
        const lowStockProducts = this.getLowStockProducts().length;

        this.updateElement('total-stock', totalStock);
        this.updateElement('low-stock-products', lowStockProducts);

        tableBody.innerHTML = Object.entries(this.inventory).map(([productId, data]) => `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${this.formatProductName(productId)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${data.stock}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${data.threshold}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStockStatusClass(data)}">
                        ${this.getStockStatusText(data)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="adminPanel.restockProduct('${productId}')" 
                            class="text-green-600 hover:text-green-900 mr-3">
                        <i class="fas fa-plus mr-1"></i>Reabastecer
                    </button>
                    <button onclick="adminPanel.adjustStock('${productId}')" 
                            class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-edit mr-1"></i>Ajustar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Renderizar tabla de newsletter
    renderNewsletterTable() {
        const tableBody = document.getElementById('newsletter-table-body');
        if (!tableBody) return;

        const stats = this.getNewsletterStats();
        
        this.updateElement('active-subscribers', stats.active);
        this.updateElement('confirmation-rate', `${stats.confirmationRate}%`);
        this.updateElement('new-subscribers', stats.newThisWeek);

        tableBody.innerHTML = this.subscribers.slice(0, 50).map(subscriber => `
            <tr class="table-row">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${subscriber.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(subscriber.subscribedAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${subscriber.source || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getSubscriberStatusClass(subscriber)}">
                        ${subscriber.confirmed ? 'Confirmado' : 'Pendiente'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${!subscriber.confirmed ? `
                        <button onclick="adminPanel.confirmSubscriber('${subscriber.email}')" 
                                class="text-green-600 hover:text-green-900 mr-3">
                            Confirmar
                        </button>
                    ` : ''}
                    <button onclick="adminPanel.unsubscribeUser('${subscriber.email}')" 
                            class="text-red-600 hover:text-red-900">
                        Desuscribir
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Renderizar analytics
    renderAnalytics() {
        this.renderSalesChart();
        this.renderProductsChart();
    }

    // Generar pedidos de ejemplo
    generateSampleOrders() {
        const sampleOrders = [];
        const products = [
            { id: '10x13-100', name: '10x13 - 100 unidades', price: 8.99 },
            { id: '12x15.5-500', name: '12x15.5 - 500 unidades', price: 46.99 },
            { id: '9x12-100', name: '9x12 - 100 unidades', price: 15.95 },
            { id: '19x24-50', name: '19x24 - 50 unidades', price: 19.98 }
        ];

        const customers = [
            { name: 'María García', email: 'maria@example.com' },
            { name: 'Juan Pérez', email: 'juan@example.com' },
            { name: 'Ana López', email: 'ana@example.com' },
            { name: 'Carlos Rodríguez', email: 'carlos@example.com' }
        ];

        const statuses = ['pending', 'processing', 'delivered', 'cancelled'];

        for (let i = 0; i < 25; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const subtotal = product.price * quantity;
            const shipping = 5.99;
            const total = subtotal + shipping;

            sampleOrders.push({
                id: `EMP-${Date.now() - (i * 1000000)}-${Math.floor(Math.random() * 1000)}`,
                customerName: customer.name,
                customerEmail: customer.email,
                items: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity
                }],
                subtotal: subtotal,
                shipping: shipping,
                total: total,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                date: new Date(Date.now() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)).toISOString(),
                paymentMethod: 'PayPal'
            });
        }

        return sampleOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
>$${order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="flex space-x-3 pt-4">
                    <button onclick="adminPanel.updateOrderStatus('${order.id}')" 
                            class="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                        Actualizar Estado
                    </button>
                    <button onclick="adminPanel.closeModal()" 
                            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    updateOrderStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const newStatus = prompt('Nuevo estado (pending, processing, delivered, cancelled):', order.status);
        if (newStatus && ['pending', 'processing', 'delivered', 'cancelled'].includes(newStatus)) {
            order.status = newStatus;
            localStorage.setItem('empacame_orders', JSON.stringify(this.orders));
            this.renderOrdersTable();
            this.updateDashboard();
            this.closeModal();
            this.showAlert(`Estado del pedido ${orderId} actualizado a ${this.getStatusText(newStatus)}`, 'success');
        }
    }

    restockProduct(productId) {
        const amount = parseInt(prompt('Cantidad a reabastecer:', '50'));
        if (amount && amount > 0) {
            if (this.inventory[productId]) {
                this.inventory[productId].stock += amount;
                localStorage.setItem('empacame_inventory', JSON.stringify(this.inventory));
                
                // Actualizar inventario global si existe
                if (window.inventoryManager) {
                    window.inventoryManager.inventory[productId].stock += amount;
                    window.inventoryManager.saveInventoryToStorage();
                    window.inventoryManager.updateInventoryDisplays();
                }
                
                this.renderInventoryTable();
                this.updateDashboard();
                this.showAlert(`${this.formatProductName(productId)} reabastecido con ${amount} unidades`, 'success');
            }
        }
    }

    restockAll() {
        if (confirm('¿Reabastecer todos los productos con stock bajo?')) {
            const lowStockProducts = this.getLowStockProducts();
            let restocked = 0;

            lowStockProducts.forEach(product => {
                const restockAmount = product.threshold * 3; // Reabastecer a 3x el umbral
                this.inventory[product.id].stock += restockAmount;
                restocked++;
            });

            if (restocked > 0) {
                localStorage.setItem('empacame_inventory', JSON.stringify(this.inventory));
                
                // Actualizar inventario global si existe
                if (window.inventoryManager) {
                    window.inventoryManager.inventory = this.inventory;
                    window.inventoryManager.saveInventoryToStorage();
                    window.inventoryManager.updateInventoryDisplays();
                }
                
                this.renderInventoryTable();
                this.updateDashboard();
                this.showAlert(`${restocked} productos reabastecidos exitosamente`, 'success');
            } else {
                this.showAlert('No hay productos que requieran reabastecimiento', 'info');
            }
        }
    }

    adjustStock(productId) {
        const currentStock = this.inventory[productId]?.stock || 0;
        const newStock = parseInt(prompt(`Stock actual: ${currentStock}\nNuevo stock:`, currentStock.toString()));
        
        if (newStock !== null && newStock >= 0) {
            this.inventory[productId].stock = newStock;
            localStorage.setItem('empacame_inventory', JSON.stringify(this.inventory));
            
            // Actualizar inventario global si existe
            if (window.inventoryManager) {
                window.inventoryManager.inventory[productId].stock = newStock;
                window.inventoryManager.saveInventoryToStorage();
                window.inventoryManager.updateInventoryDisplays();
            }
            
            this.renderInventoryTable();
            this.updateDashboard();
            this.showAlert(`Stock de ${this.formatProductName(productId)} ajustado a ${newStock}`, 'success');
        }
    }

    confirmSubscriber(email) {
        const subscriber = this.subscribers.find(sub => sub.email === email);
        if (subscriber) {
            subscriber.confirmed = true;
            subscriber.confirmedAt = new Date().toISOString();
            localStorage.setItem('empacame_newsletter_subscribers', JSON.stringify(this.subscribers));
            
            // Actualizar sistema global si existe
            if (window.newsletterSystem) {
                window.newsletterSystem.confirmSubscription(email);
            }
            
            this.renderNewsletterTable();
            this.updateDashboard();
            this.showAlert(`Suscripción de ${email} confirmada`, 'success');
        }
    }

    unsubscribeUser(email) {
        if (confirm(`¿Desuscribir a ${email}?`)) {
            const subscriber = this.subscribers.find(sub => sub.email === email);
            if (subscriber) {
                subscriber.status = 'unsubscribed';
                subscriber.unsubscribedAt = new Date().toISOString();
                localStorage.setItem('empacame_newsletter_subscribers', JSON.stringify(this.subscribers));
                
                // Actualizar sistema global si existe
                if (window.newsletterSystem) {
                    window.newsletterSystem.unsubscribe(email);
                }
                
                this.renderNewsletterTable();
                this.updateDashboard();
                this.showAlert(`${email} desuscrito exitosamente`, 'success');
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('order-modal');
        if (modal) modal.classList.add('hidden');
    }

    // Funciones de exportación
    exportOrders() {
        const filter = document.getElementById('order-filter')?.value || 'all';
        let ordersToExport = this.orders;

        if (filter !== 'all') {
            ordersToExport = this.orders.filter(order => order.status === filter);
        }

        const headers = ['Pedido #', 'Cliente', 'Email', 'Productos', 'Subtotal', 'Envío', 'Total', 'Estado', 'Fecha'];
        const csvContent = [
            headers.join(','),
            ...ordersToExport.map(order => [
                order.id,
                `"${order.customerName}"`,
                order.customerEmail,
                order.items.length,
                order.subtotal.toFixed(2),
                order.shipping.toFixed(2),
                order.total.toFixed(2),
                order.status,
                new Date(order.date).toLocaleDateString()
            ].join(','))
        ].join('\n');

        this.downloadCSV(csvContent, `empacame-pedidos-${filter}-${new Date().toISOString().split('T')[0]}.csv`);
    }

    exportInventory() {
        const headers = ['Producto', 'Stock Actual', 'Umbral', 'Estado'];
        const csvContent = [
            headers.join(','),
            ...Object.entries(this.inventory).map(([productId, data]) => [
                `"${this.formatProductName(productId)}"`,
                data.stock,
                data.threshold,
                this.getStockStatusText(data)
            ].join(','))
        ].join('\n');

        this.downloadCSV(csvContent, `empacame-inventario-${new Date().toISOString().split('T')[0]}.csv`);
    }

    exportSubscribers() {
        if (window.newsletterSystem && window.newsletterSystem.downloadSubscribersCSV) {
            window.newsletterSystem.downloadSubscribersCSV();
        } else {
            const headers = ['Email', 'Fecha de Suscripción', 'Origen', 'Estado', 'Confirmado'];
            const csvContent = [
                headers.join(','),
                ...this.subscribers.map(sub => [
                    sub.email,
                    new Date(sub.subscribedAt).toLocaleDateString(),
                    sub.source || 'N/A',
                    sub.status || 'active',
                    sub.confirmed ? 'Sí' : 'No'
                ].join(','))
            ].join('\n');

            this.downloadCSV(csvContent, `empacame-suscriptores-${new Date().toISOString().split('T')[0]}.csv`);
        }
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showAlert(`Archivo ${filename} descargado`, 'success');
    }

    // Gráficos con Chart.js
    renderSalesChart() {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) return;

        const salesData = this.analytics.salesByDay;
        const labels = Object.keys(salesData).map(date => 
            new Date(date).toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric' })
        );
        const data = Object.values(salesData);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: data,
                    borderColor: '#FF8C00',
                    backgroundColor: 'rgba(255, 140, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    renderProductsChart() {
        const ctx = document.getElementById('products-chart');
        if (!ctx) return;

        const topProducts = this.analytics.productSales.slice(0, 5);
        const labels = topProducts.map(p => p.name.split(' - ')[0]);
        const data = topProducts.map(p => p.quantity);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF8C00',
                        '#00A8CC',
                        '#00B96B',
                        '#FFB800',
                        '#FF4757'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Auto refresh y utilidades
    startAutoRefresh() {
        // Refrescar datos cada 5 minutos
        setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }

    async refreshData() {
        console.log('🔄 Refrescando datos...');
        await this.loadData();
        this.updateLastRefresh();
        this.showAlert('Datos actualizados', 'success');
    }

    updateLastRefresh() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-DO', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.updateElement('last-update', `Última actualización: ${timeString}`);
    }
}

// Inicializar panel cuando la página esté lista
let adminPanel;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando panel de administración...');
    adminPanel = new AdminPanel();
    
    // Hacer disponible globalmente para los event handlers
    window.adminPanel = adminPanel;
});

// Funciones globales para event handlers
window.adminPanel = null;

console.log('📋 Panel de administración cargado');
