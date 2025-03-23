$(document).ready(function() {
    let productData = []; // Array to hold product data

    // Fetch product data from products.json
    $.getJSON('products/products.json', function(data) {
        productData = data; // Store the fetched data
    });

    $('#productForm').submit(function(event) {
        event.preventDefault();

        const productId = $('#productId').val();
        const product = {
            productId: productId,
            productDescription: $('#productDescription').val(),
            productCategory: $('#productCategory').val(),
            productUnit: $('#productUnit').val(),
            productPrice: parseFloat($('#productPrice').val()),
            productWeight: parseFloat($('#productWeight').val()) || null // Handle optional weight
        };

        const existingIndex = productData.findIndex(p => p.productId === productId);

        if (existingIndex !== -1) {
            // Update existing product
            productData[existingIndex] = product;
            console.log("Product updated:", product);
        } else {
            // Add new product
            productData.push(product);
            console.log("Product added:", product);
        }

        // Update the JSON file (Note: For real apps, use a server-side solution)
        $.ajax({
            url: 'products/products.json',
            type: 'PUT', 
            contentType: 'application/json',
            data: JSON.stringify(productData),
            success: function() {
                console.log('products.json updated successfully');
            },
            error: function(error) {
                console.error('Error updating products.json:', error);
            }
        });
    });

    $('#searchButton').click(function() {
        const searchId = $('#productId').val();
        const foundProduct = productData.find(p => p.productId === searchId);

        if (foundProduct) {
            // Populate form with existing product data
            $('#productDescription').val(foundProduct.productDescription);
            $('#productCategory').val(foundProduct.productCategory);
            $('#productUnit').val(foundProduct.productUnit);
            $('#productPrice').val(foundProduct.productPrice);
            $('#productWeight').val(foundProduct.productWeight);
			console.log("Product found:", foundProduct);
			
        } else {
            // Clear form
            $('#productDescription').val('');
            $('#productCategory').val('');
            $('#productUnit').val('');
            $('#productPrice').val('');
            $('#productWeight').val('');
            console.log("product not found")
        }
    });
});