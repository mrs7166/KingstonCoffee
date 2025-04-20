angular.module('returnsApp', [])
        .controller('returnsController', function ($scope, $http) {
            $scope.products = [];
            $scope.searchedProducts = [];
            $scope.returnItems = [];
            $scope.searchQuery = "";
            $scope.returnMessage = "";

            $http.get('products/products.json').then(function (response) {
                $scope.products = response.data;
            })
            .catch(function (error) {
                console.error("Error loading products:", error);
                $scope.errorMessage = "Failed to load product data. Please try again later.";
            });

            $scope.searchProducts = function () {
                if ($scope.searchQuery) {
                    $scope.searchedProducts = $scope.products.filter(product => {
                        return product && product.productDescription && typeof product.productDescription === 'string' &&
                               product.productDescription.toLowerCase().includes($scope.searchQuery.toLowerCase());
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
				
                // Prepare the return data
                const returnData = {
                    returnId: generateReturnId(), // You'll need a function to generate a unique ID
                    submissionDate: new Date().toISOString(),
                    items: $scope.returnItems
                };

                // Use $http to post the return data to a JSON file
                $http.post('http://localhost:3000/returns/returns.json', returnData) // Changed URL
				.then(response => {
					$scope.returnMessage = "Return request submitted successfully. Your return ID is: " + returnData.returnId;
					$scope.returnItems = [];
				}, error => {
					console.error("Error submitting return request:", error);
					$scope.returnMessage = "Error submitting return request. Please try again later.";
				});
            };

            // Function to generate a unique return ID (you can customize this)
            function generateReturnId() {
                return 'RET-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
            }
        });