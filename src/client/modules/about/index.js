angular.module("about", []).config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/about", {
      templateUrl: "/modules/about/index.html",
      controller: "AboutCtrl"
    });
  }
]).controller("AboutCtrl", [
  "$scope", "$http", "$rootScope",
  function($scope, $http, $rootScope) {
    $rootScope.title = "About";
  }
]);
