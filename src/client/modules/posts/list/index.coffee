angular.module('posts-list', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/posts",
      templateUrl: "/modules/posts/list/index.html"
      controller: 'PostsListCtrl')
])

.controller('PostsListCtrl',
["$scope", "$http", "progress", ($scope, $http, progress) ->
  progress.start()
  $http.get("#{MEANING.ApiAddress}/posts").success (data) ->
    $scope.posts = data
    progress.complete()
])