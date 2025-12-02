// Carrito de compras
let cart = [];

// Elementos del DOM
const cartBtn = document.getElementById('cartBtn');
const cartDropdown = document.getElementById('cartDropdown');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const addToCartButtons = document.querySelectorAll('.btn-cart');

// Cargar carrito del localStorage al iniciar
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Alternar visibilidad del carrito
cartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cartDropdown.classList.toggle('active');
});

// Cerrar carrito al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.cart-info')) {
        cartDropdown.classList.remove('active');
    }
});

// Agregar productos al carrito
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        const productName = row.querySelector('td:first-child').textContent.trim();
        const price = row.querySelector('td:nth-child(2)').textContent.trim();
        
        addToCart(productName, price);
        
        // Feedback visual
        button.textContent = '✓ Agregado';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
        }, 1500);
    });
});

// Función para agregar al carrito
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.selectedPlan = '6';
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1,
            selectedPlan: '6'
        });
    }
    
    saveCart();
    updateCart();
}

// Función para actualizar la vista del carrito dropdown
function updateCart() {
    updateCartDisplay();
}

// Función para actualizar la vista del carrito
function updateCartDisplay() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Limpiar items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        return;
    }
    
    // Agregar items
    cart.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} x${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(itemEl);
    });
}

// Función para eliminar del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Inicializar
loadCartFromStorage();

