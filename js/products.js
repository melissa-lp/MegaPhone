let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Productos desde el archivo JSON
fetch('../data/products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        const categoryDropdown = document.getElementById('category-dropdown');

        //  Obtención de categorías
        const categories = [...new Set(products.map(product => product.category))];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);
        });

        renderProducts(products);

    })
    .catch(error => console.error('Error al cargar los productos:', error));

function renderProducts(filteredProducts) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
                <div class="card border-light rounded-5 p-4 h-100 d-flex d-flex-column">
                    <img src="${product.image_main}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text description">${product.description}</p>

                        <div class="mt-auto">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <span class=d-flex align-items-center>
                                    <i class="bi bi-currency-dollar"></i> ${product.price}
                                 </span>
                                <span class="d-flex align-items-center">
                                    <i class="bi bi-tags"></i> ${product.category}
                                 </span>
                            </div>
                            <button class="btn btn-primary btn-details w-100 mt-3 p-3" data-bs-toggle="modal" data-bs-target="#product-modal" onclick="showProductDetails(${product.id})">Detalles</button>
                        </div>
                    </div>
                </div>
            `;
        productList.appendChild(card);
    });
}

// Función para mostrar los detalles del producto en el modal
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        console.error('Producto no encontrado:', productId);
        return;
    }

    document.getElementById('product-quantity').value = 1;
    productQuantity = 1;
    document.getElementById('product-name').dataset.productId = product.id;
    // Actualizar la información del modal con los datos del producto
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-memory').textContent = product.memory;
    document.getElementById('product-camera').textContent = product.camera;
    document.getElementById('product-screen').textContent = product.screen;
    document.getElementById('product-battery').textContent = product.battery;
    document.getElementById('product-os').textContent = product.os;
    document.getElementById('product-connectivity').textContent = product.connectivity;
    document.getElementById('product-description').textContent = product.description;

    // Imagenes en slider
    const sliderImages = document.getElementById('slider-images');
    sliderImages.innerHTML = '';

    product.images_modal.forEach((image, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.className = index === 0 ? 'carousel-item active' : 'carousel-item';
        imgDiv.innerHTML = `<img src="${image}" class="d-block w-100" alt="${product.name}">`;
        sliderImages.appendChild(imgDiv);
    });
}

let productQuantity = 1;

//Event listeners para botones de incremento y decremento
document.addEventListener('DOMContentLoaded', () => {
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    const quantityInput = document.getElementById('product-quantity');

    decrementBtn.addEventListener('click', () => {
        if (productQuantity > 1) {
            productQuantity--;
            quantityInput.value = productQuantity;
        }
    });

    incrementBtn.addEventListener('click', () => {
        productQuantity++;
        quantityInput.value = productQuantity;
    });
});

function saveToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(p => p.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += product.quantity;
        existingProduct.total = existingProduct.price * existingProduct.quantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    Swal.fire({
        title: 'Producto agregado al carrito',
        html: `
        <p><strong>${product.name}</strong></p>
        <p>Cantidad: ${product.quantity}</p>
        <p>Total: $${product.total.toFixed(2)}</p>`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
    });
    console.log('Carrito actualizado:', cart);
}

//Evento para Agregar al Carrito
document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const productId = document.getElementById('product-name').dataset.productId;
    const product = products.find(p => p.id.toString() === productId);

    if (!product) {
        console.error('Producto no encontrado para el carrito:', productId);
        return;
    }

    const productToCart = {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        quantity: parseInt(document.getElementById('product-quantity').value, 10),
        total: product.price * parseInt(document.getElementById('product-quantity').value, 10),
        image: product.image_main,
    };

    saveToCart(productToCart);
});

//Evento para filtrar por categoria o busqueda
document.getElementById('category-dropdown').addEventListener('change', filterProducts);
document.getElementById('search-bar').addEventListener('input', filterProducts);

function filterProducts() {
    const selectedCategory = document.getElementById('category-dropdown').value;
    const searchText = document.getElementById('search-bar').value.toLowerCase();
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchText) || product.description.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });
    document.getElementById('selected-category').textContent = selectedCategory;
    renderProducts(filteredProducts);
}