// Sistema de Newsletter y Suscripciones para Empácame
// Mejora inspirada en el repositorio CodeIgniter

class NewsletterSystem {
    constructor() {
        this.subscribers = [];
        this.config = {
            storageKey: 'empacame_newsletter_subscribers',
            maxRetries: 3,
            retryDelay: 1000
        };
        
        this.loadSubscribers();
        this.init();
    }

    init() {
        console.log('📬 Inicializando sistema de newsletter...');
        this.createNewsletterComponents();
        this.bindEvents();
        console.log('✅ Sistema de newsletter listo');
    }

    // Crear componentes de newsletter en la página
    createNewsletterComponents() {
        // Agregar newsletter al footer si no existe
        this.addFooterNewsletter();
        
        // Crear popup de newsletter (opcional)
        this.createNewsletterPopup();
    }

    // Agregar newsletter al footer
    addFooterNewsletter() {
        const footer = document.querySelector('footer');
        if (footer && !document.querySelector('#newsletter-footer')) {
            const newsletterHTML = `
                <div id="newsletter-footer" class="bg-primary-900 py-8 mt-8">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-white mb-4">
                                📬 ¡Mantente al día con nuestras ofertas!
                            </h3>
                            <p class="text-primary-100 mb-6 max-w-2xl mx-auto">
                                Suscríbete a nuestro newsletter y recibe descuentos exclusivos, 
                                nuevos productos y tips para tu negocio.
                            </p>
                            <div class="max-w-md mx-auto flex gap-3">
                                <input 
                                    type="email" 
                                    id="newsletter-email" 
                                    placeholder="Tu email aquí..."
                                    class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                >
                                <button 
                                    id="newsletter-subscribe" 
                                    class="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                                >
                                    Suscribirse
                                </button>
                            </div>
                            <div id="newsletter-message" class="mt-4 text-sm"></div>
                            <p class="text-primary-200 text-xs mt-2">
                                No enviamos spam. Puedes cancelar tu suscripción en cualquier momento.
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            footer.insertAdjacentHTML('beforeend', newsletterHTML);
        }
    }

    // Crear popup de newsletter (aparece ocasionalmente)
    createNewsletterPopup() {
        // Solo mostrar popup si no se ha mostrado recientemente
        const lastShown = localStorage.getItem('newsletter_popup_last_shown');
        const now = Date.now();
        const daysSinceLastShown = lastShown ? (now - parseInt(lastShown)) / (1000 * 60 * 60 * 24) : 30;
        
        if (daysSinceLastShown < 7) return; // No mostrar si se mostró hace menos de 7 días
        
        const popupHTML = `
            <div id="newsletter-popup" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden">
                <div class="bg-white rounded-lg p-8 max-w-md mx-4 relative">
                    <button id="close-newsletter-popup" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                    
                    <div class="text-center">
                        <div class="text-4xl mb-4">📦✨</div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">
                            ¡Ofertas Exclusivas!
                        </h3>
                        <p class="text-gray-600 mb-6">
                            Únete a más de <span class="font-semibold text-primary-500" id="subscriber-count">500</span> 
                            emprendedores que reciben nuestras mejores ofertas.
                        </p>
                        
                        <div class="space-y-3 mb-6">
                            <input 
                                type="email" 
                                id="popup-newsletter-email" 
                                placeholder="Tu email empresarial..."
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                            <button 
                                id="popup-newsletter-subscribe" 
                                class="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
                            >
                                🎁 Quiero mis descuentos
                            </button>
                        </div>
                        
                        <div id="popup-newsletter-message" class="text-sm"></div>
                        
                        <p class="text-gray-400 text-xs mt-4">
                            Sin spam. Solo ofertas valiosas para tu negocio.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Mostrar popup después de un tiempo
        setTimeout(() => this.showNewsletterPopup(), 15000); // 15 segundos
    }

    // Mostrar popup de newsletter
    showNewsletterPopup() {
        const popup = document.getElementById('newsletter-popup');
        if (popup) {
            popup.classList.remove('hidden');
            localStorage.setItem('newsletter_popup_last_shown', Date.now().toString());
            
            // Actualizar contador de suscriptores
            const count = document.getElementById('subscriber-count');
            if (count) {
                count.textContent = this.getSubscriberCount();
            }
        }
    }

    // Vincular eventos
    bindEvents() {
        // Newsletter del footer
        const footerButton = document.getElementById('newsletter-subscribe');
        const footerEmail = document.getElementById('newsletter-email');
        
        if (footerButton && footerEmail) {
            footerButton.addEventListener('click', () => this.subscribe('footer'));
            footerEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.subscribe('footer');
            });
        }
        
        // Newsletter del popup
        const popupButton = document.getElementById('popup-newsletter-subscribe');
        const popupEmail = document.getElementById('popup-newsletter-email');
        const closeButton = document.getElementById('close-newsletter-popup');
        
        if (popupButton && popupEmail) {
            popupButton.addEventListener('click', () => this.subscribe('popup'));
            popupEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.subscribe('popup');
            });
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeNewsletterPopup());
        }
        
        // Cerrar popup al hacer click fuera
        const popup = document.getElementById('newsletter-popup');
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) this.closeNewsletterPopup();
            });
        }
    }

    // Suscribir email
    async subscribe(source = 'footer') {
        const emailId = source === 'popup' ? 'popup-newsletter-email' : 'newsletter-email';
        const messageId = source === 'popup' ? 'popup-newsletter-message' : 'newsletter-message';
        const buttonId = source === 'popup' ? 'popup-newsletter-subscribe' : 'newsletter-subscribe';
        
        const emailInput = document.getElementById(emailId);
        const messageDiv = document.getElementById(messageId);
        const button = document.getElementById(buttonId);
        
        if (!emailInput || !messageDiv || !button) return;
        
        const email = emailInput.value.trim();
        
        // Validar email
        if (!this.isValidEmail(email)) {
            this.showMessage(messageDiv, 'Por favor ingresa un email válido', 'error');
            return;
        }
        
        // Verificar si ya está suscrito
        if (this.isSubscribed(email)) {
            this.showMessage(messageDiv, '¡Ya estás suscrito! Gracias por tu interés', 'info');
            return;
        }
        
        // Mostrar estado de carga
        const originalText = button.textContent;
        button.textContent = 'Suscribiendo...';
        button.disabled = true;
        
        try {
            // Agregar suscriptor
            const subscriber = {
                email: email,
                subscribedAt: new Date().toISOString(),
                source: source,
                status: 'active',
                confirmed: false
            };
            
            this.subscribers.push(subscriber);
            this.saveSubscribers();
            
            // Enviar email de confirmación si el sistema está disponible
            if (window.emailNotificationSystem) {
                await window.emailNotificationSystem.sendNewsletterConfirmation(email);
            }
            
            this.showMessage(messageDiv, '¡Suscripción exitosa! Revisa tu email para confirmar', 'success');
            emailInput.value = '';
            
            // Cerrar popup si es exitoso
            if (source === 'popup') {
                setTimeout(() => this.closeNewsletterPopup(), 2000);
            }
            
            console.log('📬 Nueva suscripción:', email, 'desde:', source);
            
        } catch (error) {
            console.error('❌ Error en suscripción:', error);
            this.showMessage(messageDiv, 'Error al suscribirse. Intenta nuevamente', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Verificar si email ya está suscrito
    isSubscribed(email) {
        return this.subscribers.some(sub => 
            sub.email.toLowerCase() === email.toLowerCase() && 
            sub.status === 'active'
        );
    }

    // Mostrar mensaje
    showMessage(messageDiv, text, type) {
        const colors = {
            success: 'text-green-600',
            error: 'text-red-600',
            info: 'text-blue-600',
            warning: 'text-yellow-600'
        };
        
        messageDiv.className = colors[type] || 'text-gray-600';
        messageDiv.textContent = text;
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 5000);
    }

    // Cerrar popup de newsletter
    closeNewsletterPopup() {
        const popup = document.getElementById('newsletter-popup');
        if (popup) {
            popup.classList.add('hidden');
        }
    }

    // Obtener número de suscriptores
    getSubscriberCount() {
        const activeSubscribers = this.subscribers.filter(sub => sub.status === 'active').length;
        // Agregar un número base para que se vea más atractivo
        return activeSubscribers + 487; // Número base simulado
    }

    // Guardar suscriptores en localStorage
    saveSubscribers() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.subscribers));
        } catch (error) {
            console.error('Error guardando suscriptores:', error);
        }
    }

    // Cargar suscriptores desde localStorage
    loadSubscribers() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                this.subscribers = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando suscriptores:', error);
            this.subscribers = [];
        }
    }

    // Desuscribir email
    unsubscribe(email) {
        const index = this.subscribers.findIndex(sub => 
            sub.email.toLowerCase() === email.toLowerCase()
        );
        
        if (index !== -1) {
            this.subscribers[index].status = 'unsubscribed';
            this.subscribers[index].unsubscribedAt = new Date().toISOString();
            this.saveSubscribers();
            console.log('📬 Email desuscrito:', email);
            return true;
        }
        
        return false;
    }

    // Confirmar suscripción
    confirmSubscription(email) {
        const subscriber = this.subscribers.find(sub => 
            sub.email.toLowerCase() === email.toLowerCase()
        );
        
        if (subscriber) {
            subscriber.confirmed = true;
            subscriber.confirmedAt = new Date().toISOString();
            this.saveSubscribers();
            console.log('📬 Suscripción confirmada:', email);
            return true;
        }
        
        return false;
    }

    // Obtener estadísticas
    getStats() {
        const total = this.subscribers.length;
        const active = this.subscribers.filter(sub => sub.status === 'active').length;
        const confirmed = this.subscribers.filter(sub => sub.confirmed).length;
        const unsubscribed = this.subscribers.filter(sub => sub.status === 'unsubscribed').length;
        
        const sources = this.subscribers.reduce((acc, sub) => {
            acc[sub.source] = (acc[sub.source] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total,
            active,
            confirmed,
            unsubscribed,
            confirmationRate: total > 0 ? ((confirmed / total) * 100).toFixed(1) : 0,
            sources
        };
    }

    // Obtener suscriptores para exportar
    getSubscribersForExport() {
        return this.subscribers
            .filter(sub => sub.status === 'active' && sub.confirmed)
            .map(sub => ({
                email: sub.email,
                subscribedAt: sub.subscribedAt,
                source: sub.source
            }));
    }

    // Crear archivo CSV para descargar
    downloadSubscribersCSV() {
        const subscribers = this.getSubscribersForExport();
        const headers = ['Email', 'Fecha de Suscripción', 'Origen'];
        const csvContent = [
            headers.join(','),
            ...subscribers.map(sub => [
                sub.email,
                new Date(sub.subscribedAt).toLocaleDateString(),
                sub.source
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `empacame-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}

// Función para inicializar el sistema de newsletter
function initNewsletterSystem() {
    console.log('🚀 Iniciando sistema de newsletter...');
    
    // Crear instancia global
    window.newsletterSystem = new NewsletterSystem();
    
    console.log('✅ Sistema de newsletter inicializado');
    return window.newsletterSystem;
}

// Auto-inicializar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsletterSystem);
} else {
    initNewsletterSystem();
}

// Exportar para uso en consola de desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    window.newsletterAdmin = {
        stats: () => window.newsletterSystem?.getStats(),
        subscribers: () => window.newsletterSystem?.getSubscribersForExport(),
        download: () => window.newsletterSystem?.downloadSubscribersCSV(),
        unsubscribe: (email) => window.newsletterSystem?.unsubscribe(email),
        confirm: (email) => window.newsletterSystem?.confirmSubscription(email)
    };
    
    console.log('🔧 Admin de newsletter disponible: window.newsletterAdmin');
}
