document.addEventListener('DOMContentLoaded', () => {
    // Determine the current page to run page-specific logic
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // --- PRODUCT DATA (Using Rs. for eSewa compatibility) ---
    const products = [
        { id: 1, name: 'Elegant Gold Necklace', price: 550, image: 'images/necklace1.jpeg' },
        { id: 2, name: 'Sparkling Diamond Earrings', price: 250, image: 'images/earrings1.jpg' },
        { id: 3, name: 'Golden Charm Bracelet', price: 620, image: 'images/bracelet1.jpg' },
        { id: 4, name: 'Charm Beads', price: 100, image: 'images/beads1.jpg' },
        { id: 5, name: 'Golden Aesthetic Watch', price: 1200, image: 'images/watch1.jpg' },
        { id: 6, name: 'Beautiful Rings Set', price: 400, image: 'images/rings1.webp' },
        { id: 7, name: 'Pearl Drop Earrings', price: 350, image: 'images/earrings1.jpg' },
        { id: 8, name: 'Silver Link Bracelet', price: 750, image: 'images/bracelet1.jpg' }
    ];

    // --- CART MANAGEMENT (Using your 'cart' key) ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartIcon();
    }

    function updateCartIcon() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        alert(`${product.name} has been added to your cart!`);
    }

    function updateQuantity(productId, quantity) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity = parseInt(quantity);
            if (cartItem.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                if (currentPage === 'cart.html') displayCartItems(); // Re-render cart page
            }
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        if (currentPage === 'cart.html') displayCartItems(); // Re-render cart page
    }

    // --- Navigation Active State (Kept from your original code) ---
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        // A small fix to make index.html matching more robust
        const linkHref = link.getAttribute('href').split('/').pop();
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });

    // ===============================================
    // --- PAGE SPECIFIC LOGIC ---
    // ===============================================

    // --- Product Page Logic (products.html) ---
    if (currentPage === 'products.html') {
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = ''; // Clear for dynamic rendering
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">Rs. ${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                `;
                productGrid.appendChild(productCard);
            });

            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.target.getAttribute('data-product-id'));
                    addToCart(productId);
                });
            });
        }
    }

    // --- Cart Page Logic (cart.html) - MERGED & ENHANCED ---
    if (currentPage === 'cart.html') {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartSummaryContainer = document.getElementById('cart-summary-container');

        function displayCartItems() {
            if (!cartItemsContainer || !cartSummaryContainer) return;

            cartItemsContainer.innerHTML = '';
            cartSummaryContainer.innerHTML = '';

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p id="cart-empty-msg">Your cart is empty. <a href="products.html">Shop now!</a></p>';
                return;
            }

            let subtotal = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Price: Rs. ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" value="${item.quantity}" min="1" class="item-quantity" data-product-id="${item.id}">
                        <p>Total: Rs. ${itemTotal.toFixed(2)}</p>
                        <button class="remove-item-btn" data-product-id="${item.id}">×</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
            
            // Calculate final total
            const deliveryCharge = 100;
            const totalAmount = subtotal + deliveryCharge;

            // Display Summary and Checkout Button
            cartSummaryContainer.innerHTML = `
                <h2>Cart Summary</h2>
                <p>Subtotal: <span>Rs. ${subtotal.toFixed(2)}</span></p>
                <p>Delivery Charge: <span>Rs. ${deliveryCharge.toFixed(2)}</span></p>
                <hr style="margin: 10px 0;">
                <p><strong>Grand Total:</strong> <span><strong>Rs. ${totalAmount.toFixed(2)}</strong></span></p>
                <button id="checkout-btn" class="cta-button">Pay with eSewa</button>
            `;

            // Add Event Listeners for cart actions
            cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    removeFromCart(parseInt(e.target.dataset.productId));
                });
            });

            cartItemsContainer.querySelectorAll('.item-quantity').forEach(input => {
                input.addEventListener('change', (e) => {
                    updateQuantity(parseInt(e.target.dataset.productId), e.target.value);
                });
            });

            document.getElementById('checkout-btn').addEventListener('click', () => {
                handleEsewaPayment(totalAmount, subtotal, deliveryCharge);
            });
        }
        
        displayCartItems(); // Initial display
    }

    // --- Contact Page Logic (contact.html) - Kept from your original code ---
    if (currentPage === 'contact.html') {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;

                if (name && email && message) {
                    alert(`Thank you for your message, ${name}!\nWe will get back to you soon.\n(This is a demo submission)`);
                    contactForm.reset();
                } else {
                    alert('Please fill in all fields.');
                }
            });
        }
        // Embed Google Map (Kept from your original code)
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14055.48894121503!2d83.9734185871582!3d28.241513200000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399595f4e6f2f331%3A0x676b79f67a2bd8f7!2sGharipatan%2C%20Pokhara%2033700!5e0!3m2!1sen!2snp!4v1672902345678"
                    width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>`;
        }
    }
    
    // --- Success Page Logic (success.html) - NEW ---
    if (currentPage === 'success.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get('oid'); // eSewa returns order ID as 'oid'
        const transactionRefId = url.get('refId'); // eSewa also returns a reference ID

        if (transactionId) {
            document.getElementById('transaction-id').textContent = transactionRefId || 'N/A';
        }

        // Clear the cart after a successful purchase
        cart = [];
        saveCart(); // This will save an empty array to localStorage and update the icon
    }


    // ===============================================
    // --- ESEWA PAYMENT FUNCTIONALITY - NEW ---
    // ===============================================

    function handleEsewaPayment(total, subtotal, delivery) {
        // IMPORTANT: Use your actual merchant code in a live environment.
        const esewaMerchantCode = "epay_payment"; // This is eSewa's test merchant code.
        
        // Generate a unique product ID for the transaction
        const transactionUUID = `accessorize-me-${new Date().getTime()}`;

        const params = {
            "amt": subtotal,
            "psc": 0, // Product Service Charge
            "pdc": delivery, // Product Delivery Charge
            "txAmt": 0, // Tax amount
            "tAmt": total,
            "pid": transactionUUID,
            "scd": esewaMerchantCode,
            // IMPORTANT: Replace with your actual domain in a live environment
            // Using 127.0.0.1 for Live Server development
            "su": "http://127.0.0.1:5500/success.html", // Success URL
            "fu": "http://127.0.0.1:5500/failure.html"  // Failure URL
        };

        // Create a form dynamically and submit it to eSewa
        const form = document.createElement('form');
        form.setAttribute("method", "POST");
        // Use the UAT (testing) URL. For a live site, use https://epay.esewa.com.np/epay/main
        form.setAttribute("action", "https://uat.esewa.com.np/epay/main"); 
        
        for (const key in params) {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
    }


    // --- Initialize Cart Icon on all pages on load ---
    updateCartIcon();

 
});