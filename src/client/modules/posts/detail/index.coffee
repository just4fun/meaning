angular.module("posts-view", [])

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
["$scope", "$http", "$window", "progress", "$routeParams", "$location", "$rootScope", "post", "messenger", "authorize",
  ($scope, $http, $window, progress, $routeParams, $location, $rootScope, post, messenger, authorize) ->
    $rootScope.title = post.Title
    $scope.post = post

    $scope.canEdit = () ->
      currentUser = $rootScope._loginUser

      if !currentUser
        return false
      if currentUser.Role isnt "Admin" and currentUser.UserName isnt post.Author.UserName
        return false

      return true

    #init comment author info
    loginUser = $rootScope._loginUser
    commentAuthor = angular.fromJson($.cookie("comment-author"))
    $scope.entity = {
      Post: post._id
    }
    if loginUser
      $scope.entity.Author = loginUser.UserName
      $scope.entity.Email = loginUser.Email
    else if commentAuthor
      $scope.entity.Author = commentAuthor.Author
      $scope.entity.Email = commentAuthor.Email

    $scope.publish = () ->
      $scope.submitted = true
      return if $scope.form.$invalid

      $http.post("#{MEANING.ApiAddress}/comments", $scope.entity)
      .success (data) ->
        messenger.success "Publish comment successfully!"
        getCommentList()
        #save author info in cookie
        if !loginUser
          $.cookie("comment-author", angular.toJson({
            Author: $scope.entity.Author
            Email: $scope.entity.Email
          }), {expires: 180, path: "/"})
        $scope.entity.Content = ""
        $scope.submitted = false
      .error (err) ->
        progress.complete()
        $scope.submitted = false

    $scope.del = (comment) ->
      messenger.confirm ->
        progress.start()
        $http.delete("#{MEANING.ApiAddress}/comments/#{comment._id}",
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          messenger.success "Delete comment successfully!"
          $scope.comments.splice($scope.comments.indexOf(comment), 1)
          progress.complete()
        .error (err) ->
          progress.complete()

    $scope.logout = ->
      messenger.confirm ->
        authorize.logout()
        #read comment author info from cookie
        commentAuthor = angular.fromJson($.cookie("comment-author"))
        if commentAuthor
          $scope.entity.Author = commentAuthor.Author
          $scope.entity.Email = commentAuthor.Email
          $scope.entity.Content = ""
        else
          $scope.entity = {
            Post: post._id
          }
        $scope.$apply()

    getCommentList = () ->
      progress.start()
      $http.get("#{MEANING.ApiAddress}/posts/#{post._id}/comments").success (data) ->
        $scope.comments = data
        progress.complete()

    getCommentList()
])