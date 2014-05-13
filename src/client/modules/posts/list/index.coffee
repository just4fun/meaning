angular.module('posts-list', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/posts",
      templateUrl: "/modules/posts/list/index.html"
      controller: 'PostsListCtrl')
    .when("/posts/author/:author",
      templateUrl: "/modules/posts/list/index.html"
      controller: 'AuthorPostsListCtrl')
])

.controller('PostsListCtrl',
["$scope", "$http", "progress", ($scope, $http, progress) ->
  $scope.isAllList = true
  progress.start()
  $http.get("#{MEANING.ApiAddress}/posts").success (data) ->
    $scope.posts = data
    progress.complete()
])

.controller('AuthorPostsListCtrl',
["$scope", "$http", "$rootScope", "$routeParams", "progress",
  ($scope, $http, $rootScope, $routeParams, progress) ->
    $scope.isAllList = false
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts/author/#{$routeParams.author}").success (data) ->
      $scope.posts = data
      progress.complete()
])