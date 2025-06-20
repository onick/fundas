// ========================================
// SCROLL ANIMATIONS ENHANCED - EMPÁCAME
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initEnhancedScrollAnimations();
});

function initEnhancedScrollAnimations() {
    // Detectar si es dispositivo móvil
    const isMobile = window.innerWidth <= 768;
    
    if ('IntersectionObserver' in window) {
        
        // Observador específico para tarjetas informativas
        const infoCardsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry, index) {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    
                    // Añadir clase visible con delay
                    setTimeout(function() {
                        card.classList.add('visible');
                        
                        // Efecto de bounce sutil en móviles
                        if (isMobile) {
                            setTimeout(function() {
                                card.style.transform = 'translateY(0) scale(1.05)';
                                setTimeout(function() {
                                    card.style.transform = 'translateY(0) scale(1)';
                                }, 200);
                            }, 400);
                        }
                        
                        // Efecto de resplandor sutil
                        card.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.2)';
                        setTimeout(function() {
                            card.style.boxShadow = '';
                        }, 1000);
                        
                    }, index * 150); // Delay escalonado
                }
            });
        }, {
            threshold: isMobile ? 0.3 : 0.4,
            rootMargin: isMobile ? '0px 0px -10px 0px' : '0px 0px -20px 0px'
        });
        
        // Observar todas las tarjetas informativas
        const infoCards = document.querySelectorAll('.info-card');
        infoCards.forEach(function(card) {
            infoCardsObserver.observe(card);
        });
        
        // Observador para elementos en scroll rápido (móviles)
        if (isMobile) {
            let scrollTimeout;
            
            window.addEventListener('scroll', function() {
                clearTimeout(scrollTimeout);
                
                scrollTimeout = setTimeout(function() {
                    const infoCardsVisible = document.querySelectorAll('.info-card.visible');
                    
                    infoCardsVisible.forEach(function(card, index) {
                        if (isElementInViewport(card)) {
                            card.style.transition = 'transform 0.3s ease-out';
                            card.style.transform = 'translateY(0) scale(1.02)';
                            
                            setTimeout(function() {
                                card.style.transform = 'translateY(0) scale(1)';
                            }, 150);
                        }
                    });
                }, 100);
            });
        }
    }
}

// Función helper para detectar si elemento está en viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Función para añadir efecto de aparición suave
function addGentleAppearanceEffect() {
    const infoCards = document.querySelectorAll('.info-card:not(.visible)');
    
    infoCards.forEach(function(card, index) {
        if (isElementInViewport(card)) {
            setTimeout(function() {
                card.classList.add('visible');
            }, index * 100);
        }
    });
}

// Ejecutar cada vez que se cambie el tamaño de ventana
window.addEventListener('resize', function() {
    setTimeout(addGentleAppearanceEffect, 300);
});
