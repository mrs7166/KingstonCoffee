// Define the AngularJS shippingApp
var app = angular.module('shippingApp', []);

// Define the controller
app.controller('shippingController', function($scope, $http) {
    $scope.shippingData = {};
    $scope.shippingCost = 0.00; // Default cost 
    $scope.subtotal = 0;
    $scope.total = 0;
    $scope.cart = JSON.parse(localStorage.getItem('cartForShipping')) || []; // Fetch cart data
    $scope.products = []; // store product details with images

    // AJAX Fetch product details to get images
    $http.get('products/products.json')
        .then(function(response) {
            $scope.products = response.data;
            // add cart items with thumbnail
            $scope.cart.forEach(item => {
                const product = $scope.products.find(p => p.productId === item.id);
                item.thumbnail = product ? product.productThumbnail : 'images/products/soon.jpg';
            });
            $scope.updateTotal(); // Recalculate total
        })
        .catch(function(error) {
            console.error('Error loading products:', error);
        });

    $scope.updateShippingCost = function() {
        if ($scope.shippingData.selectedShippingCost) {
            $scope.shippingCost = parseFloat($scope.shippingData.selectedShippingCost);
        } else {
            $scope.shippingCost = 0.00;
        }
        $scope.updateTotal(); // Update total when shipping cost changes
    };

    $scope.updateTotal = function() {
        let subtotal = 0;
        $scope.cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        $scope.subtotal = subtotal;
        $scope.total = subtotal + $scope.shippingCost;
    };

    $scope.saveShippingInfo = function() {
        const dataToSave = {
            shippingInfo: $scope.shippingData,
            cartItems: $scope.cart,
            shippingAmount: $scope.shippingCost,
            totalAmount: $scope.total
        };
        localStorage.setItem('checkoutData', JSON.stringify(dataToSave));
        alert('Shipping and cart information saved to local storage!');
        // check console for JSON data
    };

    // Initialize the cart display and total on page load
    $scope.updateTotal();
});