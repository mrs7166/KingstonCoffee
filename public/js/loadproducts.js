document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('#section_3 .container .row');

    fetch('https://kingstoncoffee-server.onrender.com/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (container) {
                container.innerHTML = ''; // Clear existing content

                const categories = {};
                // Group products by category
                data.forEach(product => {
                    if (!categories[product.productCategory]) {
                        categories[product.productCategory] = [];
                    }
                    categories[product.productCategory].push(product);
                });

                Object.keys(categories).forEach(category => {
                    const sectionHTML = `
                        <div class="col-lg-6 col-12 mb-4 mb-lg-0">
                            <div class="menu-block-wrap">
                                <div class="text-center mb-4 pb-lg-2">
                                    <em class="text-white">Category: ${category}</em>
                                    <h4 class="text-white">${category}</h4>
                                </div>
                                ${categories[category].map(product => `
                                    <div class="menu-block">
                                        <div class="d-flex align-items-center">
                                            <div class="me-3">
                                                <img src="${product.productThumbnail || 'images/products/soon.jpg'}" class="img-fluid rounded" alt="${product.productDescription} Thumbnail" style="width: 70px; height: 70px; object-fit: cover;">
                                            </div>
                                            <h6>${product.productDescription}</h6>
                                            <span class="underline"></span>
                                            <strong class="ms-auto">$${product.productPrice.toFixed(2)}</strong>
                                            <button class="btn btn-sm btn-primary ms-2 add-to-cart"
                                                data-id="${product._id}"
                                                data-product="${product.productDescription}"
                                                data-price="${product.productPrice}"
                                                data-thumbnail="${product.productThumbnail}">
                                                Add to Cart
                                            </button>
                                        </div>
                                        <div class="border-top mt-2 pt-2">
                                            <small>Unit: ${product.productUnit}, Weight: ${product.productWeight} lbs</small>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    container.innerHTML += sectionHTML;
                });

                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = this.dataset.id;
                        const productName = this.dataset.product;
                        const productPrice = parseFloat(this.dataset.price);
                        const productThumbnail = this.dataset.thumbnail;

                        fetch('https://kingstoncoffee-server.onrender.com/api/cart/add', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ productId: productId, quantity: 1 }),
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(cartData => {
                            // Optionally, update the cart badge here based on the returned cartData
                            const cartCount = cartData ? cartData.reduce((sum, item) => sum + item.quantity, 0) : 0;
                            updateCartBadge(cartCount);
                            // Redirect to the cart page after adding
                            window.location.href = 'cart.html';
                        })
                        .catch(error => console.error('Error adding to cart:', error));
                    });
                });
            } else {
                console.error("Container element '#section_3 .container .row' not found.");
            }
        })
        .catch(error => console.error('Error loading products:', error));

    function updateCartBadge(count) {
        const badge = document.querySelector('.badge.bg-primary.rounded-pill');
        if (badge) {
            badge.textContent = count;
        }
    }
});