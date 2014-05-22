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

#Create
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

#Update
.controller('AdminPostsDetailCtrl',
["$scope", "$http", "$rootScope", "$window", "$routeParams", "post",
  ($scope, $http, $rootScope, $window, $routeParams, post) ->
    if post.Tags and post.Tags.length > 0
      tags = []
      for t in post.Tags
        tags.push t.TagName
      post.Tags = tags.join(",")

    $scope.post = post

    $scope.submitText = "Update"
    $scope.publish = ->
      $scope.post.EditUser = $rootScope._loginUser.Username
      $http.put("#{MEANING.ApiAddress}/posts/#{$routeParams.url}", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
      .success (data) ->
        $window.location.href = "/#!/posts/#{data.Url}"
])