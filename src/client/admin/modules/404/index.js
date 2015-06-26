angular.module("404", []).config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/404", {
      templateUrl: "/admin/modules/404/index.html",
      controller: "NotFoundCtrl"
    });
  }
]).controller("NotFoundCtrl", [
  "$scope", "$http", "$rootScope", function($scope, $http, $rootScope) {
    $rootScope.title = "Not Found";
  }
]);
