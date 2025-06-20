// ========================================
// NEW PRICING FILTERS FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initPricingFilters();
});

function initPricingFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sizeGroups = document.querySelectorAll('.size-group');
    
    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter size groups
            filterSizeGroups(filter, sizeGroups);
        });
    });
    
    // Add smooth scroll to pricing section when clicking nav links
    document.querySelectorAll('a[href="#especificaciones"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('especificaciones').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function filterSizeGroups(filter, sizeGroups) {
    sizeGroups.forEach(group => {
        const category = group.dataset.category;
        
        if (filter === 'all') {
            group.style.display = 'block';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        } else if (category === filter) {
            group.style.display = 'block';
            // Animate in
            setTimeout(() => {
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, 100);
        } else {
            // Animate out
            group.style.opacity = '0';
            group.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                group.style.display = 'none';
            }, 300);
        }
    });
}

// Add intersection observer for animation on scroll
function initPricingAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all size groups
    document.querySelectorAll('.size-group').forEach(group => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(group);
    });
    
    // Observe individual price options
    document.querySelectorAll('.price-option').forEach((option, index) => {
        option.style.opacity = '0';
        option.style.transform = 'translateY(20px)';
        option.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(option);
    });
}

// Initialize animations after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initPricingAnimations, 500);
});

// Add WhatsApp tracking for pricing buttons
document.querySelectorAll('.btn-price').forEach(btn => {
    btn.addEventListener('click', function() {
        // Track the click event (you can add analytics here)
        const size = this.closest('.size-group').querySelector('h3').textContent;
        const quantity = this.closest('.price-option').querySelector('h4').textContent;
        
        console.log(`WhatsApp click: ${size} - ${quantity}`);
        
        // Optional: Add Google Analytics or Facebook Pixel tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'WhatsApp',
                event_label: `${size} - ${quantity}`,
                value: 1
            });
        }
    });
});

// Smooth transitions for all elements
document.addEventListener('DOMContentLoaded', function() {
    // Add transition delays to stagger animations
    document.querySelectorAll('.pricing-groups .size-group').forEach((group, index) => {
        group.style.animationDelay = `${index * 0.2}s`;
    });
});
