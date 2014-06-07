angular.module('admin-posts-detail', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts/new",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsNewCtrl'
    resolve:
      categories: ['$q', '$http', ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/categories")
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ])
  .when("/posts/:url",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsDetailCtrl'
    resolve:
      categories: ['$q', '$http', ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/categories")
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
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
["$scope", "$http", "$rootScope", "$window", "messenger", "categories",
  ($scope, $http, $rootScope, $window, messenger, categories) ->
    $scope.categories = categories
    $scope.submitText = "Publish"

    $scope.publish = ->
      if !$scope.post.Content
        messenger.error "Post content is required."
        return
      $scope.post.Category = $scope.post.Category._id
      $scope.post.Author = $rootScope._loginUser._id
      $http.post("#{MEANING.ApiAddress}/posts", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
      .success (data) ->
        $window.location.href = "/#!/posts/#{data.Url}"
])

#Update
.controller('AdminPostsDetailCtrl',
["$scope", "$http", "$rootScope", "$window", "$routeParams", "post", "messenger", "categories",
  ($scope, $http, $rootScope, $window, $routeParams, post, messenger, categories) ->
    if post.Tags and post.Tags.length > 0
      tags = []
      for t in post.Tags
        tags.push t.TagName
      post.Tags = tags.join(",")
    else
      post.Tags = ""

    $scope.post = post
    $scope.categories = categories
    $scope.submitText = "Update"

    $scope.publish = ->
      if !$scope.post.Content
        messenger.error "Post content is required."
        return
      $scope.post.Category = $scope.post.Category._id
      $scope.post.EditUser = $rootScope._loginUser.Username
      $http.put("#{MEANING.ApiAddress}/posts/#{$routeParams.url}", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
      .success (data) ->
        $window.location.href = "/#!/posts/#{data.Url}"
])