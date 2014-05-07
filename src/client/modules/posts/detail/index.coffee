angular.module('posts-view', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/posts/:id",
      templateUrl: "/modules/posts/detail/index.html"
      controller: 'PostsDetailCtrl')
])

.controller('PostsDetailCtrl',
["$scope", "$http", "$window", "progress", "$routeParams", "$sce",
  ($scope, $http, $window, progress, $routeParams, $sce) ->
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts/#{$routeParams.id}").success (data) ->
      data.Content = $sce.trustAsHtml(data.Content)
      $scope.post = data
      progress.complete()
])