// ========================================
// EMPÁCAME - JAVASCRIPT SIMPLIFIED
// ========================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Empácame loading...');
    
    // Initialize all functionality
    initNavigation();
    initFAQ();
    initContactForm();
    initLoadingScreen();
    initSmoothScroll();
    initScrollAnimations();
    
    console.log('✅ Empácame loaded successfully!');
});

// ========================================
// LOADING SCREEN
// ========================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    
    if (loadingScreen) {
        // Hide loading screen after page load
        window.addEventListener('load', function() {
            setTimeout(function() {
                loadingScreen.classList.add('hide');
                
                // Remove from DOM after animation
                setTimeout(function() {
                    if (loadingScreen.parentNode) {
                        loadingScreen.remove();
                    }
                }, 500);
            }, 800);
        });
        
        // Fallback: Hide after maximum time
        setTimeout(function() {
            if (loadingScreen && !loadingScreen.classList.contains('hide')) {
                loadingScreen.classList.add('hide');
                setTimeout(function() {
                    if (loadingScreen.parentNode) {
                        loadingScreen.remove();
                    }
                }, 500);
            }
        }, 3000);
    }
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Close menu when clicking nav links
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    // Navbar scroll effect
    if (navbar) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        });
    }
}

// ========================================
// FAQ FUNCTIONALITY
// ========================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(function(otherItem) {
                    otherItem.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// ========================================
// CONTACT FORM
// ========================================
function initContactForm() {
    const form = document.getElementById('sample-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const businessType = document.getElementById('business-type').value;
            const message = document.getElementById('message').value;
            
            // Validate form
            if (!name || !email || !phone || !businessType) {
                alert('Por favor, completa todos los campos requeridos.');
                return;
            }
            
            // Show loading
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitButton.disabled = true;
            
            // Simulate form submission
            setTimeout(function() {
                // Create WhatsApp message
                const whatsappMessage = 'Hola! Solicito una muestra gratis de Empácame.\n\n' +
                    'Datos:\n' +
                    '• Nombre: ' + name + '\n' +
                    '• Email: ' + email + '\n' +
                    '• Teléfono: ' + phone + '\n' +
                    '• Tipo de negocio: ' + businessType + '\n' +
                    '• Mensaje: ' + (message || 'N/A') + '\n\n' +
                    '¡Gracias!';
                
                const whatsappURL = 'https://wa.me/8494496394?text=' + encodeURIComponent(whatsappMessage);
                
                // Reset form
                form.reset();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                
                alert('¡Solicitud enviada! Serás redirigido a WhatsApp.');
                
                // Redirect to WhatsApp
                setTimeout(function() {
                    window.open(whatsappURL, '_blank');
                }, 1000);
                
            }, 2000);
        });
    }
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Scroll indicator
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const benefitsSection = document.getElementById('beneficios');
            if (benefitsSection) {
                benefitsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
    // Simple scroll animation without external libraries
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Para tarjetas informativas, agregar una pequeña vibración
                    if (entry.target.classList.contains('info-card')) {
                        setTimeout(function() {
                            entry.target.style.transform = 'translateY(0) scale(1.02)';
                            setTimeout(function() {
                                entry.target.style.transform = 'translateY(0) scale(1)';
                            }, 150);
                        }, parseInt(getComputedStyle(entry.target).transitionDelay) * 1000 + 300);
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        });

        // Observe elements for animation - incluir tarjetas informativas
        const animatedElements = document.querySelectorAll('.benefit-card, .spec-item, .audience-card, .testimonial-card, .faq-item, .info-card');
        
        animatedElements.forEach(function(el) {
            if (!el.classList.contains('fade-in')) {
                el.classList.add('fade-in');
            }
            observer.observe(el);
        });
        
        // Observador especial para tarjetas informativas con threshold más bajo
        const infoCardObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        });
        
        const infoCards = document.querySelectorAll('.info-card');
        infoCards.forEach(function(card) {
            infoCardObserver.observe(card);
        });
        
    } else {
        // Fallback for older browsers
        const elements = document.querySelectorAll('.fade-in, .info-card');
        elements.forEach(function(el) {
            el.classList.add('visible');
        });
    }
}

// ========================================
// ERROR HANDLING
// ========================================
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// ========================================
// BROWSER COMPATIBILITY
// ========================================
// Polyfill for smooth scroll
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function() {
        this.scrollTop = this.offsetTop;
    };
}
