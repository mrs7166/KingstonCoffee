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
            console.log('Contents of $scope.shippingData:', $scope.shippingData); // For debugging

            const dataToSave = {
                firstName: $scope.shippingData.firstName,
                lastName: $scope.shippingData.lastName,
                email: $scope.shippingData.email,
                address: $scope.shippingData.address,
                address2: $scope.shippingData.address2,
                country: $scope.shippingData.country,
                state: $scope.shippingData.state,
                zip: $scope.shippingData.zip,
                sameAddress: $scope.shippingData.sameAddress,
                selectedShippingCost: $scope.shippingData.selectedShippingCost,
                ccName: $scope.shippingData.ccName,       // Include credit card name
                ccNumber: $scope.shippingData.ccNumber,   // Include credit card number
                ccExpiration: $scope.shippingData.ccExpiration, // Include credit card expiration
                ccCvv: $scope.shippingData.ccCvv,         // Include credit card CVV
                cartItems: $scope.cart,
                shippingAmount: $scope.shippingCost,
                totalAmount: $scope.total
            };

            console.log('Data being sent to backend:', dataToSave); // For debugging

            $http.post('https://kingstoncoffee-server.onrender.com/api/checkout/shipping', dataToSave)
                .then(function(response) {
                    console.log('Shipping and payment information saved successfully:', response.data);
                    alert('Shipping and payment information saved!');
                    window.location.href = 'order-confirmation.html';
                })
                .catch(function(error) {
                    console.error('Error saving shipping and payment information:', error);
                    alert('Error saving shipping and payment information.');
                });
        };

        $scope.fetchCart();
    }]);