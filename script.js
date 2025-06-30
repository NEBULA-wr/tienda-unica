document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS SIMULADA ---
    const products = [
        { id: 1, name: 'Laptop Pro', price: 1200.00, image: '1.png', category: 'electronica', description: 'Una laptop potente y ligera, perfecta para profesionales creativos y desarrolladores. Pantalla Retina de 14 pulgadas.' },
        { id: 2, name: 'Smartphone X', price: 800.00, image: '2.png', category: 'electronica', description: 'El último modelo de smartphone con cámara triple de 48MP, procesador de última generación y batería de larga duración.' },
        { id: 3, name: 'Auriculares Inalámbricos', price: 150.00, image: '3.png', category: 'electronica', description: 'Disfruta de un sonido inmersivo con cancelación de ruido activa y hasta 24 horas de autonomía. Conexión Bluetooth 5.2.' },
        { id: 4, name: 'Camiseta Básica', price: 25.00, image: '4.png', category: 'ropa', description: 'Hecha con 100% algodón orgánico, esta camiseta es suave, cómoda y perfecta para cualquier ocasión.' },
        { id: 5, name: 'Zapatillas Deportivas', price: 90.00, image: '5.png', category: 'ropa', description: 'Zapatillas ultraligeras con tecnología de amortiguación avanzada, ideales para correr o para el día a día.' },
        { id: 6, name: 'Reloj Inteligente', price: 250.00, image: '6.png', category: 'electronica', description: 'Monitoriza tu actividad física, recibe notificaciones y paga sin contacto. Resistente al agua y con GPS integrado.' },
        { id: 7, name: 'Sofá Moderno', price: 600.00, image: '7.png', category: 'hogar', description: 'Un sofá de tres plazas con diseño minimalista y tapizado en tela de alta resistencia. Cómodo y elegante.' },
        { id: 8, name: 'Lámpara de Escritorio', price: 45.00, image: '8.png', category: 'hogar', description: 'Lámpara LED con brillo y temperatura de color ajustables. Diseño flexible y moderno para tu espacio de trabajo.' },
        { id: 9, name: 'Jeans Slim Fit', price: 60.00, image: '9.png', category: 'ropa', description: 'Vaqueros de corte ajustado fabricados con tejido elástico para máximo confort y estilo.' },
    ];

    // --- ESTADO DE LA APLICACIÓN ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let allReviews = JSON.parse(localStorage.getItem('allReviews')) || {};
    let currentOpenProductId = null;

    // --- ELEMENTOS DEL DOM ---
    const productList = document.getElementById('product-list');
    const toastContainer = document.getElementById('toast-container');
    
    // --- LÓGICA DE RESEÑAS POR PRODUCTO ---
    const modalReviewForm = document.getElementById('modal-review-form');
    const modalReviewsList = document.getElementById('modal-reviews-list');
    const modalStarRatingContainer = document.getElementById('modal-star-rating');

    const displayProductReviews = (productId) => {
        const reviews = allReviews[productId] || [];
        modalReviewsList.innerHTML = '';
        if (reviews.length === 0) {
            modalReviewsList.innerHTML = '<p>Aún no hay reseñas. ¡Sé el primero!</p>';
            return;
        }
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            let starsHTML = Array(5).fill(0).map((_, i) => `<i class="${i < review.rating ? 'fas' : 'far'} fa-star"></i>`).join('');
            reviewCard.innerHTML = `
                <button class="delete-review-btn" data-review-id="${review.id}"><i class="fas fa-times"></i></button>
                <div class="review-card-header">
                    <span class="review-author">${review.name}</span>
                    <div class="star-rating">${starsHTML}</div>
                </div>
                <p class="review-comment">${review.comment}</p>`;
            modalReviewsList.prepend(reviewCard);
        });
    };

    modalStarRatingContainer.addEventListener('click', e => {
        const star = e.target.closest('.fa-star');
        if (!star) return;
        const ratingValue = star.dataset.value;
        modalStarRatingContainer.dataset.rating = ratingValue;
        modalStarRatingContainer.querySelectorAll('.fa-star').forEach(s => {
            s.classList.toggle('fas', s.dataset.value <= ratingValue);
            s.classList.toggle('far', s.dataset.value > ratingValue);
        });
    });

    modalReviewForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('modal-reviewer-name').value;
        const comment = document.getElementById('modal-review-comment').value;
        const rating = modalStarRatingContainer.dataset.rating;
        if (!rating) { showToast('Por favor, selecciona una calificación.', 'error'); return; }

        if (!allReviews[currentOpenProductId]) allReviews[currentOpenProductId] = [];
        
        const newReview = { id: Date.now(), name, comment, rating };
        allReviews[currentOpenProductId].push(newReview);
        localStorage.setItem('allReviews', JSON.stringify(allReviews));
        
        displayProductReviews(currentOpenProductId);
        modalReviewForm.reset();
        delete modalStarRatingContainer.dataset.rating;
        modalStarRatingContainer.querySelectorAll('.fa-star').forEach(s => s.classList.replace('fas', 'far'));
        showToast('¡Gracias por tu reseña!', 'success');
    });

    modalReviewsList.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.delete-review-btn');
        if (deleteBtn) {
            const reviewId = deleteBtn.dataset.reviewId;
            allReviews[currentOpenProductId] = allReviews[currentOpenProductId].filter(r => r.id != reviewId);
            localStorage.setItem('allReviews', JSON.stringify(allReviews));
            displayProductReviews(currentOpenProductId);
            showToast('Reseña eliminada.', 'info');
        }
    });

    // --- LÓGICA DEL MODAL DE PRODUCTO ---
    const productDetailModal = document.getElementById('product-detail-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal');

    const openProductModal = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        currentOpenProductId = productId;
        
        document.getElementById('modal-product-image').src = product.image;
        document.getElementById('modal-product-title').textContent = product.name;
        document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modal-product-description').textContent = product.description;
        document.getElementById('modal-add-to-cart-btn').dataset.id = productId;
        
        displayProductReviews(productId);
        productDetailModal.classList.add('active');
    };
    
    const closeProductModal = () => productDetailModal.classList.remove('active');
    
    closeProductModalBtn.addEventListener('click', closeProductModal);
    productDetailModal.addEventListener('click', e => { if (e.target === productDetailModal) closeProductModal(); });
    document.getElementById('modal-add-to-cart-btn').addEventListener('click', e => {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
        showToast('Añadido al carrito', 'success');
    });

    // --- LÓGICA PRINCIPAL (CARRITO, BÚSQUEDA, ETC) ---
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-times-circle';
        toast.innerHTML = `<i class="${iconClass}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };

    const updateCart = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const cartCountElement = document.querySelector('.cart-count');
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItems = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                totalItems += item.quantity;
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `<img src="${item.image}" alt="${item.name}" class="cart-item-img" style="width:80px;height:80px;object-fit:cover;border-radius:8px;"><div style="flex-grow:1;"><p style="font-weight:600;">${item.name}</p><p style="color:#7f8c8d;">$${item.price.toFixed(2)}</p><div style="display:flex;align-items:center;gap:10px;"><button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button><span>${item.quantity}</span><button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button></div></div><button class="remove-item-btn" data-id="${item.id}" style="color:var(--error-color);background:none;border:none;font-size:1.2rem;cursor:pointer;"><i class="fas fa-trash"></i></button>`;
                cartItemsContainer.appendChild(cartItem);
            });
        }
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
        cartCountElement.textContent = totalItems;
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    };
    
    const displayProducts = (filteredProducts) => {
        productList.innerHTML = '';
        (filteredProducts || products).forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;
            productCard.innerHTML = `<img src="${product.image}" alt="${product.name}" class="product-image"><div class="product-info"><span class="product-category">${product.category}</span><h3 class="product-title">${product.name}</h3><p class="product-price">$${product.price.toFixed(2)}</p><button class="btn btn-primary add-to-cart-btn" data-id="${product.id}"><i class="fas fa-cart-plus"></i> Añadir al carrito</button></div>`;
            productList.appendChild(productCard);
        });
    };

    // --- EVENT LISTENERS GENERALES ---
    productList.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            const productId = parseInt(e.target.closest('.add-to-cart-btn').dataset.id);
            addToCart(productId);
            showToast('Añadido al carrito', 'success');
        } else if (e.target.closest('.product-card')) {
            const productId = parseInt(e.target.closest('.product-card').dataset.productId);
            openProductModal(productId);
        }
    });

    document.getElementById('cart-items').addEventListener('click', (e) => {
        const target = e.target;
        const cartItemElement = target.closest('[data-id]');
        if (!cartItemElement) return;
        const productId = parseInt(cartItemElement.dataset.id);
        const cartItem = cart.find(item => item.id === productId);
        if (target.closest('.remove-item-btn')) {
            cart = cart.filter(item => item.id !== productId);
            showToast('Producto eliminado', 'error');
        } else if (target.closest('.quantity-btn')) {
            const action = cartItemElement.dataset.action;
            if (action === 'increase') cartItem.quantity++;
            else if (action === 'decrease') {
                cartItem.quantity--;
                if (cartItem.quantity === 0) cart = cart.filter(item => item.id !== productId);
            }
        }
        updateCart();
    });

    // Filtros, búsqueda, carrito, pago, etc.
    const filterAndSearch = () => { const searchTerm = document.getElementById('search-input').value.toLowerCase(); const activeCategory = document.querySelector('.filter-btn.active').dataset.category; displayProducts(products.filter(p => (activeCategory === 'all' || p.category === activeCategory) && p.name.toLowerCase().includes(searchTerm))); };
    document.getElementById('search-input').addEventListener('input', filterAndSearch);
    document.querySelectorAll('.filter-btn').forEach(btn => { btn.addEventListener('click', () => { document.querySelector('.filter-btn.active').classList.remove('active'); btn.classList.add('active'); filterAndSearch(); }); });
    const toggleCart = () => { document.querySelector('.cart-sidebar').classList.toggle('active'); document.querySelector('.cart-overlay').classList.toggle('active'); };
    document.getElementById('cart-btn').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', toggleCart);
    document.querySelector('.cart-overlay').addEventListener('click', toggleCart);
    document.getElementById('checkout-btn').addEventListener('click', () => { if (cart.length === 0) { showToast('Tu carrito está vacío', 'error'); return; } document.getElementById('payment-modal').classList.add('active'); toggleCart(); });
    document.getElementById('close-payment-modal').addEventListener('click', () => document.getElementById('payment-modal').classList.remove('active'));
    document.getElementById('payment-form').addEventListener('submit', e => { e.preventDefault(); /* Lógica de pago aquí */ showToast('Pago simulado con éxito', 'success'); document.getElementById('payment-modal').classList.remove('active'); cart = []; updateCart(); });
    
    // Cambiador de color
    document.querySelector('.switcher-btn').addEventListener('click', () => document.querySelector('.color-switcher').classList.toggle('active'));
    document.querySelectorAll('.theme-colors .color').forEach(span => span.addEventListener('click', e => { const color = e.target.dataset.color; if (color) { document.documentElement.style.setProperty('--primary-color', color); localStorage.setItem('themeColor', color); }}));
    
    // Carrusel
    const carouselSlide = document.querySelector('.carousel-slide'); const carouselItems = document.querySelectorAll('.carousel-item'); const prevBtn = document.querySelector('.carousel-btn.prev'); const nextBtn = document.querySelector('.carousel-btn.next'); const dotsContainer = document.querySelector('.carousel-dots'); let currentIndex = 0; let autoPlayInterval; carouselItems.forEach((_, i) => { const dot = document.createElement('div'); dot.classList.add('dot'); if (i === 0) dot.classList.add('active'); dot.addEventListener('click', () => goToSlide(i)); dotsContainer.appendChild(dot); }); const dots = document.querySelectorAll('.dot'); function updateDots(index) { dots.forEach(dot => dot.classList.remove('active')); dots[index].classList.add('active'); } function goToSlide(index) { carouselSlide.style.transform = `translateX(-${index * 100}%)`; currentIndex = index; updateDots(index); resetAutoPlay(); } function nextSlide() { goToSlide((currentIndex + 1) % carouselItems.length); } function prevSlide() { goToSlide((currentIndex - 1 + carouselItems.length) % carouselItems.length); } function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); } function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); } nextBtn.addEventListener('click', nextSlide); prevBtn.addEventListener('click', prevSlide);
    
    // --- INICIALIZACIÓN ---
    const loadThemeColor = () => { const savedColor = localStorage.getItem('themeColor'); if (savedColor) document.documentElement.style.setProperty('--primary-color', savedColor); };
    loadThemeColor();
    displayProducts();
    updateCart();
    startAutoPlay();
});