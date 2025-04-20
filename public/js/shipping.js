// js/shipping.js

angular.module('shippingApp', [])
    .controller('shippingController', ['$scope', '$http', function($scope, $http) {
        $scope.shippingData = {};
        $scope.shippingCost = 0.00;
        $scope.subtotal = 0;
        $scope.total = 0;
        $scope.cart = [];

        $scope.fetchCart = function() {
            $http.get('https://kingstoncoffee-server.onrender.com/api/cart')
                .then(function(response) {
                    $scope.cart = response.data;
                    $scope.calculateTotals();
                })
                .catch(function(error) {
                    console.error('Error fetching cart:', error);
                });
        };

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
            $scope.calculateTotals();
        };

        $scope.saveShippingInfo = function() {
            const dataToSave = {
                shippingInfo: $scope.shippingData,
                cartItems: $scope.cart,
                shippingAmount: $scope.shippingCost,
                totalAmount: $scope.total
            };

            // Send the shipping and payment data to the backend
            $http.post('https://kingstoncoffee-server.onrender.com/api/checkout/shipping', dataToSave)
                .then(function(response) {
                    console.log('Shipping information saved successfully:', response.data);
                    alert('Shipping and payment information saved!');
                    // Optionally, redirect to a confirmation page
                    window.location.href = 'order-confirmation.html';
                })
                .catch(function(error) {
                    console.error('Error saving shipping information:', error);
                    alert('Error saving shipping information.');
                    // Optionally, display an error message to the user
                });
        };

        $scope.fetchCart();
    }]);