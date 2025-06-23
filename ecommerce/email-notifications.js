// Sistema de notificaciones por email para Empácame
// Mejora inspirada en el repositorio CodeIgniter

class EmailNotificationSystem {
    constructor() {
        this.emailService = 'EmailJS'; // Usando EmailJS como servicio
        this.initialized = false;
        this.config = {
            serviceId: 'empacame_service',
            templateId: 'empacame_order',
            adminTemplateId: 'empacame_admin_notification',
            publicKey: 'your-emailjs-public-key' // Configurar en producción
        };
        this.init();
    }

    async init() {
        console.log('📧 Inicializando sistema de notificaciones...');
        
        // Verificar si EmailJS está disponible
        if (typeof emailjs !== 'undefined') {
            this.initialized = true;
            console.log('✅ EmailJS detectado, sistema listo');
        } else {
            console.log('⚠️ EmailJS no detectado, modo de simulación activado');
            this.initialized = false;
        }
    }

    // Enviar notificación de nuevo pedido
    async sendOrderConfirmation(orderData) {
        console.log('📧 Enviando confirmación de pedido...');
        
        try {
            const customerEmail = this.extractCustomerEmail(orderData);
            
            if (!customerEmail) {
                console.warn('⚠️ No se encontró email del cliente');
                return false;
            }

            const emailParams = this.formatOrderEmailParams(orderData, customerEmail);
            
            if (this.initialized) {
                // Enviar con EmailJS
                const result = await this.sendWithEmailJS(this.config.templateId, emailParams);
                console.log('✅ Confirmación enviada al cliente:', customerEmail);
                return result;
            } else {
                // Simular envío
                this.simulateEmailSend('cliente', customerEmail, emailParams);
                return true;
            }
            
        } catch (error) {
            console.error('❌ Error enviando confirmación:', error);
            return false;
        }
    }

    // Enviar notificación al administrador
    async sendAdminNotification(orderData) {
        console.log('📧 Enviando notificación al admin...');
        
        try {
            const adminEmail = 'admin@empacame.com'; // Configurar email del admin
            const emailParams = this.formatAdminEmailParams(orderData);
            
            if (this.initialized) {
                const result = await this.sendWithEmailJS(this.config.adminTemplateId, emailParams);
                console.log('✅ Notificación enviada al admin');
                return result;
            } else {
                this.simulateEmailSend('admin', adminEmail, emailParams);
                return true;
            }
            
        } catch (error) {
            console.error('❌ Error enviando notificación al admin:', error);
            return false;
        }
    }

    // Enviar ambas notificaciones
    async sendOrderNotifications(orderData) {
        console.log('📧 Enviando notificaciones completas...');
        
        const results = await Promise.allSettled([
            this.sendOrderConfirmation(orderData),
            this.sendAdminNotification(orderData)
        ]);
        
        const customerResult = results[0].status === 'fulfilled' && results[0].value;
        const adminResult = results[1].status === 'fulfilled' && results[1].value;
        
        console.log('📊 Resultados de envío:', {
            cliente: customerResult ? '✅' : '❌',
            admin: adminResult ? '✅' : '❌'
        });
        
        return {
            customer: customerResult,
            admin: adminResult,
            success: customerResult || adminResult
        };
    }

    // Formatear parámetros para email del cliente
    formatOrderEmailParams(orderData, customerEmail) {
        const totals = orderData.totals || this.calculateTotals(orderData);
        const orderNumber = this.generateOrderNumber();
        
        return {
            to_email: customerEmail,
            customer_name: orderData.customerName || 'Cliente',
            order_number: orderNumber,
            order_date: new Date().toLocaleDateString('es-DO'),
            items_list: this.formatItemsList(orderData.items),
            subtotal: `$${totals.subtotal.toFixed(2)}`,
            shipping: `$${totals.shipping.toFixed(2)}`,
            total: `$${totals.total.toFixed(2)}`,
            shipping_address: orderData.shippingAddress || 'Por definir',
            tracking_url: `https://empacame.com/seguimiento?order=${orderNumber}`,
            support_email: 'soporte@empacame.com',
            support_phone: '849-449-6394'
        };
    }

    // Otros métodos auxiliares...
    extractCustomerEmail(orderData) {
        return orderData.customerEmail || 
               orderData.email || 
               orderData.customer?.email || 
               null;
    }

    calculateTotals(orderData) {
        if (!orderData.items) return { subtotal: 0, shipping: 5.99, total: 5.99 };
        
        const subtotal = orderData.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        const shipping = 5.99; // Envío fijo
        const total = subtotal + shipping;
        
        return { subtotal, shipping, total };
    }

    formatItemsList(items) {
        if (!items || !Array.isArray(items)) return 'Sin productos';
        
        return items.map(item => 
            `• ${item.name} - Cantidad: ${item.quantity} - Precio: $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
    }

    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `EMP-${timestamp}-${random}`;
    }

    simulateEmailSend(type, email, params) {
        console.log(`📧 [SIMULACIÓN] Email ${type} enviado a:`, email);
        console.log('📋 Contenido simulado:', {
            destinatario: email,
            asunto: type === 'admin' ? `Nuevo pedido ${params.order_number}` : `Confirmación pedido ${params.order_number}`,
            resumen: {
                pedido: params.order_number,
                total: params.total,
                productos: params.items_list?.split('\n').length || 0
            }
        });
    }
}

// Función para inicializar el sistema de emails
function initEmailSystem() {
    console.log('🚀 Iniciando sistema de notificaciones por email...');
    
    // Crear instancia global
    window.emailNotificationSystem = new EmailNotificationSystem();
    
    console.log('✅ Sistema de emails inicializado');
    return window.emailNotificationSystem;
}

// Auto-inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailSystem);
} else {
    initEmailSystem();
}

console.log('📧 Sistema de notificaciones por email cargado');
