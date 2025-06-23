/**
 * EMPÁCAME CART INTEGRATION
 * Integración del carrito con los botones existentes de la landing page
 */

// Función para convertir botones de WhatsApp a botones de carrito
function initializeCartIntegration() {
    console.log('🚀 Inicializando integración del carrito Empácame...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCartIntegration);
    } else {
        setupCartIntegration();
    }
}

function setupCartIntegration() {
    // Convertir todos los botones de compra WhatsApp a botones de carrito
    convertWhatsAppButtons();
    
    // Agregar funcionalidad a los botones de filtros
    enhanceFilterButtons();
    
    // Mejorar la experiencia de los botones principales del hero
    enhanceHeroButtons();
    
    console.log('✅ Integración del carrito completada');
}

function convertWhatsAppButtons() {
    const whatsappButtons = document.querySelectorAll('a[href*="wa.me"]');
    
    whatsappButtons.forEach(button => {
        // Extraer información del producto del href
        const href = button.getAttribute('href');
        const productInfo = extractProductInfoFromWhatsApp(href);
        
        if (productInfo) {
            // Crear nuevo botón de carrito
            const cartButton = createCartButton(productInfo, button);
            
            // Reemplazar el botón original
            button.parentNode.insertBefore(cartButton, button);
            button.style.display = 'none'; // Mantener como fallback
            
            // Agregar botón de WhatsApp como opción secundaria
            addWhatsAppOption(cartButton, button);
        }
    });
}

function extractProductInfoFromWhatsApp(href) {
    try {
        // Decodificar el mensaje de WhatsApp
        const url = new URL(href);
        const message = decodeURIComponent(url.searchParams.get('text') || '');
        
        // Extraer información usando regex
        const patterns = {
            size: /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i,
            quantity: /(\d+)\s*unidades/i,
            price: /\$?(\d+(?:\.\d+)?)/
        };
        
        const sizeMatch = message.match(patterns.size);
        const quantityMatch = message.match(patterns.quantity);
        const priceMatch = message.match(patterns.price);
        
        if (sizeMatch && quantityMatch && priceMatch) {
            const sizeKey = `${sizeMatch[1]}x${sizeMatch[2]}`;
            const quantity = parseInt(quantityMatch[1]);
            const price = parseFloat(priceMatch[1]);
            
            return {
                sizeKey,
                quantity,
                price,
                originalMessage: message
            };
        }
    } catch (error) {
        console.warn('Error extrayendo información del producto:', error);
    }
    
    return null;
}

function createCartButton(productInfo, originalButton) {
    const cartButton = document.createElement('div');
    cartButton.className = 'cart-button-container';
    
    cartButton.innerHTML = `
        <button class="btn-price add-to-cart-btn" onclick="addToCartWithFeedback('${productInfo.sizeKey}', ${productInfo.quantity}, this)">
            <i class="fas fa-cart-plus"></i>
            Agregar al Carrito
        </button>
        <div class="button-options">
            <button class="btn-whatsapp-alt" onclick="openWhatsAppFallback(this)" title="Pedir por WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </button>
        </div>
    `;
    
    return cartButton;
}

function addWhatsAppOption(cartButton, originalButton) {
    const whatsappAlt = cartButton.querySelector('.btn-whatsapp-alt');
    whatsappAlt.onclick = () => {
        originalButton.click();
    };
}

// Función global para agregar al carrito con feedback visual
window.addToCartWithFeedback = function(sizeKey, quantity, buttonElement) {
    // Agregar clase de loading
    buttonElement.classList.add('loading');
    buttonElement.disabled = true;
    
    // Simular delay de red (opcional, se puede remover en producción)
    setTimeout(() => {
        // Agregar al carrito
        const success = window.empacameCart.addToCart(sizeKey, quantity);
        
        if (success) {
            // Feedback de éxito
            showSuccessFeedback(buttonElement);
            
            // Hacer que el botón del carrito pulse
            const cartButton = document.getElementById('cartButton');
            if (cartButton) {
                cartButton.classList.add('pulse');
                setTimeout(() => cartButton.classList.remove('pulse'), 1500);
            }
        } else {
            showErrorFeedback(buttonElement);
        }
        
        // Restaurar botón
        buttonElement.classList.remove('loading');
        buttonElement.disabled = false;
    }, 500);
};

function showSuccessFeedback(buttonElement) {
    const originalContent = buttonElement.innerHTML;
    
    buttonElement.innerHTML = `
        <i class="fas fa-check success-checkmark"></i>
        ¡Agregado!
    `;
    buttonElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.style.background = '';
    }, 2000);
}

function showErrorFeedback(buttonElement) {
    const originalContent = buttonElement.innerHTML;
    
    buttonElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        Error
    `;
    buttonElement.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    
    setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.style.background = '';
    }, 2000);
}

// Función global para abrir WhatsApp como fallback
window.openWhatsAppFallback = function(buttonElement) {
    // Encontrar el botón original de WhatsApp
    const container = buttonElement.closest('.cart-button-container');
    const originalButton = container.nextElementSibling;
    
    if (originalButton && originalButton.href) {
        window.open(originalButton.href, '_blank');
    }
};

function enhanceFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Agregar animación suave al cambiar filtros
            const pricingGroups = document.querySelector('.pricing-groups');
            if (pricingGroups) {
                pricingGroups.style.opacity = '0.7';
                setTimeout(() => {
                    pricingGroups.style.opacity = '1';
                }, 300);
            }
        });
    });
}

function enhanceHeroButtons() {
    // Mejorar los botones principales del hero
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    
    heroButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Agregar efecto de ripple
            createRippleEffect(e, button);
        });
    });
}

function createRippleEffect(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    // Agregar animación CSS si no existe
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Función para añadir estilos adicionales necesarios
function addIntegrationStyles() {
    const styles = `
        <style id="cart-integration-styles">
            .cart-button-container {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
            }
            
            .add-to-cart-btn {
                flex: 1;
                min-width: 0;
            }
            
            .button-options {
                display: flex;
                gap: 4px;
            }
            
            .btn-whatsapp-alt {
                background: #25d366;
                color: white;
                border: none;
                border-radius: 8px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1.1rem;
            }
            
            .btn-whatsapp-alt:hover {
                background: #20b354;
                transform: scale(1.05);
            }
            
            .price-option {
                position: relative;
            }
            
            .price-option .btn-price[style*="display: none"] + .cart-button-container {
                width: 100%;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .cart-button-container {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .button-options {
                    width: 100%;
                    justify-content: center;
                }
                
                .btn-whatsapp-alt {
                    width: 100%;
                    height: 36px;
                    border-radius: 6px;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Función para manejar productos con múltiples opciones
function handleMultipleProductOptions() {
    // Para productos con múltiples tamaños como 10x13
    const multiOptionProducts = document.querySelectorAll('.size-group[data-category]');
    
    multiOptionProducts.forEach(productGroup => {
        const priceOptions = productGroup.querySelectorAll('.price-option');
        
        if (priceOptions.length > 2) {
            // Agregar selector de cantidad personalizada para productos con muchas opciones
            addCustomQuantitySelector(productGroup);
        }
    });
}

function addCustomQuantitySelector(productGroup) {
    const customSelector = document.createElement('div');
    customSelector.className = 'custom-quantity-selector';
    customSelector.innerHTML = `
        <div class="custom-quantity-header">
            <h4>¿Cantidad personalizada?</h4>
            <p>Contáctanos para cotización especial</p>
        </div>
        <div class="custom-quantity-form">
            <input type="number" min="1" placeholder="Cantidad deseada" class="custom-quantity-input">
            <button type="button" class="btn-custom-quote" onclick="requestCustomQuote(this)">
                <i class="fas fa-calculator"></i>
                Cotizar
            </button>
        </div>
    `;
    
    productGroup.appendChild(customSelector);
}

// Función global para cotizaciones personalizadas
window.requestCustomQuote = function(buttonElement) {
    const input = buttonElement.parentElement.querySelector('.custom-quantity-input');
    const quantity = input.value;
    const productGroup = buttonElement.closest('.size-group');
    const productTitle = productGroup.querySelector('.size-info h3').textContent;
    
    if (quantity && quantity > 0) {
        const message = `Hola, quisiera una cotización personalizada para ${quantity} unidades de ${productTitle}. ¿Pueden ayudarme con el precio?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/18494496394?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    } else {
        alert('Por favor ingresa una cantidad válida');
        input.focus();
    }
};

// Analytics y tracking de eventos (preparación para futuro)
function trackCartEvent(eventName, productInfo) {
    // Preparado para Google Analytics, Facebook Pixel, etc.
    console.log(`📊 Evento: ${eventName}`, productInfo);
    
    // Ejemplo para Google Analytics (cuando se implemente)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'custom_parameter': productInfo
        });
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Agregar estilos de integración
    addIntegrationStyles();
    
    // Esperar un poco para que se carguen otros scripts
    setTimeout(() => {
        initializeCartIntegration();
        handleMultipleProductOptions();
    }, 500);
});

// Exponer funciones globales necesarias
window.empacameCartIntegration = {
    addToCartWithFeedback,
    openWhatsAppFallback,
    requestCustomQuote,
    trackCartEvent
};

console.log('🛒 Sistema de integración de carrito Empácame cargado');