/**
 * PAYMENT INTEGRATION
 * Integra el sistema modular de pagos con el carrito existente de Empácame
 * Mantiene compatibilidad total con cart-system.js
 */

class PaymentIntegration {
    constructor() {
        this.cart = null;
        this.paymentManager = null;
        this.isInitialized = false;
        this.paymentContainer = null;
    }

    /**
     * Inicializa la integración de pagos
     */
    async initialize() {
        try {
            console.log('🔗 Inicializando integración de pagos');
            
            // Agregar estilos CSS primero
            this.addIntegrationStyles();
            
            // Esperar a que el carrito esté disponible
            await this.waitForCart();
            
            // Inicializar Payment Manager
            await this.initializePaymentManager();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Modificar el checkout del carrito existente
            this.enhanceCartCheckout();
            
            this.isInitialized = true;
            console.log('✅ Integración de pagos inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando integración de pagos:', error);
            throw error;
        }
    }

    /**
     * Espera a que el carrito esté disponible
     */
    async waitForCart() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo
            
            const checkForCart = () => {
                if (window.empacameCart && window.empacameCart instanceof EmpacameCart) {
                    this.cart = window.empacameCart;
                    console.log('✅ Carrito encontrado');
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkForCart, 100);
                } else {
                    reject(new Error('Carrito no encontrado después de 5 segundos'));
                }
            };
            
            checkForCart();
        });
    }

    /**
     * Inicializa el Payment Manager
     */
    async initializePaymentManager() {
        if (!window.PaymentManager) {
            throw new Error('PaymentManager no está disponible');
        }
        
        this.paymentManager = window.PaymentManager;
        
        // Configurar PayPal con client ID real
        // IMPORTANTE: Reemplazar con tu client ID real de PayPal
        const config = { ...PaymentConfig };
        config.processors.paypal.config.clientId.production = 'YOUR_PAYPAL_CLIENT_ID_HERE';
        config.processors.paypal.config.clientId.sandbox = 'YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE';
        
        await this.paymentManager.initialize(config);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Escuchar eventos de pago exitoso
        document.addEventListener('empacamePaymentSuccess', (event) => {
            this.handlePaymentSuccess(event.detail);
        });

        // Escuchar eventos de error de pago
        document.addEventListener('empacamePaymentError', (event) => {
            this.handlePaymentError(event.detail);
        });

        // Escuchar eventos de cancelación de pago
        document.addEventListener('empacamePaymentCancel', (event) => {
            this.handlePaymentCancel(event.detail);
        });

        // Escuchar apertura/cierre del carrito
        document.addEventListener('cartOpened', () => {
            this.onCartOpened();
        });

        document.addEventListener('cartClosed', () => {
            this.onCartClosed();
        });
    }

    /**
     * Mejora el checkout del carrito existente
     */
    enhanceCartCheckout() {
        // Verificar qué métodos de checkout tiene el carrito
        console.log('🔍 Verificando métodos del carrito disponibles...');
        console.log('Tiene checkout:', typeof this.cart.checkout);
        console.log('Tiene proceedToCheckout:', typeof this.cart.proceedToCheckout);
        console.log('Tiene showCheckoutForm:', typeof this.cart.showCheckoutForm);
        
        // Interceptar el método de checkout del carrito (si existe)
        if (this.cart.checkout && typeof this.cart.checkout === 'function') {
            const originalCheckout = this.cart.checkout.bind(this.cart);
            
            this.cart.checkout = async (customerData) => {
                console.log('🛒 Iniciando checkout mejorado (método checkout)');
                
                try {
                    // Validar que hay items en el carrito
                    if (this.cart.items.length === 0) {
                        throw new Error('El carrito está vacío');
                    }
                    
                    // Mostrar interfaz de pagos en lugar del checkout original
                    await this.showPaymentInterface(customerData);
                    
                } catch (error) {
                    console.error('❌ Error en checkout mejorado:', error);
                    // Fallback al checkout original si hay error
                    originalCheckout(customerData);
                }
            };
        }

        // Interceptar proceedToCheckout si existe
        if (this.cart.proceedToCheckout && typeof this.cart.proceedToCheckout === 'function') {
            const originalProceedToCheckout = this.cart.proceedToCheckout.bind(this.cart);
            
            this.cart.proceedToCheckout = async () => {
                console.log('🛒 Iniciando checkout mejorado (método proceedToCheckout)');
                
                try {
                    // Validar que hay items en el carrito
                    if (this.cart.items.length === 0) {
                        alert('El carrito está vacío');
                        return;
                    }
                    
                    // Mostrar nuestro formulario de checkout mejorado
                    this.showEnhancedCheckoutForm();
                    
                } catch (error) {
                    console.error('❌ Error en checkout mejorado:', error);
                    // Fallback al checkout original si hay error
                    originalProceedToCheckout();
                }
            };
        }

        // También interceptar el método showCheckoutForm si existe
        if (this.cart.showCheckoutForm && typeof this.cart.showCheckoutForm === 'function') {
            const originalShowCheckoutForm = this.cart.showCheckoutForm.bind(this.cart);
            
            this.cart.showCheckoutForm = () => {
                console.log('🛒 Mostrando formulario de checkout mejorado');
                // En lugar de mostrar el formulario original, mostrar nuestra interfaz
                this.showEnhancedCheckoutForm();
            };
        }
        
        console.log('✅ Checkout del carrito mejorado exitosamente');
    }

    /**
     * Muestra la interfaz de pagos mejorada
     */
    async showPaymentInterface(customerData = {}) {
        try {
            console.log('💳 Mostrando interfaz de pagos');
            
            // Obtener datos del carrito
            const cartData = this.getCartData();
            
            // Preparar datos de la orden
            const orderData = this.prepareOrderData(cartData, customerData);
            
            // Encontrar o crear contenedor de pagos
            const container = this.getOrCreatePaymentContainer();
            
            // Renderizar interfaz de pagos
            await this.paymentManager.renderPaymentInterface(container, orderData);
            
            // Mostrar el contenedor
            this.showPaymentContainer();
            
        } catch (error) {
            console.error('❌ Error mostrando interfaz de pagos:', error);
            this.showError('Error cargando opciones de pago. Por favor, intenta nuevamente.');
        }
    }

    /**
     * Muestra formulario de checkout mejorado
     */
    showEnhancedCheckoutForm() {
        console.log('🎨 Mostrando formulario de checkout mejorado');
        
        // Buscar contenedor del carrito de diferentes formas
        let cartContent = null;
        
        // Método 1: Usar cartElement del carrito
        if (this.cart.cartElement) {
            cartContent = this.cart.cartElement.querySelector('.cart-content');
        }
        
        // Método 2: Buscar por ID
        if (!cartContent) {
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar) {
                cartContent = cartSidebar.querySelector('.cart-content');
            }
        }
        
        // Método 3: Buscar por clase
        if (!cartContent) {
            cartContent = document.querySelector('.cart-content');
        }
        
        // Método 4: Crear contenedor temporal con overlay
        if (!cartContent) {
            console.warn('⚠️ No se encontró contenedor del carrito, creando temporal');
            
            // Crear overlay de fondo
            const overlay = document.createElement('div');
            overlay.id = 'checkout-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(2px);
            `;
            
            cartContent = document.createElement('div');
            cartContent.className = 'cart-content-temp';
            cartContent.style.cssText = `
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.25);
                position: relative;
            `;
            
            overlay.appendChild(cartContent);
            document.body.appendChild(overlay);
            
            // Cerrar al hacer click en el overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    if (window.empacameCart && window.empacameCart.restoreCartView) {
                        window.empacameCart.restoreCartView();
                    }
                }
            });
        }
        
        if (!cartContent) {
            console.error('❌ No se pudo encontrar o crear contenedor para checkout');
            // Fallback: usar alert
            alert('Sistema de pago cargado. Refresh la página si hay problemas.');
            return;
        }
        
        cartContent.innerHTML = `
            <div class="enhanced-checkout-form">
                <div class="checkout-header">
                    <h3>Finalizar compra</h3>
                    <button class="back-to-cart" onclick="window.empacameCart.restoreCartView()">
                        ← Volver al carrito
                    </button>
                </div>
                
                <div class="checkout-steps">
                    <div class="step active" data-step="1">
                        <span class="step-number">1</span>
                        <span>Información</span>
                    </div>
                    <div class="step" data-step="2">
                        <span class="step-number">2</span>
                        <span>Pago</span>
                    </div>
                    <div class="step" data-step="3">
                        <span class="step-number">3</span>
                        <span>Confirmación</span>
                    </div>
                </div>
                
                <form id="customer-info-form" class="customer-form">
                    <div class="form-group">
                        <label for="customer-name">Nombre completo*</label>
                        <input type="text" id="customer-name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-email">Email*</label>
                        <input type="email" id="customer-email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-phone">Teléfono*</label>
                        <input type="tel" id="customer-phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-address">Dirección de envío*</label>
                        <textarea id="customer-address" name="address" required 
                                  placeholder="Calle, número, sector, ciudad"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customer-city">Ciudad</label>
                            <input type="text" id="customer-city" name="city" value="Santo Domingo">
                        </div>
                        <div class="form-group">
                            <label for="customer-postal">Código Postal</label>
                            <input type="text" id="customer-postal" name="postalCode" value="10000">
                        </div>
                    </div>
                    
                    <button type="submit" class="proceed-to-payment">
                        Proceder al pago →
                    </button>
                </form>
                
                <div id="payment-interface-container" class="payment-step" style="display: none;">
                    <!-- La interfaz de pagos se renderizará aquí -->
                </div>
            </div>
        `;

        // Agregar event listener al formulario
        const form = document.getElementById('customer-info-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.proceedToPayment(form);
        });
    }

    /**
     * Procede al paso de pago
     */
    async proceedToPayment(form) {
        try {
            // Validar formulario
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Obtener datos del cliente
            const formData = new FormData(form);
            const customerData = Object.fromEntries(formData.entries());

            // Actualizar pasos
            this.updateCheckoutStep(2);

            // Ocultar formulario y mostrar pagos
            form.style.display = 'none';
            const paymentContainer = document.getElementById('payment-interface-container');
            paymentContainer.style.display = 'block';

            // Mostrar interfaz de pagos
            await this.showPaymentInterface(customerData);

        } catch (error) {
            console.error('❌ Error procediendo al pago:', error);
            this.showError('Error procediendo al pago. Por favor, intenta nuevamente.');
        }
    }

    /**
     * Actualiza el paso del checkout
     */
    updateCheckoutStep(stepNumber) {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= stepNumber);
            step.classList.toggle('completed', index + 1 < stepNumber);
        });
    }

    /**
     * Obtiene datos del carrito
     */
    getCartData() {
        return {
            items: this.cart.items.map(item => ({
                id: item.id,
                name: item.productName || item.name,
                subtitle: item.subtitle,
                quantity: item.quantity,
                price: item.unitPrice,
                total: (item.unitPrice * item.quantity / item.originalQuantity)
            })),
            subtotal: this.cart.getSubtotal(),
            shipping: this.cart.getShipping(),
            total: this.cart.getTotal()
        };
    }

    /**
     * Prepara datos de la orden para el payment manager
     */
    prepareOrderData(cartData, customerData) {
        return {
            orderId: PaymentFormatting.generateOrderId(),
            amount: cartData.total,
            currency: 'USD',
            items: cartData.items,
            subtotal: cartData.subtotal,
            shipping: cartData.shipping,
            customer: {
                name: customerData.name || '',
                email: customerData.email || '',
                phone: customerData.phone || '',
                address: customerData.address || '',
                city: customerData.city || 'Santo Domingo',
                state: customerData.state || 'Nacional',
                postalCode: customerData.postalCode || '10000',
                country: 'DO'
            },
            metadata: {
                source: 'empacame_cart',
                timestamp: new Date().toISOString(),
                cartVersion: '1.0',
                userAgent: navigator.userAgent
            }
        };
    }

    /**
     * Obtiene o crea el contenedor de pagos
     */
    getOrCreatePaymentContainer() {
        let container = document.getElementById('payment-interface-container');
        
        if (!container) {
            // Si estamos en el checkout form, usar ese contenedor
            container = document.querySelector('.enhanced-checkout-form #payment-interface-container');
        }
        
        if (!container) {
            // Crear contenedor en el carrito
            const cartContent = this.cart.cartElement.querySelector('.cart-content');
            container = document.createElement('div');
            container.id = 'payment-interface-container';
            container.className = 'payment-interface-container';
            cartContent.appendChild(container);
        }
        
        this.paymentContainer = container;
        return container;
    }

    /**
     * Muestra el contenedor de pagos
     */
    showPaymentContainer() {
        if (this.paymentContainer) {
            this.paymentContainer.style.display = 'block';
            this.paymentContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Maneja pago exitoso
     */
    handlePaymentSuccess(result) {
        console.log('✅ Pago exitoso en integración:', result);
        
        // Actualizar paso a confirmación
        this.updateCheckoutStep(3);
        
        // Mostrar confirmación
        this.showPaymentConfirmation(result);
        
        // Limpiar carrito
        this.cart.clearCart();
        
        // Enviar confirmación por email (simulado)
        this.sendConfirmationEmail(result);
    }

    /**
     * Maneja error de pago
     */
    handlePaymentError(error) {
        console.error('❌ Error de pago en integración:', error);
        this.showError(`Error en el pago: ${error.message}`);
    }

    /**
     * Muestra error al usuario
     */
    showError(message) {
        console.error('💥 Error:', message);
        
        // Intentar mostrar en el contenedor de pagos si existe
        if (this.paymentContainer) {
            this.paymentContainer.innerHTML = `
                <div class="payment-error">
                    <div class="error-icon">⚠️</div>
                    <h3>Error en el pago</h3>
                    <p>${message}</p>
                    <button onclick="this.closest('.payment-error').remove()" class="btn-close-error">
                        Cerrar
                    </button>
                </div>
            `;
        } else {
            // Fallback: usar alert
            alert(`Error: ${message}`);
        }
        
        // También mostrar en notificación del carrito si está disponible
        const notification = document.getElementById('cartNotification');
        const notificationText = document.getElementById('notificationText');
        
        if (notification && notificationText) {
            notification.style.background = '#ef4444';
            notificationText.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
                notification.style.background = '#10b981'; // Restaurar color original
            }, 5000);
        }
    }

    /**
     * Maneja cancelación de pago
     */
    handlePaymentCancel(data) {
        console.log('⚠️ Pago cancelado en integración:', data);
        this.showError('Pago cancelado. Puedes intentar nuevamente cuando desees.');
    }

    /**
     * Muestra confirmación de pago
     */
    showPaymentConfirmation(result) {
        if (this.paymentContainer) {
            this.paymentContainer.innerHTML = `
                <div class="payment-confirmation">
                    <div class="confirmation-icon">🎉</div>
                    <h2>¡Compra confirmada!</h2>
                    <p>Tu pedido ha sido procesado exitosamente.</p>
                    
                    <div class="order-details">
                        <h4>Detalles del pedido:</h4>
                        <p><strong>ID de transacción:</strong> ${result.transactionId}</p>
                        <p><strong>ID de orden:</strong> ${result.orderId}</p>
                        <p><strong>Monto:</strong> ${PaymentFormatting.formatMoney(result.amount, result.currency)}</p>
                        <p><strong>Procesador:</strong> ${result.processor.toUpperCase()}</p>
                    </div>
                    
                    <div class="next-steps">
                        <h4>¿Qué sigue?</h4>
                        <ul>
                            <li>✅ Recibirás un email de confirmación</li>
                            <li>📦 Tu pedido será preparado en 1-2 días hábiles</li>
                            <li>🚚 El envío llegará en 2-5 días hábiles</li>
                            <li>📞 Te contactaremos si necesitamos aclarar algo</li>
                        </ul>
                    </div>
                    
                    <div class="confirmation-actions">
                        <button onclick="empacameCart.closeCart()" class="continue-shopping">
                            Continuar comprando
                        </button>
                        <button onclick="window.print()" class="print-receipt">
                            Imprimir recibo
                        </button>
                    </div>
                </div>
            `;
        }
    }
    /**
     * Obtiene el estado de la integración
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            cartAvailable: !!this.cart,
            paymentManagerAvailable: !!this.paymentManager,
            paymentManagerInitialized: this.paymentManager?.isInitialized || false,
            activeProcessor: this.paymentManager?.activeProcessor || null,
            containerExists: !!this.paymentContainer
        };
    }

    /**
     * Reinicia la integración
     */
    async reset() {
        console.log('🔄 Reiniciando integración de pagos');
        
        try {
            // Limpiar estado actual
            this.cleanup();
            
            // Reinicializar
            await this.initialize();
            
            console.log('✅ Integración reiniciada correctamente');
            
        } catch (error) {
            console.error('❌ Error reiniciando integración:', error);
            throw error;
        }
    }

    /**
     * Limpia la integración
     */
    cleanup() {
        console.log('🧹 Limpiando integración de pagos');
        
        // Limpiar payment manager
        if (this.paymentManager) {
            this.paymentManager.cleanup();
        }
        
        // Limpiar contenedores
        if (this.paymentContainer) {
            this.paymentContainer.innerHTML = '';
            this.paymentContainer.style.display = 'none';
        }
        
        // Resetear propiedades
        this.cart = null;
        this.paymentManager = null;
        this.paymentContainer = null;
        this.isInitialized = false;
    }

    /**
     * Agrega estilos CSS específicos para la integración
     */
    addIntegrationStyles() {
        const styleId = 'payment-integration-styles';
        
        // Evitar duplicados
        if (document.getElementById(styleId)) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            /* Estilos específicos para la integración de pagos */
            .enhanced-checkout-form {
                padding: 20px;
                max-width: 500px;
                margin: 0 auto;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: white;
                border-radius: 12px;
            }
            
            .checkout-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .checkout-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .back-to-cart {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 0.9rem;
                padding: 8px 12px;
                border-radius: 6px;
                transition: all 0.2s;
                text-decoration: none;
            }
            
            .back-to-cart:hover {
                color: #FF8C00;
                background: #fff7ed;
            }
            
            .checkout-steps {
                display: flex;
                justify-content: center;
                margin-bottom: 30px;
                position: relative;
            }
            
            .checkout-steps::before {
                content: '';
                position: absolute;
                top: 15px;
                left: 25%;
                right: 25%;
                height: 2px;
                background: #e5e7eb;
                z-index: 1;
            }
            
            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                z-index: 2;
                background: white;
                padding: 0 15px;
            }
            
            .step-number {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #e5e7eb;
                color: #6b7280;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.9rem;
                margin-bottom: 8px;
                transition: all 0.3s;
            }
            
            .step.active .step-number {
                background: #FF8C00;
                color: white;
            }
            
            .step.completed .step-number {
                background: #00B96B;
                color: white;
            }
            
            .step span:last-child {
                font-size: 0.8rem;
                color: #6b7280;
                font-weight: 500;
            }
            
            .step.active span:last-child {
                color: #FF8C00;
            }
            
            .customer-form {
                space-y: 16px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            
            .form-group label {
                display: block;
                font-weight: 500;
                color: #374151;
                margin-bottom: 6px;
                font-size: 0.9rem;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.95rem;
                transition: border-color 0.2s;
                box-sizing: border-box;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #FF8C00;
                box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
            }
            
            .form-group textarea {
                min-height: 80px;
                resize: vertical;
            }
            
            .proceed-to-payment {
                width: 100%;
                background: #FF8C00;
                color: white;
                border: none;
                padding: 14px 20px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 20px;
            }
            
            .proceed-to-payment:hover {
                background: #e07a00;
                transform: translateY(-1px);
                box-shadow: 0 4px 6px -1px rgba(255, 140, 0, 0.3);
            }
            
            .payment-confirmation {
                text-align: center;
                padding: 40px 20px;
                background: #f0fdf4;
                border-radius: 12px;
                border: 2px solid #00B96B;
            }
            
            .confirmation-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            
            .payment-confirmation h2 {
                color: #166534;
                margin: 0 0 10px 0;
                font-size: 1.75rem;
            }
            
            .payment-confirmation > p {
                color: #166534;
                margin: 0 0 30px 0;
                font-size: 1.1rem;
            }
            
            .order-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: left;
            }
            
            .order-details h4 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 1.1rem;
            }
            
            /* Mejoras adicionales para contenedor temporal */
            .cart-content-temp {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
            
            .cart-content-temp * {
                box-sizing: border-box;
            }
            
            /* Overlay de checkout */
            #checkout-overlay {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
            
            /* Mejoras para formulario */
            .enhanced-checkout-form h3 {
                font-family: inherit !important;
            }
            
            .enhanced-checkout-form input,
            .enhanced-checkout-form textarea,
            .enhanced-checkout-form button {
                font-family: inherit !important;
            }
            
            /* Responsivo */
            @media (max-width: 640px) {
                .enhanced-checkout-form {
                    padding: 15px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .checkout-header h3 {
                    font-size: 1.25rem;
                }
            }
            
            .order-details p {
                margin: 8px 0;
                color: #374151;
                font-size: 0.95rem;
            }
            
            .next-steps {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: left;
            }
            
            .next-steps h4 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 1.1rem;
            }
            
            .next-steps ul {
                margin: 0;
                padding-left: 0;
                list-style: none;
            }
            
            .next-steps li {
                margin: 10px 0;
                color: #374151;
                font-size: 0.95rem;
                padding-left: 25px;
                position: relative;
            }
            
            .confirmation-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 30px;
            }
            
            .continue-shopping,
            .print-receipt {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                display: inline-block;
            }
            
            .continue-shopping {
                background: #FF8C00;
                color: white;
                border: none;
            }
            
            .continue-shopping:hover {
                background: #e07a00;
                transform: translateY(-1px);
            }
            
            .print-receipt {
                background: white;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .print-receipt:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .payment-integration-error {
                text-align: center;
                padding: 40px 20px;
                background: #fef2f2;
                border-radius: 12px;
                border: 2px solid #FF4757;
            }
            
            .payment-integration-error .error-icon {
                font-size: 3rem;
                margin-bottom: 20px;
            }
            
            .payment-integration-error h3 {
                color: #991b1b;
                margin: 0 0 10px 0;
                font-size: 1.5rem;
            }
            
            .payment-integration-error p {
                color: #991b1b;
                margin: 0 0 25px 0;
                font-size: 1rem;
            }
            
            .error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .error-actions .retry-button,
            .error-actions .back-button {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }
            
            .error-actions .retry-button {
                background: #FF8C00;
                color: white;
            }
            
            .error-actions .retry-button:hover {
                background: #e07a00;
            }
            
            .error-actions .back-button {
                background: #6b7280;
                color: white;
            }
            
            .error-actions .back-button:hover {
                background: #4b5563;
            }
            
            /* Responsive para móviles */
            @media (max-width: 768px) {
                .enhanced-checkout-form {
                    padding: 16px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
                .checkout-steps {
                    margin-bottom: 20px;
                }
                
                .step span:last-child {
                    font-size: 0.75rem;
                }
                
                .confirmation-actions {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .continue-shopping,
                .print-receipt {
                    width: 100%;
                    text-align: center;
                }
                
                .error-actions {
                    flex-direction: column;
                    align-items: stretch;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Habilita modo debug
     */
    enableDebugMode() {
        console.log('🐛 Habilitando modo debug para integración');
        
        this.debugMode = true;
        
        // Habilitar debug en payment manager
        if (this.paymentManager && this.paymentManager.enableDebugMode) {
            this.paymentManager.enableDebugMode();
        }
        
        // Mostrar información de debug específica de la integración
        this.showIntegrationDebugInfo();
    }

    /**
     * Muestra información de debug de la integración
     */
    showIntegrationDebugInfo() {
        const debugInfo = document.createElement('div');
        debugInfo.id = 'payment-integration-debug';
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10001;
            max-width: 350px;
        `;
        
        const status = this.getStatus();
        
        debugInfo.innerHTML = `
            <strong>🔗 Payment Integration Debug</strong><br>
            <hr style="margin: 10px 0;">
            <strong>Estado de Integración:</strong><br>
            • Inicializada: ${status.isInitialized}<br>
            • Carrito disponible: ${status.cartAvailable}<br>
            • Payment Manager: ${status.paymentManagerAvailable}<br>
            • PM Inicializado: ${status.paymentManagerInitialized}<br>
            • Procesador activo: ${status.activeProcessor || 'Ninguno'}<br>
            • Contenedor existe: ${status.containerExists}<br>
            <br>
            <strong>Carrito:</strong><br>
            • Items: ${this.cart?.items.length || 0}<br>
            • Total: $${this.cart?.getSubtotal()?.toFixed(2) || '0.00'}<br>
            <br>
            <button onclick="document.getElementById('payment-integration-debug').remove()" 
                    style="background: #ff4757; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                Cerrar
            </button>
        `;
        
        document.body.appendChild(debugInfo);
        
        // Auto-actualizar cada 5 segundos
        if (this.debugMode) {
            this.debugInterval = setInterval(() => {
                if (document.getElementById('payment-integration-debug')) {
                    this.showIntegrationDebugInfo();
                }
            }, 5000);
        }
    }

    /**
     * Método público para procesar checkout (usado por cart-system.js)
     */
    async processCheckout() {
        console.log('🚀 PaymentIntegration.processCheckout() llamado');
        
        try {
            // Asegurar que los estilos estén cargados
            this.addIntegrationStyles();
            
            // Verificar que el sistema esté inicializado
            if (!this.isInitialized) {
                console.log('🔄 Sistema no inicializado, inicializando...');
                await this.initialize();
            }
            
            // Mostrar formulario de checkout mejorado
            this.showEnhancedCheckoutForm();
            
        } catch (error) {
            console.error('❌ Error en processCheckout:', error);
            throw error;
        }
    }
}

// Crear instancia global de integración
const paymentIntegration = new PaymentIntegration();

// Hacer disponible globalmente la CLASE, no la instancia
if (typeof window !== 'undefined') {
    window.PaymentIntegration = PaymentIntegration;
}

// También crear una instancia global para compatibilidad
if (typeof window !== 'undefined') {
    window.paymentIntegration = paymentIntegration;
}

// NOTA: La auto-inicialización ahora se maneja por PaymentSystemInitializer
// Auto-inicializar cuando el DOM esté listo
/*
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Iniciando auto-inicialización de Payment Integration');
        
        // Agregar estilos de integración
        paymentIntegration.addIntegrationStyles();
        
        // Esperar un poco para que el carrito se inicialice
        setTimeout(async () => {
            try {
                await paymentIntegration.initialize();
                console.log('✅ Payment Integration auto-inicializada correctamente');
            } catch (error) {
                console.warn('⚠️ No se pudo auto-inicializar Payment Integration:', error.message);
                console.log('🔄 Se intentará nuevamente cuando se detecte el carrito');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error en auto-inicialización:', error);
    }
});
*/

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentIntegration;
}
