angular.module('returnsApp', [])
    .controller('returnsController', function ($scope, $http) {
        $scope.products = [];
        $scope.searchedProducts = [];
        $scope.returnItems = [];
        $scope.searchQuery = "";
        $scope.returnMessage = "";
        $scope.errorMessage = "";

        // --- Fetch Products from Backend ---
        $scope.loadProducts = function() {
            $http.get('https://kingstoncoffee-server.onrender.com/api/products') // Adjust the API endpoint if needed
                .then(function (response) {
                    $scope.products = response.data;
                })
                .catch(function (error) {
                    console.error("Error loading products:", error);
                    $scope.errorMessage = "Failed to load product data. Please try again later.";
                });
        };

        $scope.searchProducts = function () {
            if ($scope.searchQuery) {
                $http.get(`https://kingstoncoffee-server.onrender.com/api/products/search?query=${$scope.searchQuery}`)
                    .then(function (response) {
                        $scope.searchedProducts = response.data;
                    })
                    .catch(function (error) {
                        console.error("Error searching products:", error);
                        $scope.errorMessage = "Failed to search products. Please try again later.";
                    });
            } else {
                $scope.searchedProducts = [];
            }
        };

        $scope.addProductToReturn = function (product) {
            const alreadyInList = $scope.returnItems.some(item => item.productId === product.productId);
            if (!alreadyInList) {
                $scope.returnItems.push({
                    productId: product.productId,
                    productDescription: product.productDescription,
                    price: product.productPrice,
                    imageUrl: product.productThumbnail,
                    reason: "",
                    condition: "",
                    returnDetails: ""
                });
            } else {
                $scope.returnMessage = "This product is already in your return list.";
                setTimeout(() => $scope.returnMessage = "", 3000);
            }
            $scope.searchQuery = "";
            $scope.searchedProducts = [];
        };

        $scope.removeItem = function (item) {
            $scope.returnItems = $scope.returnItems.filter(i => i !== item);
        };

        $scope.submitReturn = function () {
            if ($scope.returnItems.some(item => !item.reason || !item.condition)) {
                $scope.returnMessage = "Please provide reason and condition for all items.";
                return;
            }

            const returnData = {
                items: $scope.returnItems
            };

            $http.post('https://kingstoncoffee-server.onrender.com/api/returns/submit', returnData)
                .then(response => {
                    $scope.returnMessage = "Return request submitted successfully. Your return ID is: " + response.data.returnId; // Assuming your backend returns a returnId
                    $scope.returnItems = [];
                }, error => {
                    console.error("Error submitting return request:", error);
                    $scope.returnMessage = "Error submitting return request. Please try again later.";
                });
        };

        // Load products when the controller initializes
        $scope.loadProducts();
    });