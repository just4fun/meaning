angular.module("about", [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/about",
      templateUrl: "/modules/about/index.html"
      controller: "AboutCtrl")
])

.controller("AboutCtrl",
["$scope", "$http", "$rootScope",
  ($scope, $http, $rootScope) ->
    $rootScope.title = "About"
])