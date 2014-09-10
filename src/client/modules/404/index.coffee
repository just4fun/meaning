angular.module("404", [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/404",
      templateUrl: "/modules/404/index.html"
      controller: "NotFoundCtrl")
])

.controller("NotFoundCtrl",
["$scope", "$http", "$rootScope",
  ($scope, $http, $rootScope) ->
    $rootScope.title = "Not Found"
])