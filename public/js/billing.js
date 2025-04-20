// js/billing.js

angular.module('billingApp', [])
    .controller('billingController', ['$scope', '$http', function($scope, $http) {
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

        // Function to handle the form submission and save billing info
        $scope.saveBillingInfo = function() {
            console.log('Saving Billing Information:', $scope.billingData);

            // Send the billing data to your backend API endpoint
            $http.post('https://kingstoncoffee-server.onrender.com/api/billing-info', $scope.billingData)
                .then(function(response) {
                    console.log('Billing information saved successfully:', response.data);
                    // Optionally, you can redirect the user to the shipping page here
                    window.location.href = 'shipping.html';
                })
                .catch(function(error) {
                    console.error('Error saving billing information:', error);
                    // Optionally, display an error message to the user
                });
        };

        // Function to handle the "Continue to Shipping" button click
        $scope.continueToShipping = function() {
            $scope.saveBillingInfo(); // Call saveBillingInfo when the button is clicked
        };

        // Fetch the cart when the controller is initialized
        $scope.fetchCart();
    }]);