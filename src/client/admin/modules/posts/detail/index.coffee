angular.module('admin-posts-detail', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts/new",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsDetailCtrl')
  .when("/posts/:id",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsDetailCtrl')
])

.controller('AdminPostsDetailCtrl',
["$scope", "$http", "$rootScope", "$window", "$routeParams",
  ($scope, $http, $rootScope, $window, $routeParams) ->
    isNew = !$routeParams.id
    if isNew
      $scope.submitText = "Publish"
      $scope.publish = ->
        $scope.post.Author = $rootScope._loginUser.Username
        $http.post("#{MEANING.ApiAddress}/posts", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
          .success (data) ->
            $window.location.href = "/#!/posts/#{data._id}"
    else
      $scope.submitText = "Update"
      $scope.publish = ->
        $scope.post.EditUser = $rootScope._loginUser.Username
        $http.put("#{MEANING.ApiAddress}/posts/#{$routeParams.id}", $scope.post, {headers:{'meaning-token':$.cookie('meaning-token')}})
          .success (data) ->
            $window.location.href = "/#!/posts/#{data._id}"
      $http.get("#{MEANING.ApiAddress}/posts/#{$routeParams.id}").success (data) ->
        $scope.post = data
])