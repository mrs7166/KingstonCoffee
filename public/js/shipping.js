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
            console.log('Contents of $scope.shippingData:', $scope.shippingData); // Keep this for debugging

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
                cartItems: $scope.cart,
                shippingAmount: $scope.shippingCost,
                totalAmount: $scope.total
            };

            console.log('Data being sent to backend:', dataToSave); // Keep this line

            $http.post('https://kingstoncoffee-server.onrender.com/api/checkout/shipping', dataToSave)
                .then(function(response) {
                    console.log('Shipping information saved successfully:', response.data);
                    alert('Shipping and payment information saved!');
                    window.location.href = 'order-confirmation.html';
                })
                .catch(function(error) {
                    console.error('Error saving shipping information:', error);
                    alert('Error saving shipping information.');
                });
        };

        $scope.fetchCart();
    }]);