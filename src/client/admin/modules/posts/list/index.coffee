angular.module('admin-posts-list', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: 'AdminPostsListCtrl')
])

.controller('AdminPostsListCtrl',
["$scope", "$http", "$rootScope", "$window", "progress",
  ($scope, $http, $rootScope, $window, progress) ->
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts").success (data) ->
      $scope.posts = data
      progress.complete()
])