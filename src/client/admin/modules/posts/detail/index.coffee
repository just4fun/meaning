angular.module('admin-posts-detail', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts/new",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsNewCtrl')
  .when("/posts/:url",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsDetailCtrl'
    resolve:
      post: ['$q', '$http', "$route", ($q, $http, $route) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/posts/#{$route.current.params.url}",
          headers:
            'view-from-admin-console': true
        )
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ])
])

.controller('AdminPostsNewCtrl',
["$scope", "$http", "$rootScope", "$window",
  ($scope, $http, $rootScope, $window) ->
    $scope.submitText = "Publish"
    $scope.publish = ->
      $scope.post.Author = $rootScope._loginUser._id
      $http.post("#{MEANING.ApiAddress}/posts", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
      .success (data) ->
        $window.location.href = "/#!/posts/#{data.Url}"
])

.controller('AdminPostsDetailCtrl',
["$scope", "$http", "$rootScope", "$window", "$routeParams", "post",
  ($scope, $http, $rootScope, $window, $routeParams, post) ->
    $scope.post = post

    $scope.submitText = "Update"
    $scope.publish = ->
      $scope.post.EditUser = $rootScope._loginUser.Username
      $http.put("#{MEANING.ApiAddress}/posts/#{$routeParams.url}", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
      .success (data) ->
        $window.location.href = "/#!/posts/#{data.Url}"
])