// js/shipping.js

angular.module('shippingApp', [])
    .controller('shippingController', ['$scope', '$http', function($scope, $http) {
        $scope.shippingData = {};
        $scope.shippingCost = 0.00; // Default cost
        $scope.subtotal = 0;
        $scope.total = 0;
        $scope.cart = []; // Will hold cart data from the database

        // Function to fetch the cart items from the backend
        $scope.fetchCart = function() {
            $http.get('https://kingstoncoffee-server.onrender.com/api/cart')
                .then(function(response) {
                    $scope.cart = response.data;
                    $scope.calculateTotals(); // Calculate totals after fetching the cart
                })
                .catch(function(error) {
                    console.error('Error fetching cart:', error);
                });
        };

        // Function to calculate subtotal and total
        $scope.calculateTotals = function() {
            $scope.subtotal = 0;
            angular.forEach($scope.cart, function(item) {
                $scope.subtotal += item.price * item.quantity;
            });
            $scope.total = $scope.subtotal + $scope.shippingCost;
        };

        $scope.updateShippingCost = function() {
            if ($scope.shippingData.selectedShippingCost) {
                $scope.shippingCost = parseFloat($scope.shippingData.selectedShippingCost);
            } else {
                $scope.shippingCost = 0.00;
            }
            $scope.calculateTotals(); // Update total when shipping cost changes
        };

        $scope.saveShippingInfo = function() {
            const dataToSave = {
                shippingInfo: $scope.shippingData,
                cartItems: $scope.cart,
                shippingAmount: $scope.shippingCost,
                totalAmount: $scope.total
            };
            // In a real application, you would likely send this data to your backend
            // using $http.post to save the shipping information and proceed with the order.
            console.log('Shipping Information to Save:', dataToSave);
            localStorage.setItem('checkoutData', JSON.stringify(dataToSave));
            alert('Shipping and cart information saved to local storage (for demonstration)!');
            // You would typically navigate to the payment page here:
            // window.location.href = 'payment.html';
        };

        // Fetch the cart when the page loads
        $scope.fetchCart();
    }]);