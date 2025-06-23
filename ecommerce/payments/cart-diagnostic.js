/**
 * CART DIAGNOSTIC - Verificar estado del carrito
 */

console.log('🛒 === CART DIAGNOSTIC CARGADO ===');

function diagnoseCart() {
    console.log('\n🔍 Diagnóstico completo del carrito:');
    
    // 1. Verificar si la clase EmpacameCart existe
    console.log('1. Clase EmpacameCart:', typeof EmpacameCart);
    
    // 2. Verificar si window.empacameCart existe
    console.log('2. window.empacameCart:', typeof window.empacameCart);
    
    // 3. Si existe, verificar sus propiedades
    if (window.empacameCart) {
        console.log('3. Propiedades del carrito:');
        console.log('   - items:', window.empacameCart.items?.length || 'undefined');
        console.log('   - isOpen:', window.empacameCart.isOpen);
        console.log('   - cartElement:', window.empacameCart.cartElement ? 'exists' : 'NO exists');
        
        // Verificar métodos clave
        const methods = ['addItem', 'openCart', 'closeCart', 'proceedToCheckout', 'updateCartDisplay'];
        console.log('   - Métodos:');
        methods.forEach(method => {
            console.log(`     ${method}: ${typeof window.empacameCart[method]}`);
        });
    }
    
    // 4. Verificar elementos DOM del carrito
    console.log('4. Elementos DOM del carrito:');
    const elements = {
        cartButton: document.getElementById('cartButton'),
        cartSidebar: document.getElementById('cartSidebar'),
        cartContent: document.querySelector('.cart-content'),
        cartCount: document.getElementById('cartCount'),
        cartTotal: document.getElementById('cartTotal')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`   - ${name}: ${element ? 'EXISTS' : 'NO EXISTE'}`);
    });
    
    // 5. Buscar contenedores donde debería estar el carrito
    console.log('5. Posibles contenedores:');
    const containers = ['body', '.main-content', '#main', '.container'];
    containers.forEach(selector => {
        const container = document.querySelector(selector);
        console.log(`   - ${selector}: ${container ? 'exists' : 'no existe'}`);
    });
    
    return elements;
}

// Función para intentar crear el carrito manualmente
function createCartManually() {
    console.log('🔧 Intentando crear carrito manualmente...');
    
    if (window.empacameCart) {
        console.log('✅ Carrito ya existe, intentando inicializar DOM...');
        
        // Intentar crear el HTML del carrito
        if (window.empacameCart.createCartHTML) {
            try {
                window.empacameCart.createCartHTML();
                console.log('✅ HTML del carrito creado');
            } catch (error) {
                console.error('❌ Error creando HTML del carrito:', error);
            }
        }
        
        // Verificar si se creó
        setTimeout(() => {
            const cartSidebar = document.getElementById('cartSidebar');
            if (cartSidebar) {
                console.log('✅ Carrito DOM creado exitosamente');
            } else {
                console.log('❌ Carrito DOM aún no existe');
                
                // Crear manualmente el HTML básico
                const cartHTML = `
                    <div class="cart-button" id="cartButton" style="
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #FF8C00;
                        color: white;
                        padding: 10px 15px;
                        border-radius: 25px;
                        cursor: pointer;
                        z-index: 1000;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    ">
                        🛒 <span id="cartCount">0</span> - <span id="cartTotal">$0.00</span>
                    </div>
                    
                    <div class="cart-sidebar" id="cartSidebar" style="
                        position: fixed;
                        top: 0;
                        right: -400px;
                        width: 400px;
                        height: 100vh;
                        background: white;
                        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                        z-index: 10000;
                        transition: right 0.3s ease;
                        overflow-y: auto;
                    ">
                        <div class="cart-header" style="padding: 20px; border-bottom: 1px solid #eee;">
                            <h3>🛒 Tu Carrito</h3>
                            <button id="closeCart" style="
                                position: absolute;
                                top: 20px;
                                right: 20px;
                                background: none;
                                border: none;
                                font-size: 20px;
                                cursor: pointer;
                            ">✕</button>
                        </div>
                        <div class="cart-content" style="padding: 20px;">
                            <div id="cartItems"></div>
                            <div id="cartSummary"></div>
                            <button onclick="if(window.empacameCart && window.empacameCart.proceedToCheckout) window.empacameCart.proceedToCheckout()" style="
                                width: 100%;
                                background: #FF8C00;
                                color: white;
                                border: none;
                                padding: 15px;
                                border-radius: 8px;
                                font-size: 16px;
                                font-weight: bold;
                                cursor: pointer;
                                margin-top: 20px;
                            ">
                                🚀 Proceder al Pago
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', cartHTML);
                
                // Agregar event listeners básicos
                document.getElementById('cartButton').addEventListener('click', () => {
                    document.getElementById('cartSidebar').style.right = '0px';
                });
                
                document.getElementById('closeCart').addEventListener('click', () => {
                    document.getElementById('cartSidebar').style.right = '-400px';
                });
                
                console.log('✅ Carrito básico creado manualmente');
                
                // Actualizar referencia en el carrito
                if (window.empacameCart) {
                    window.empacameCart.cartElement = document.getElementById('cartSidebar');
                }
            }
        }, 100);
        
    } else {
        console.log('❌ window.empacameCart no existe, no se puede crear');
    }
}

// Función para testing del carrito
window.testCart = function() {
    diagnoseCart();
    
    setTimeout(() => {
        createCartManually();
        
        setTimeout(() => {
            console.log('\n🧪 Testing carrito después de creación manual:');
            diagnoseCart();
        }, 500);
    }, 100);
};

// Auto-diagnóstico
setTimeout(() => {
    console.log('🔍 Auto-diagnóstico del carrito...');
    const elements = diagnoseCart();
    
    // Si no hay elementos del carrito, crear manualmente
    if (!elements.cartSidebar) {
        console.log('⚠️ Elementos del carrito faltantes, creando manualmente...');
        createCartManually();
    }
}, 3000);

console.log('✅ Cart diagnostic cargado.');
console.log('💡 Usa testCart() para diagnóstico completo y creación manual');
