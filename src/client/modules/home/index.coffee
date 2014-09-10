angular.module("home", [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/",
      templateUrl: "/modules/home/index.html"
      controller: "HomeCtrl")
])

.controller("HomeCtrl",
["$scope", "$http", "$rootScope",
  ($scope, $http, $rootScope) ->
    $rootScope.title = ""
])