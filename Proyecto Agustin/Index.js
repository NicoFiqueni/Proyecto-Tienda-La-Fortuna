// Carrito y listado dinámico de productos desde stock.json
let cart = [];
let allProducts = []; // Guardar todos los productos para filtrar

const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const productsBody = document.getElementById('productsBody');
const searchBox = document.querySelector('.search-box input');

// Redirigir al carrito al hacer clic en el botón
cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'carrito.html';
});

// Cargar carrito desde localStorage
function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) cart = JSON.parse(saved);
    updateCartCount();
}

// Guardar carrito
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Actualizar contador en header
function updateCartCount() {
    const total = cart.reduce((s, it) => s + it.quantity, 0);
    cartCount.textContent = total;
}

// Formato de moneda
function formatCurrency(value) {
    // value es número
    return '$' + value.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Renderizar filas desde datos
async function loadAndRenderProducts() {
    try {
        const res = await fetch('stock.json');
        const data = await res.json();
        allProducts = data; // Guardar todos los productos

        renderProductTable(data);
        window._stockData = data;

    } catch (err) {
        console.error('Error cargando stock.json', err);
        productsBody.innerHTML = '<tr><td colspan="6">Error al cargar productos</td></tr>';
    }
}

// Renderizar tabla de productos
function renderProductTable(productsToRender) {
    productsBody.innerHTML = '';

    if (productsToRender.length === 0) {
        productsBody.innerHTML = '<tr><td colspan="6">No se encontraron productos</td></tr>';
        return;
    }

    productsToRender.forEach((item, idx) => {
        // Encontrar el índice real en allProducts para usar en addProductToCartByIndex
        const realIdx = allProducts.findIndex(p => p.Concepto === item.Concepto);
        
        const tr = document.createElement('tr');

        const concepto = document.createElement('td');
        concepto.innerHTML = `<strong>${item.Concepto}</strong>`;

        const precioLista = document.createElement('td');
        precioLista.textContent = formatCurrency(Number(item['Precio de Lista'] || 0));

        const keyContado = 'Precio Contado/Débito/Crédito 1';
        const key3 = 'Precio 3 cuotas y Plan Z';
        const key6 = 'Precio 6 cuotas';

        const precioContado = document.createElement('td');
        precioContado.textContent = formatCurrency(Number(item[keyContado] || 0));

        const precio3 = document.createElement('td');
        precio3.textContent = formatCurrency(Number(item[key3] || 0));

        const precio6 = document.createElement('td');
        precio6.textContent = formatCurrency(Number(item[key6] || 0));

        const acciones = document.createElement('td');
        acciones.innerHTML = `<button class="btn-cart" data-idx="${realIdx}"><i class="fas fa-shopping-cart"></i> Añadir al carrito</button>`;

        tr.appendChild(concepto);
        tr.appendChild(precioLista);
        tr.appendChild(precioContado);
        tr.appendChild(precio3);
        tr.appendChild(precio6);
        tr.appendChild(acciones);

        productsBody.appendChild(tr);
    });

    // Después de agregar filas, enlazar botones
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(btn.getAttribute('data-idx'));
            addProductToCartByIndex(idx);

            // Feedback
            btn.textContent = '✓ Agregado';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
            }, 1200);
        });
    });
}

// Filtrar productos por búsqueda
function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
        renderProductTable(allProducts);
    } else {
        const filtered = allProducts.filter(item =>
            item.Concepto.toLowerCase().includes(term)
        );
        renderProductTable(filtered);
    }
}

function addProductToCartByIndex(index) {
    const data = window._stockData || [];
    const p = data[index];
    if (!p) return;

    const keyContado = 'Precio Contado/Débito/Crédito 1';

    const key3 = 'Precio 3 cuotas y Plan Z';
    const key6 = 'Precio 6 cuotas';

    const precioContadoNum = Number(p[keyContado] || p['Precio de Lista'] || 0);
    const precio3Num = Number(p[key3] || precioContadoNum || 0);
    const precio6Num = Number(p[key6] || precioContadoNum || 0);

    const existing = cart.find(i => i.name === p.Concepto);
    if (existing) {
        existing.quantity += 1;
        existing.selectedPlan = '6';
    } else {
        cart.push({ name: p.Concepto, quantity: 1, priceContado: precioContadoNum, price3: precio3Num, price6: precio6Num, selectedPlan: '6' });
    }

    saveCart();
    updateCartCount();
}

// Inicializar todo
loadCart();
loadAndRenderProducts();

// Escuchar cambios en la barra de búsqueda
searchBox.addEventListener('input', (e) => {
    filterProducts(e.target.value);
});
