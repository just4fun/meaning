angular.module("home", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/", {
      templateUrl: "/modules/home/index.html",
      controller: "HomeCtrl"
    });
  }
]).controller("HomeCtrl", [
  "$scope", "$http", "$rootScope", function($scope, $http, $rootScope) {
    return $rootScope.title = "";
  }
]);
