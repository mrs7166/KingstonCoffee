$(document).ready(function() {
        let productData = [];

        $.getJSON('products/products.json', function(data) {  //use JQuery to fetch the JSON data
            productData = data;
            populateProductIdDropdown(data);  //call populate drop down function
        });

        function populateProductIdDropdown(data) {
            const select = $('#productId');
            data.forEach(product => {
                select.append(`<option value="${product.productId}">${product.productId}</option>`);
            });
        }

        $('#productId').change(function() { //Hide new product id field if we're not adding a new product
            if ($(this).val() === 'new') {
                $('#newProductId').show();
            } else {
                $('#newProductId').hide();
            }
        });

        $('#productForm').submit(function(event) {
            event.preventDefault();

            let productId = $('#productId').val();
            if (productId === 'new') {
                productId = $('#newProductId').val();
            }

            const product = {
                productId: productId,
                productDescription: $('#productDescription').val(),
                productCategory: $('#productCategory').val(),
                productUnit: $('#productUnit').val(),
                productPrice: parseFloat($('#productPrice').val()),
                productWeight: parseFloat($('#productWeight').val()) || null
            };

            const existingIndex = productData.findIndex(p => p.productId === productId);

            if (existingIndex !== -1) {
                productData[existingIndex] = product;
                console.log("Product updated:", product);
            } else {
                productData.push(product);
                console.log("Product added:", product);
            }

            $.ajax({  // Call JQuery asynchronously to update the JSON data file with a PUT command. 
                url: 'products/products.json',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(productData),
                success: function() {
                    console.log('products.json updated successfully');
                    $.getJSON('products/products.json', function(data) {
                        productData = data;
                        $('#productId').empty().append('<option value="">-- Select or Add New --</option><option value="new">Add New Product ID</option>');
                        populateProductIdDropdown(data);
                    });
                },
                error: function(error) {
                    console.error('Error updating products.json:', error);
                }
            });
        });

        $('#searchButton').click(function() {  //Allow searching of JSON data by product id.
            const searchId = $('#productId').val();
            const foundProduct = productData.find(p => p.productId === searchId);

            if (foundProduct) {
                $('#productDescription').val(foundProduct.productDescription);
                $('#productCategory').val(foundProduct.productCategory);
                $('#productUnit').val(foundProduct.productUnit);
                $('#productPrice').val(foundProduct.productPrice);
                $('#productWeight').val(foundProduct.productWeight);
                console.log("Product found:", foundProduct);
            } else {
                $('#productDescription').val('');
                $('#productCategory').val('');
                $('#productUnit').val('');
                $('#productPrice').val('');
                $('#productWeight').val('');
                console.log("product not found")
            }
        });
    });