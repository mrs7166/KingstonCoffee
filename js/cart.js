$(document).ready(function() {
    let cart = [];
    let productData = {}; // Object to hold product data

    // Fetch product data from products.json
    $.getJSON('products/products.json', function(data) {
        data.forEach(product => {
            productData[product.productId] = product; // Populate productData object
        });
        updateCartDisplay(); // Update display after data is loaded.
    });

    function updateCartDisplay() {
        $('#cart-items').empty();
        let total = 0;
        cart.forEach(item => {
            const product = productData[item.productId];
            if (product) {
                $('#cart-items').append(`
                    <div class="cart-item">
                        <span>${product.productDescription} - $${product.productPrice} x ${item.quantity}</span>
                        <button class="btn btn-danger btn-sm remove-item" data-id="${item.productId}">Remove</button>
                    </div>
                `);
                total += product.productPrice * item.quantity;
            }
        });
        $('#cart-total-price').text(total.toFixed(2));
    }

    $('#add-to-cart').click(function() {
        const productId = $('#search-product').val();
        if (productData[productId]) {
            const cartItem = cart.find(item => item.productId === productId);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ productId: productId, quantity: 1 });
            }
            updateCartDisplay();
        } else {
            alert('Product not found.');
        }
    });

    $(document).on('click', '.remove-item', function() {
        const productId = $(this).data('id');
        cart = cart.filter(item => item.productId !== productId);
        updateCartDisplay();
    });
});