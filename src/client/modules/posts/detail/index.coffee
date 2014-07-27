angular.module('posts-view', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/posts/:year/:month/:day/:url",
      templateUrl: "/modules/posts/detail/index.html"
      controller: "PostsDetailCtrl"
      resolve:
        post: ["$q", "$http", "$route", "$location", "$rootScope",
          ($q, $http, $route, $location, $rootScope) ->
            url = $route.current.params.url

            #to avoid "/posts/count" route being fired
            if url.toLowerCase() is "count"
              $location.path "/404"
              return

            deferred = $q.defer()
            $http.get("#{MEANING.ApiAddress}/posts/#{url}")
            .success (data) ->
              deferred.resolve data
            deferred.promise
        ]
    )
])

.controller("PostsDetailCtrl",
["$scope", "$http", "$window", "progress", "$routeParams", "$location", "$rootScope", "post",
  ($scope, $http, $window, progress, $routeParams, $location, $rootScope, post) ->
    $scope.post = post

    $scope.canEdit = () ->
      currentUser = $rootScope._loginUser

      if !currentUser
        return false
      if currentUser.Role isnt "Admin" and currentUser.UserName isnt post.Author.UserName
        return false

      return true
])