fetch('https://kingstoncoffee-server.onrender.com/api/products')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const container = document.querySelector('#section_3 .container .row');
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
                      data-id="${product.productId}"
                      data-product="${product.productDescription}"
                      data-price="${product.productPrice}">
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

          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          const existingItem = cart.find(item => item.id === productId);

          if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + 1;
          } else {
            cart.push({
              id: productId,
              name: productName,
              price: productPrice,
              quantity: 1
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart));

          window.location.href = 'cart.html';
        });
      });
    } else {
      console.error("Container element '#section_3 .container .row' not found.");
    }
  })
  .catch(error => console.error('Error loading products:', error));