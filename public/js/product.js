// product.js
$(document).ready(function() {
    let productData = [];
    let filteredData = [];
    let editingProductId = null;

    $.getJSON('products/products.json', function(data) {
        productData = data;
        filteredData = data;
        populateCategoryFilter(data);
        displayProducts(data);
    });

    function populateCategoryFilter(data) {
        const select = $('#filterCategory');
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
                    <button class="btn btn-primary btn-sm edit-product" data-id="${product.productId}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-product" data-id="${product.productId}">Delete</button>
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
        const product = productData.find(p => p.productId === editingProductId);
        if (product) {
            $('#productModalLabel').text('Edit Product');
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
        const deleteIndex = productData.findIndex(p => p.productId === deleteId);

        if (deleteIndex !== -1) {
            productData.splice(deleteIndex, 1);
            updateProducts();
        }
    });

    $('#saveProduct').click(function() {
        const product = {
            productId: $('#productId').val(),
            productDescription: $('#productDescription').val(),
            productCategory: $('#productCategory').val(),
            productUnit: $('#productUnit').val(),
            productPrice: parseFloat($('#productPrice').val()),
            productWeight: parseFloat($('#productWeight').val()) || null,
            productThumbnail: $('#productThumbnail').val() 
        };

        if (editingProductId) {
            const index = productData.findIndex(p => p.productId === editingProductId);
            if (index !== -1) {
                productData[index] = product;
            }
        } else {
            productData.push(product);
        }

        updateProducts();
        $('#productModal').modal('hide');
    });

    function updateProducts() {
        $.ajax({
            url: 'products/products.json',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(productData),
            success: function() {
                $.getJSON('products/products.json', function(data) {
                    //productData = data;
                    filteredData = data;
                    displayProducts(filteredData);
                    $('#applyFilters').click();
                });
            },
            error: function(error) {
                console.error('Error updating products.json:', error);
            }
        });
    }
});