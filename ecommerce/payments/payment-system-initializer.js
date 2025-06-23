/**
 * PAYMENT SYSTEM INITIALIZER
 * Garantiza que todos los módulos se carguen en el orden correcto
 * y proporciona verificación de dependencias
 */

class PaymentSystemInitializer {
    constructor() {
        this.loadedModules = new Set();
        this.requiredModules = [
            'PaymentConfig',
            'PaymentValidation', 
            'PaymentFormatting',
            'PaymentProcessor',
            'PayPalProcessor',
            'PaymentManager',
            'PaymentIntegration'
        ];
        this.initializationAttempts = 0;
        this.maxAttempts = 10;
    }

    /**
     * Verifica que todos los módulos requeridos estén disponibles
     */
    checkModules() {
        console.log('🔍 Verificando módulos del sistema de pagos...');
        
        const moduleStatus = {};
        let allLoaded = true;

        this.requiredModules.forEach(moduleName => {
            const isLoaded = typeof window[moduleName] !== 'undefined';
            moduleStatus[moduleName] = isLoaded;
            
            if (isLoaded) {
                this.loadedModules.add(moduleName);
                console.log(`✅ ${moduleName} - Cargado`);
            } else {
                allLoaded = false;
                console.log(`❌ ${moduleName} - NO cargado`);
            }
        });

        return { allLoaded, moduleStatus };
    }

    /**
     * Inicializa el sistema de pagos cuando todos los módulos estén listos
     */
    async initializeWhenReady() {
        console.log('🚀 Intentando inicializar sistema de pagos...');
        
        const { allLoaded, moduleStatus } = this.checkModules();
        
        if (allLoaded) {
            console.log('✅ Todos los módulos cargados - Inicializando sistema');
            try {
                await this.initializeSystem();
                return true;
            } catch (error) {
                console.error('❌ Error inicializando sistema:', error);
                return false;
            }
        } else {
            console.log(`⏳ Faltan módulos - Intento ${this.initializationAttempts + 1}/${this.maxAttempts}`);
            
            if (this.initializationAttempts < this.maxAttempts) {
                this.initializationAttempts++;
                setTimeout(() => this.initializeWhenReady(), 500);
            } else {
                console.error('❌ Máximo de intentos alcanzado. Módulos faltantes:', 
                    this.requiredModules.filter(m => !moduleStatus[m]));
                this.showErrorMessage();
            }
            return false;
        }
    }

    /**
     * Inicializa el sistema completo
     */
    async initializeSystem() {
        console.log('🔧 Inicializando Payment Integration...');
        
        // Agregar estilos si no están presentes
        if (window.PaymentIntegration && window.PaymentIntegration.addIntegrationStyles) {
            window.PaymentIntegration.addIntegrationStyles();
        }

        // Inicializar la integración - verificar si es clase o instancia
        if (window.PaymentIntegration) {
            if (typeof window.PaymentIntegration === 'function') {
                // Es una clase, crear instancia
                console.log('🔧 PaymentIntegration es una clase, creando instancia...');
                const paymentIntegration = new window.PaymentIntegration();
                await paymentIntegration.initialize();
                window.paymentIntegrationInstance = paymentIntegration;
            } else if (window.PaymentIntegration.initialize) {
                // Es una instancia con método initialize
                console.log('🔧 PaymentIntegration es una instancia, inicializando...');
                await window.PaymentIntegration.initialize();
            } else if (window.paymentIntegration && window.paymentIntegration.initialize) {
                // Usar la instancia global alternativa
                console.log('🔧 Usando window.paymentIntegration...');
                await window.paymentIntegration.initialize();
            } else {
                console.log('⚠️ PaymentIntegration encontrado pero sin método initialize, continuando...');
            }
            console.log('✅ Sistema de pagos inicializado correctamente');
        } else {
            throw new Error('PaymentIntegration no está disponible');
        }
    }

    /**
     * Muestra mensaje de error si el sistema no puede iniciarse
     */
    showErrorMessage() {
        console.error(`
❌ ERROR: No se pudo inicializar el sistema de pagos

🔍 DIAGNÓSTICO:
${this.requiredModules.map(module => {
    const loaded = typeof window[module] !== 'undefined';
    return `${loaded ? '✅' : '❌'} ${module}`;
}).join('\n')}

🛠️ SOLUCIONES:
1. Verificar que todos los scripts estén incluidos en index.html
2. Revisar la consola para errores de JavaScript
3. Verificar que los archivos existen en las rutas correctas
4. Recargar la página
        `);

        // Mostrar mensaje visual en la página
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee;
            border: 2px solid #f00;
            padding: 20px;
            border-radius: 8px;
            z-index: 9999;
            max-width: 400px;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #c00;">⚠️ Error del Sistema de Pagos</h3>
            <p style="margin: 0;">No se pudieron cargar todos los módulos requeridos.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">Revisar consola para más detalles.</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">Cerrar</button>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Obtiene el estado del sistema
     */
    getSystemStatus() {
        const { allLoaded, moduleStatus } = this.checkModules();
        
        return {
            initialized: allLoaded,
            attempts: this.initializationAttempts,
            modules: moduleStatus,
            paymentManagerReady: window.PaymentManager?.isInitialized || false,
            paymentIntegrationReady: window.PaymentIntegration?.isInitialized || false
        };
    }

    /**
     * Fuerza reinicialización del sistema
     */
    async forceReinitialize() {
        console.log('🔄 Forzando reinicialización del sistema...');
        this.initializationAttempts = 0;
        this.loadedModules.clear();
        
        // Limpiar sistemas existentes
        if (window.PaymentManager?.cleanup) {
            window.PaymentManager.cleanup();
        }
        if (window.PaymentIntegration?.cleanup) {
            window.PaymentIntegration.cleanup();
        }
        
        // Reinicializar
        return await this.initializeWhenReady();
    }
}

// Crear instancia global
const paymentSystemInitializer = new PaymentSystemInitializer();

// Hacer disponible globalmente
window.PaymentSystemInitializer = paymentSystemInitializer;

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Payment System Initializer cargado');
    
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        paymentSystemInitializer.initializeWhenReady();
    }, 1000);
});

// También proporcionar funciones de utilidad globales
window.checkPaymentSystem = () => paymentSystemInitializer.getSystemStatus();
window.reinitializePaymentSystem = () => paymentSystemInitializer.forceReinitialize();

console.log('✅ Payment System Initializer configurado');
