// Carrito de compras - Página del carrito
let cartItems = [];

// Formato de moneda (usa configuración similar a Index.js)
function formatCurrencyNumber(value) {
    return '$' + Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Elementos del DOM
const cartItemsList = document.getElementById('cartItemsList');
const itemsCount = document.getElementById('itemsCount');
const totalEl = document.getElementById('total');

// Cargar carrito del localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        // Normalizar items antiguos que sólo tenían 'price' como string
        cartItems = cartItems.map(it => {
            if (it.priceContado === undefined) {
                // intentar parsear campo price (ej. "$12.345,00" o "$12345.00")
                let parsed = 0;
                if (it.price) {
                    parsed = Number(String(it.price).replace(/[^0-9,.-]/g, '').replace(/,/g, '.')) || 0;
                }
                return {
                    name: it.name || it.nombre || 'Producto',
                    quantity: it.quantity || 1,
                    priceContado: parsed,
                    price3: parsed,
                    price6: parsed,
                    selectedPlan: '6'
                };
            }
            // asegurar campos mínimos
            return Object.assign({ selectedPlan: '6' }, it);
        });
    }
    renderCart();
}

// Renderizar carrito
function renderCart() {
    cartItemsList.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="index.html" class="btn-continue-shopping">Continuar comprando</a>
            </div>
        `;
        updateItemsCount();
        updateSummary();
        return;
    }

    cartItems.forEach((item, index) => {
        // Determinar precios según campos numéricos
        const precioContado = Number(item.priceContado || 0);
        const precio3 = Number(item.price3 || 0);
        const precio6 = Number(item.price6 || 0);

        // elegir precio según plan seleccionado
        let selectedPrice = precioContado;
        if (item.selectedPlan === '3') selectedPrice = precio3;
        if (item.selectedPlan === '6') selectedPrice = precio6;

        const itemTotal = selectedPrice * item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">Seleccione forma de pago:</div>
                <div class="payment-options">
                    <button class="pay-btn ${item.selectedPlan === 'contado' ? 'active' : ''}" onclick="changePlan(${index}, 'contado')">Contado<br><span class="small">${formatCurrencyNumber(precioContado)}</span></button>
                    <button class="pay-btn ${item.selectedPlan === '3' ? 'active' : ''}" onclick="changePlan(${index}, '3')">3 cuotas<br><span class="small">${formatCurrencyNumber(precio3)}</span></button>
                    <button class="pay-btn ${item.selectedPlan === '6' ? 'active' : ''}" onclick="changePlan(${index}, '6')">6 cuotas<br><span class="small">${formatCurrencyNumber(precio6)}</span></button>
                </div>
            </div>
            <div class="item-controls">
                <div class="quantity-control">
                    <button onclick="decreaseQuantity(${index})">−</button>
                    <div class="quantity-value">${item.quantity}</div>
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
                <div class="item-total">${formatCurrencyNumber(itemTotal)}</div>
                <button class="btn-remove" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        cartItemsList.appendChild(itemEl);
    });

    updateItemsCount();
    updateSummary();
}

// Aumentar cantidad
function increaseQuantity(index) {
    cartItems[index].quantity += 1;
    saveCart();
    renderCart();
}

// Disminuir cantidad
function decreaseQuantity(index) {
    if (cartItems[index].quantity > 1) {
        cartItems[index].quantity -= 1;
    } else {
        removeItem(index);
    }
    saveCart();
    renderCart();
}

// Eliminar item
function removeItem(index) {
    cartItems.splice(index, 1);
    saveCart();
    renderCart();
}

// Actualizar contador de items
function updateItemsCount() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    itemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
}

// Actualizar resumen
function updateSummary() {
    let total = 0;

    cartItems.forEach(item => {
        const precioContado = Number(item.priceContado || 0);
        const precio3 = Number(item.price3 || 0);
        const precio6 = Number(item.price6 || 0);

        let selectedPrice = precioContado;
        if (item.selectedPlan === '3') selectedPrice = precio3;
        if (item.selectedPlan === '6') selectedPrice = precio6;

        total += selectedPrice * (item.quantity || 1);
    });

    totalEl.textContent = formatCurrencyNumber(total);
}

// Cambiar plan seleccionado para un producto
function changePlan(index, plan) {
    if (!cartItems[index]) return;
    cartItems[index].selectedPlan = plan;
    saveCart();
    renderCart();
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// Inicializar
loadCart();
