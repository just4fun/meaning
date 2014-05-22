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
    .when("/posts/tag/:tag",
      templateUrl: "/modules/posts/list/index.html"
      controller: 'TagPostsListCtrl')
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
    $scope.filterText = "Author"
    $scope.filter = $routeParams.author
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts/author/#{$routeParams.author}").success (data) ->
      $scope.posts = data
      progress.complete()
])

.controller('TagPostsListCtrl',
["$scope", "$http", "$rootScope", "$routeParams", "progress",
  ($scope, $http, $rootScope, $routeParams, progress) ->
    $scope.isAllList = false
    $scope.filterText = "Tag"
    $scope.filter = $routeParams.tag
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts/tag/#{$routeParams.tag}").success (data) ->
      $scope.posts = data
      progress.complete()
])