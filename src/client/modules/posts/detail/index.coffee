angular.module('posts-view', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/posts/:url",
      templateUrl: "/modules/posts/detail/index.html"
      controller: 'PostsDetailCtrl')
])

.controller('PostsDetailCtrl',
["$scope", "$http", "$window", "progress", "$routeParams",
  ($scope, $http, $window, progress, $routeParams) ->
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts/#{$routeParams.url}").success (data) ->
      $scope.post = data
      progress.complete()
])