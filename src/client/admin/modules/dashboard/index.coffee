angular.module('admin-dashboard', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/",
    templateUrl: "/admin/modules/dashboard/index.html"
    controller: 'AdminDashboardCtrl')
])

.controller('AdminDashboardCtrl',
["$scope", "$http", ($scope, $http) ->

])