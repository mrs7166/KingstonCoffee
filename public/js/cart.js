document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    let products = [];

    function displayCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const product = products.find(p => p.productId === item.id);
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
            img.src = product ? product.productThumbnail : 'images/products/soon.jpg'; // default imnage if no product image found
            img.alt = product ? product.productDescription : 'Product Image';
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

            quantityInput.addEventListener('change', function() {
                item.quantity = parseInt(this.value);
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
            });

            const priceDiv = document.createElement('div');
            priceDiv.style.width = '20%';
            priceDiv.style.textAlign = 'right';
            priceDiv.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

            const removeButton = document.createElement('button');
            removeButton.className = 'btn btn-danger btn-sm remove-item';
            removeButton.dataset.id = item.id;
            removeButton.textContent = 'Remove';

            itemDiv.appendChild(imageDiv);
            itemDiv.appendChild(nameDiv);
            itemDiv.appendChild(quantityInput);
            itemDiv.appendChild(priceDiv);
            itemDiv.appendChild(removeButton);

            cartItemsContainer.appendChild(itemDiv);
            total += item.price * item.quantity;
        });

        cartTotalPrice.textContent = total.toFixed(2);

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                cart = cart.filter(item => item.id !== itemId);
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
            });
        });

        // Update the cart badge
        updateCartBadge(cart.length);
    }

    function updateCartBadge(count) {
        const badge = document.querySelector('.badge.bg-primary.rounded-pill');
        if (badge) {
            badge.textContent = count;
        }
    }

    displayCart();

    $.getJSON('products/products.json')
        .done(function(data) {
            products = data;
            displayCart(); // Re-display cart now that products data is loaded

            document.getElementById('add-to-cart').addEventListener('click', function() {
                const productId = document.getElementById('search-product').value;
                const productToAdd = products.find(product => product.productId === productId);

                if (productToAdd) {
                    const existingItem = cart.find(item => item.id === productToAdd.productId);

                    if (existingItem) {
                        existingItem.quantity = (existingItem.quantity || 0) + 1;
                    } else {
                        cart.push({
                            id: productToAdd.productId,
                            name: productToAdd.productDescription,
                            price: productToAdd.productPrice,
                            quantity: 1
                        });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    displayCart();
                    document.getElementById('search-product').value = '';
                } else {
                    alert('Product ID not found.');
                }
            });


            // Proceed to Payment button event listener
            document.getElementById('proceed-to-payment').addEventListener('click', () => {
                localStorage.setItem('cartForShipping', JSON.stringify(cart)); // Save cart data
                window.location.href = 'shipping.html';
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error loading products:', textStatus, errorThrown);
        });
});