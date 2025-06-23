/**
 * SIMPLE DEBUG CHECKER
 * Verificación simple de módulos
 */

console.log('🔍 === VERIFICACIÓN SIMPLE DE MÓDULOS ===');

// Lista de módulos esperados
const expectedModules = [
    'PaymentConfig',
    'PaymentValidation', 
    'PaymentFormatting',
    'PaymentProcessor',
    'PayPalProcessor',
    'PaymentManager',
    'PaymentIntegration'
];

setTimeout(() => {
    console.log('\n📊 Estado de módulos después de 2 segundos:');
    
    expectedModules.forEach(moduleName => {
        const exists = typeof window[moduleName] !== 'undefined';
        const type = typeof window[moduleName];
        
        console.log(`${exists ? '✅' : '❌'} ${moduleName}: ${type}`);
        
        if (!exists) {
            // Intentar ver si existe con otro nombre o path
            const variations = [
                `window.${moduleName}`,
                `this.${moduleName}`,
                `self.${moduleName}`
            ];
            
            variations.forEach(variation => {
                try {
                    const result = eval(variation);
                    if (result) {
                        console.log(`   🔍 Encontrado en: ${variation}`);
                    }
                } catch (e) {
                    // Ignorar errores
                }
            });
        }
    });
    
    console.log('\n🚀 Intentando inicialización manual...');
    
    // Intentar crear PayPal processor manualmente
    try {
        if (window.PaymentProcessor && window.PayPalProcessor) {
            console.log('✅ Ambas clases disponibles para PayPal');
        } else {
            console.log('❌ Falta una de las clases para PayPal');
            console.log('PaymentProcessor:', typeof window.PaymentProcessor);
            console.log('PayPalProcessor:', typeof window.PayPalProcessor);
        }
    } catch (error) {
        console.error('❌ Error verificando clases PayPal:', error);
    }
    
}, 2000);

// Función para forzar carga manual
window.forceModuleCheck = function() {
    console.log('🔄 Forzando verificación de módulos...');
    
    expectedModules.forEach(moduleName => {
        const exists = typeof window[moduleName] !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} ${moduleName}`);
    });
};

console.log('✅ Debug checker cargado. Usa forceModuleCheck() para verificar manualmente.');
