document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    let products = [];

    function displayCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.alignItems = 'center';

            const nameDiv = document.createElement('div');
            nameDiv.style.width = '30%';
            nameDiv.textContent = item.name;

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.value = item.quantity;
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
    }

    displayCart();

    $.getJSON('products/products.json')  //run JQuery to pull data from products JSON data file
        .done(function(data) {
            products = data;

            document.getElementById('add-to-cart').addEventListener('click', function() {
                const productId = document.getElementById('search-product').value;
                const productToAdd = products.find(product => product.productId === productId);

                if (productToAdd) {
                    const existingItem = cart.find(item => item.id === productToAdd.productId);

                    if (existingItem) {
                        existingItem.quantity++;
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

            document.getElementById('submit-cart').addEventListener('click', () => {
                $.ajax({ // future API enhancement
                    url: '/api/cart/submit',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(cart),
                    success: function(data) {
                        console.log('Success:', data);
                        alert('Cart submitted successfully!');
                        cart = [];
                        localStorage.setItem('cart', JSON.stringify(cart));
                        displayCart();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error('Error:', textStatus, errorThrown);
                        alert('Failed to submit cart.');
                    }
                });
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error loading products:', textStatus, errorThrown);
        });
});