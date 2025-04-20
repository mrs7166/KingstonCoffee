// product.js
$(document).ready(function() {
    let productData = [];
    let filteredData = [];
    let editingProductId = null;

    // Fetch products from the backend API
    $.getJSON('https://kingstoncoffee-server.onrender.com/api/products', function(data) {
        productData = data;
        filteredData = data;
        populateCategoryFilter(data);
        displayProducts(data);
    }).fail(function(jqxhr, textStatus, error) {
        const err = textStatus + ", " + error;
        console.error("Request Failed: " + err);
        $('#productGrid').html('<p class="error">Failed to load products.</p>'); // Display an error message
    });

    function populateCategoryFilter(data) {
        const select = $('#filterCategory');
        select.empty().append('<option value="">All Categories</option>'); // Add default option
        const categories = [...new Set(data.map(product => product.productCategory))];
        categories.forEach(category => {
            select.append(`<option value="${category}">${category}</option>`);
        });
    }

    function displayProducts(data) {
        const grid = $('#productGrid');
        grid.empty();
        data.forEach(product => {
            grid.append(`
                <div class="product-item">
                    <h5 style="color: white;">${product.productId}</h5>
                    <p>${product.productDescription}</p>
                    <p>Category: ${product.productCategory}</p>
                    <p>Price: $${product.productPrice}</p>
                    <button class="btn btn-primary btn-sm edit-product" data-id="${product._id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-product" data-id="${product._id}">Delete</button>
                    <img src="${product.productThumbnail || 'images/products/soon.jpg'}" alt="${product.productDescription}" style="width: 50px; height: 50px; margin-left: 10px;">
                </div>
            `);
        });
    }

    $('#applyFilters').click(function() {
        const categoryFilter = $('#filterCategory').val();
        const priceFilter = parseFloat($('#filterPrice').val()) || Infinity;
        const keywordFilter = $('#filterKeyword').val().toLowerCase();

        filteredData = productData.filter(product => {
            const categoryMatch = categoryFilter ? product.productCategory === categoryFilter : true;
            const priceMatch = product.productPrice <= priceFilter;
            const keywordMatch = product.productDescription.toLowerCase().includes(keywordFilter);
            return categoryMatch && priceMatch && keywordMatch;
        });

        displayProducts(filteredData);
    });

    $('#addProductButton').click(function() {
        editingProductId = null;
        $('#productModalLabel').text('Add Product');
        $('#_id').val(''); // MongoDB uses _id
        $('#productId').val('');
        $('#productDescription').val('');
        $('#productCategory').val('');
        $('#productUnit').val('');
        $('#productPrice').val('');
        $('#productWeight').val('');
        $('#productThumbnail').val('');
        $('#productModal').modal('show');
    });

    $('#productGrid').on('click', '.edit-product', function() {
        editingProductId = $(this).data('id');
        const product = productData.find(p => p._id === editingProductId); // MongoDB uses _id
        if (product) {
            $('#productModalLabel').text('Edit Product');
            $('#_id').val(product._id); // Populate _id for update
            $('#productId').val(product.productId);
            $('#productDescription').val(product.productDescription);
            $('#productCategory').val(product.productCategory);
            $('#productUnit').val(product.productUnit);
            $('#productPrice').val(product.productPrice);
            $('#productWeight').val(product.productWeight || '');
            $('#productThumbnail').val(product.productThumbnail || '');
            $('#productModal').modal('show');
        }
    });

    $('#productGrid').on('click', '.delete-product', function() {
        const deleteId = $(this).data('id');
        if (confirm('Are you sure you want to delete this product?')) {
            $.ajax({
                url: `https://kingstoncoffee-server.onrender.com/api/products/${deleteId}`,
                type: 'DELETE',
                success: function(response) {
                    console.log('Product deleted:', response);
                    // Reload product data after successful deletion
                    $.getJSON('https://kingstoncoffee-server.onrender.com/api/products', function(newData) {
                        productData = newData;
                        filteredData = newData;
                        displayProducts(filteredData);
                        $('#applyFilters').click();
                    }).fail(function(jqxhr, textStatus, error) {
                        console.error("Failed to reload products after deletion: " + textStatus + ", " + error);
                        $('#productGrid').html('<p class="error">Failed to reload products.</p>');
                    });
                },
                error: function(error) {
                    console.error('Error deleting product:', error);
                    alert('Error deleting product.');
                }
            });
        }
    });

    $('#saveProduct').click(function() {
        const product = {
            _id: $('#_id').val() || undefined, // Include _id for updates
            productId: $('#productId').val(),
            productDescription: $('#productDescription').val(),
            productCategory: $('#productCategory').val(),
            productUnit: $('#productUnit').val(),
            productPrice: parseFloat($('#productPrice').val()),
            productWeight: parseFloat($('#productWeight').val()) || null,
            productThumbnail: $('#productThumbnail').val()
        };

        updateProducts(product);
        $('#productModal').modal('hide');
    });

    function updateProducts(product) {
        const method = product._id ? 'PUT' : 'POST';
        const url = product._id ? `https://kingstoncoffee-server.onrender.com/api/products/${product._id}` : 'https://kingstoncoffee-server.onrender.com/api/products';

        $.ajax({
            url: url,
            type: method,
            contentType: 'application/json',
            data: JSON.stringify(product),
            success: function(response) {
                console.log('Product updated/added:', response);
                // Reload product data after successful update/add
                $.getJSON('https://kingstoncoffee-server.onrender.com/api/products', function(newData) {
                    productData = newData;
                    filteredData = newData;
                    displayProducts(filteredData);
                    $('#applyFilters').click(); // Reapply filters if needed
                }).fail(function(jqxhr, textStatus, error) {
                    console.error("Failed to reload products after update: " + textStatus + ", " + error);
                    $('#productGrid').html('<p class="error">Failed to reload products.</p>');
                });
            },
            error: function(error) {
                console.error('Error updating/adding product:', error);
                alert('Error saving product.'); // Inform the user
            }
        });
    }
});