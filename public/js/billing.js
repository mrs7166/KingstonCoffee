// js/billing.js

angular.module('shippingApp', [])
    .controller('shippingController', ['$scope', '$http', function($scope, $http) {
        $scope.billingData = {}; // Holds the billing address information
        $scope.cart = [];        // Holds the cart items
        $scope.subtotal = 0;     // Holds the subtotal of the cart
        $scope.total = 0;        // Holds the total (before shipping)

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

        // Function to calculate the subtotal and the total (excluding shipping)
        $scope.calculateTotals = function() {
            $scope.subtotal = 0;
            angular.forEach($scope.cart, function(item) {
                $scope.subtotal += item.price * item.quantity;
            });
            $scope.total = $scope.subtotal; // Total on this page is just the subtotal
        };

        // Function to handle the "Continue to Shipping" button click
        $scope.continueToShipping = function() {
            // You might want to save the billing information to a service or $rootScope
            // so it can be accessed on the shipping page.
            console.log('Billing Information:', $scope.billingData);

            // For now, just navigate to the shipping page
            window.location.href = 'shipping.html';
        };

        // Function to handle the form submission and potentially save billing info
        $scope.saveBillingInfo = function() {
            console.log('Saving Billing Information:', $scope.billingData);
            // In a real application, you would likely send this data to your backend
            // using $http.post to store the billing address.

            // After saving (or if not saving on this page), navigate to the shipping page
            window.location.href = 'shipping.html';
        };

        // Fetch the cart when the controller is initialized
        $scope.fetchCart();
    }]);