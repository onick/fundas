// ========================================
// EMPÁCAME - PROLAND STYLE JAVASCRIPT
// Modern & Interactive Landing Page
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Empácame ProLand Style loading...');
    
    // Initialize all functionality
    initNavigation();
    initScrollAnimations();
    initSmoothScroll();
    initParallaxEffects();
    initCounters();
    
    console.log('✅ Empácame ProLand Style loaded successfully!');
});

// ========================================
// NAVIGATION FUNCTIONALITY
// ========================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }

            // Hide/show navbar on scroll (mobile)
            if (window.innerWidth <= 768) {
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    window.addEventListener('scroll', function() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
    // Create intersection observer for scroll animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger counter animation if it's a stat element
                    if (entry.target.classList.contains('stat-number')) {
                        animateCounter(entry.target);
                    }
                    
                    // Trigger staggered animation for grids
                    if (entry.target.classList.contains('benefits-grid') || 
                        entry.target.classList.contains('audience-grid') ||
                        entry.target.classList.contains('testimonials-grid')) {
                        animateGridItems(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(`
            .hero-content,
            .hero-visual,
            .section-title,
            .section-description,
            .product-layers,
            .benefits-grid,
            .audience-grid,
            .testimonials-grid,
            .spec-visual,
            .specs-table,
            .cta-content,
            .stat-number
        `);

        animatedElements.forEach(el => {
            // Add initial animation class
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            
            observer.observe(el);
        });
    } else {
        // Fallback for older browsers
        const elements = document.querySelectorAll('[style*="opacity: 0"]');
        elements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// PARALLAX EFFECTS
// ========================================
function initParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Hero background parallax
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate * 0.3}px)`;
        }
        
        // Product showcase parallax
        const productShowcase = document.querySelector('.product-showcase');
        if (productShowcase) {
            const showcaseRate = scrolled * -0.2;
            productShowcase.style.transform = `translateY(${showcaseRate}px)`;
        }
        
        // Feature badges floating effect
        const badges = document.querySelectorAll('.badge');
        badges.forEach((badge, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = Math.sin(scrolled * 0.01 + index) * 10;
            badge.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// ========================================
// COUNTER ANIMATION
// ========================================
function initCounters() {
    // Counters will be triggered by scroll observer
}

function animateCounter(element) {
    const text = element.textContent;
    const hasPercent = text.includes('%');
    const hasX = text.includes('x');
    
    let target = 0;
    let suffix = '';
    
    if (hasPercent) {
        target = parseInt(text.replace('%', ''));
        suffix = '%';
    } else if (hasX) {
        // Handle "12x15.5" format
        element.textContent = text; // Keep original for complex formats
        return;
    } else {
        target = parseInt(text.replace(/[^\d]/g, ''));
    }
    
    if (target > 0) {
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.round(current) + suffix;
        }, 16);
    }
}

// ========================================
// GRID ANIMATIONS
// ========================================
function animateGridItems(grid) {
    const items = grid.children;
    
    Array.from(items).forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Throttle function for performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ========================================
// ENHANCED INTERACTIONS
// ========================================

// Add enhanced hover effects
document.addEventListener('mouseover', function(e) {
    // Enhanced button hover effects
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'translateY(-2px) scale(1.02)';
    }
    
    // Card hover effects
    if (e.target.closest('.benefit-card') || 
        e.target.closest('.audience-card') || 
        e.target.closest('.testimonial-card')) {
        const card = e.target.closest('.benefit-card, .audience-card, .testimonial-card');
        card.style.transform = 'translateY(-8px) scale(1.02)';
    }
});

document.addEventListener('mouseout', function(e) {
    // Reset button effects
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = '';
    }
    
    // Reset card effects
    if (e.target.closest('.benefit-card') || 
        e.target.closest('.audience-card') || 
        e.target.closest('.testimonial-card')) {
        const card = e.target.closest('.benefit-card, .audience-card, .testimonial-card');
        card.style.transform = '';
    }
});

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Lazy load images when they come into view
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
initLazyLoading();

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Focus management for better accessibility
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// ========================================
// ANALYTICS TRACKING
// ========================================

function trackEvent(eventName, properties = {}) {
    // Integration with analytics services
    console.log('Event tracked:', eventName, properties);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Example: Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, properties);
    }
}

// Track CTA clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-primary')) {
        trackEvent('cta_click', {
            button_text: e.target.textContent.trim(),
            page_section: e.target.closest('section')?.id || 'unknown'
        });
    }
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', throttle(function() {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
            trackEvent('scroll_depth', {
                percent: scrollPercent
            });
        }
    }
}, 1000));

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // Could send error to analytics service here
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    // Could send error to analytics service here
});

// ========================================
// CSS ANIMATION CLASSES
// ========================================

// Add CSS for animate-in class
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid var(--primary-color) !important;
        outline-offset: 2px !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
        }
    }
`;
document.head.appendChild(style);

console.log('🎉 Empácame ProLand Style fully initialized!');
