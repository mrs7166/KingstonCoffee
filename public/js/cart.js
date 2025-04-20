document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');

    function fetchCart() {
        fetch('https://kingstoncoffee-server.onrender.com/api/cart')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(cartData => {
                displayCart(cartData);
            })
            .catch(error => console.error('Error fetching cart:', error));
    }

    function displayCart(cart) {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart && cart.length > 0) {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.style.display = 'flex';
                itemDiv.style.justifyContent = 'space-between';
                itemDiv.style.alignItems = 'center';
                itemDiv.style.marginBottom = '10px';
                itemDiv.style.paddingBottom = '10px';
                itemDiv.style.borderBottom = '1px solid #eee';

                const imageDiv = document.createElement('div');
                imageDiv.style.width = '100px';
                imageDiv.style.marginRight = '10px';
                const img = document.createElement('img');
                img.src = item.productThumbnail || 'images/products/soon.jpg';
                img.alt = item.name || 'Product Image';
                img.style.width = '100%';
                img.style.height = 'auto';
                imageDiv.appendChild(img);

                const nameDiv = document.createElement('div');
                nameDiv.style.width = '30%';
                nameDiv.textContent = item.name;

                const quantityInput = document.createElement('input');
                quantityInput.type = 'number';
                quantityInput.value = item.quantity || 1;
                quantityInput.min = 1;
                quantityInput.style.width = '50px';
                quantityInput.style.textAlign = 'center';
                quantityInput.dataset.productId = item.productId; // Store product ID for updates
                quantityInput.addEventListener('change', function() {
                    updateCartItem(this.dataset.productId, parseInt(this.value));
                });

                const priceDiv = document.createElement('div');
                priceDiv.style.width = '20%';
                priceDiv.style.textAlign = 'right';
                priceDiv.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

                const removeButton = document.createElement('button');
                removeButton.className = 'btn btn-danger btn-sm remove-item';
                removeButton.dataset.productId = item.productId; // Store product ID for removal
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', function() {
                    removeCartItem(this.dataset.productId);
                });

                itemDiv.appendChild(imageDiv);
                itemDiv.appendChild(nameDiv);
                itemDiv.appendChild(quantityInput);
                itemDiv.appendChild(priceDiv);
                itemDiv.appendChild(removeButton);

                cartItemsContainer.appendChild(itemDiv);
                total += item.price * item.quantity;
            });

            cartTotalPrice.textContent = total.toFixed(2);
            updateCartBadge(cart.length);
        } else {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalPrice.textContent = '0.00';
            updateCartBadge(0);
        }
    }

    function updateCartItem(productId, quantity) {
        fetch('https://kingstoncoffee-server.onrender.com/api/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: productId, quantity: quantity }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedCart => {
            displayCart(updatedCart); // Re-display the updated cart
        })
        .catch(error => console.error('Error updating cart item:', error));
    }

    function removeCartItem(productId) {
        fetch('https://kingstoncoffee-server.onrender.com/api/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: productId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedCart => {
            displayCart(updatedCart); // Re-display the updated cart
        })
        .catch(error => console.error('Error removing cart item:', error));
    }

    function updateCartBadge(count) {
        const badge = document.querySelector('.badge.bg-primary.rounded-pill');
        if (badge) {
            badge.textContent = count;
        }
    }

    // Proceed to Payment button event listener
    document.getElementById('proceed-to-payment').addEventListener('click', () => {
        window.location.href = 'shipping.html'; // Or handle cart data as needed before navigation
    });

    fetchCart(); // Load the cart when the page loads
});