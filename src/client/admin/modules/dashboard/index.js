angular.module("admin-dashboard", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/", {
      templateUrl: "/admin/modules/dashboard/index.html",
      controller: "AdminDashboardCtrl"
    });
  }
]).controller("AdminDashboardCtrl", [
  "$scope", "$http", "$rootScope", function($scope, $http, $rootScope) {
    return $rootScope.title = "Dashboard";
  }
]);
