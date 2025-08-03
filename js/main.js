document.addEventListener('DOMContentLoaded', () => {

    // --- PRODUCT DATA (Based on your index.html) ---
    const products = [
        { id: 1, name: 'Elegant Gold Necklace', price: 550, image: 'images/necklace1.jpeg' },
        { id: 2, name: 'Sparkling Diamond Earrings', price: 250, image: 'images/earrings1.jpg' },
        { id: 3, name: 'Golden Charm Bracelet', price: 620, image: 'images/bracelet1.jpg' },
        { id: 4, name: 'Charm Beads', price: 1, image: 'images/beads1.jpg' },
        { id: 5, name: 'Golden Aesthetic Watch', price: 1200, image: 'images/watch1.jpg' },
        { id: 6, name: 'Beautiful Rings', price: 400, image: 'images/rings1.webp' }
    ];

    // --- CART MANAGEMENT ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    };
    
    // Finds a product in the list by its card content
    const getProductFromCard = (cardElement) => {
        const productName = cardElement.querySelector('h3').textContent.trim();
        return products.find(p => p.name === productName);
    };

    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            saveCart();
            alert(`${product.name} has been added to your cart!`);
        }
    };
    
    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCartPage(); // Refresh the cart view
    };
    
    const updateCartCount = () => {
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };


    // --- DYNAMIC PAGE RENDERING ---
    const renderProductsPage = () => {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        
        productGrid.innerHTML = '';
        products.forEach(product => {
            productGrid.innerHTML += `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="product-price1">Rs.${product.price}</p>
                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            `;
        });
    };

    const renderCartPage = () => {
        const itemsContainer = document.getElementById('cart-items-container');
        const summaryContainer = document.getElementById('cart-summary-container');
        if (!itemsContainer || !summaryContainer) return;

        itemsContainer.innerHTML = '';
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            summaryContainer.innerHTML = '';
            return;
        }

        cart.forEach(item => {
            itemsContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; border-radius: 4px;">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <p>Rs. ${item.price * item.quantity}</p>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
            `;
        });

        summaryContainer.innerHTML = `
            <h3>Total: Rs. ${calculateTotal()}</h3>
            <a href="checkout.html" class="cta-button">Proceed to Checkout</a>
        `;
    };
    
    const renderCheckoutPage = () => {
        const summaryContainer = document.getElementById('order-summary-container');
        const esewaButton = document.getElementById('esewa-payment-button');
        if (!summaryContainer || !esewaButton) return;

        if (cart.length === 0) {
            summaryContainer.innerHTML = '<p>Your cart is empty. Please add items before checking out.</p>';
            esewaButton.style.display = 'none';
            return;
        }
        
        summaryContainer.innerHTML = '<h4>Order Summary:</h4><ul>';
        cart.forEach(item => {
            summaryContainer.innerHTML += `<li>${item.name} (x${item.quantity})</li>`;
        });
        summaryContainer.innerHTML += `</ul><hr><p class="total-amount">Total to Pay: Rs. ${calculateTotal()}</p>`;
    };

    // --- ESEWA PAYMENT INTEGRATION (Following Documentation) ---
    const handleEsewaPayment = () => {
        const esewaButton = document.getElementById('esewa-payment-button');
        if (!esewaButton) return;

        esewaButton.addEventListener('click', () => {
            const totalAmount = calculateTotal();
            if (totalAmount <= 0) {
                alert("Cannot proceed with an empty cart.");
                return;
            }

            // 1. Generate a unique transaction UUID
            const transactionUUID = `accessorize-me-${Date.now()}`;
            
            // 2. Define Success and Failure URLs. These must be live URLs in production.
            // For local testing, use the URLs provided by your local server (e.g., Live Server)
            const successUrl = `${window.location.origin}/success.html`;
            const failureUrl = `${window.location.origin}/failure.html`;
            
            // 3. Generate the Signature (as per eSewa documentation)
            const secret = "8gBm/:&EnhH.1/q"; // This is the eSewa TEST secret key.
            const dataToSign = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=EPAYTEST`;
            
            const signature = CryptoJS.HmacSHA256(dataToSign, secret).toString(CryptoJS.enc.Base64);

            // 4. Populate the hidden form fields
            document.getElementById('total_amount').value = totalAmount;
            document.getElementById('amount').value = totalAmount;
            document.getElementById('transaction_uuid').value = transactionUUID;
            document.getElementById('signature').value = signature;
            document.getElementById('success_url').value = successUrl;
            document.getElementById('failure_url').value = failureUrl;

            // 5. Submit the form to redirect the user to eSewa's payment page
            document.getElementById('esewa-form').submit();
        });
    };
    
    // --- GLOBAL EVENT LISTENERS ---
    document.body.addEventListener('click', (event) => {
        const target = event.target;
        // Add to cart from both index.html and products.html
        if (target.classList.contains('add-to-cart-btn')) {
            const productCard = target.closest('.product-card');
            if (productCard) {
                const product = getProductFromCard(productCard);
                if (product) {
                    addToCart(product.id);
                }
            }
        }
        // Remove from cart
        if (target.classList.contains('remove-btn')) {
            const productId = parseInt(target.dataset.id);
            removeFromCart(productId);
        }
    });

    // --- INITIALIZE SCRIPT BASED ON CURRENT PAGE ---
    updateCartCount();

    const path = window.location.pathname;
    if (path.includes('products.html')) {
        renderProductsPage();
    }
    if (path.includes('cart.html')) {
        renderCartPage();
    }
    if (path.includes('checkout.html')) {
        renderCheckoutPage();
        handleEsewaPayment();
    }
});