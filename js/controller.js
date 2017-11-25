(function () {
	var app = angular.module('myApp', ['ngRoute']);
	
	app.config(function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl : '../views/fragments/login.html'
		})
		.when('/register', {
			templateUrl : '../views/fragments/register.html',
			controller : "registerController"
		});
	});

	
	app.controller('registerController', function($scope, $http, $window){
		
			$scope.registerUser = function() {
				var sendingData={};
				sendingData['firstname'] = $scope.register.firstname;
				sendingData['lastname'] = $scope.register.lastname;
				sendingData['email'] = $scope.register.email;
				sendingData['password'] = $scope.register.password;
		
				$http.post("/api/signup",JSON.stringify(sendingData)).success(function(response){
						if(response=="true"){
							$window.location.href = "/";
						} else {
							alert("Oopss..!! Something went wrong");
						}
				})
				.error(function(response,status){
					alert("Oopss..!! Something went wrong");
				});
		};
		
	});
	
	app.controller('homepageController', function($scope, $http, $window){
		
		$scope.loadUserData = function(){
			$http.get("/api/getCurrentUserInfo").success(function(response){
				$scope.user = response;
			});
		};
		$scope.loadUserData();
		
		$scope.loadBooksData = function(){
			$http.get("/api/getBooksList").success(function(response){
				$scope.books = response;
			});
		};
		$scope.loadBooksData();
		
		$scope.loadMyBooksData = function(){
			$http.get("/api/getMyBooksList").success(function(response){
				$scope.books = response;
			});
		};
		
		$scope.logout = function(){
			$http.get("/api/logout").success(function(){
				$window.location.href = "/";
			});
		};
		
		$scope.addBook = function(){
			var sendingData={};
			sendingData['book_name'] = $scope.bookname;
			sendingData['author'] = $scope.bookauthor;
			sendingData['description'] = $scope.bookdescription;
			
			$http.post("/api/add_book",JSON.stringify(sendingData)).success(function(response){
				if(response=="true"){
					$("#modelCancelBtn").click();
					$scope.loadBooksData();
					console.log(response);
				} else {
					alert("Oopss..!! Something went wrong");
				}
			})
			.error(function(response,status){
				alert("Oopss..!! Something went wrong");
			});
		};
		
		$scope.deleteBook = function(book_id){
			var sendingData={};
			sendingData['book_id'] = book_id;
			
			$http.post("/api/delete_book",JSON.stringify(sendingData)).success(function(response){
				if(response=="true"){
					$scope.loadBooksData();
					console.log(response);
				} else {
					alert("Oopss..!! Something went wrong");
				}
			})
			.error(function(response,status){
				alert("Oopss..!! Something went wrong");
			});
		};
		
	});
})();