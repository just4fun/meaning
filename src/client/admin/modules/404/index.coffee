angular.module('404', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/404",
      templateUrl: "/admin/modules/404/index.html"
      controller: 'NotFoundCtrl')
])

.controller('NotFoundCtrl',
["$scope", "$http",
  ($scope, $http) ->

])