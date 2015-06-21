angular.module("about", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/about", {
      templateUrl: "/modules/about/index.html",
      controller: "AboutCtrl"
    });
  }
]).controller("AboutCtrl", [
  "$scope", "$http", "$rootScope", function($scope, $http, $rootScope) {
    return $rootScope.title = "About";
  }
]);
