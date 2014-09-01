angular.module("guestbook", [])

.config(["$routeProvider",
    ($routeProvider) ->
      $routeProvider
      .when("/guestbook",
        templateUrl: "/modules/guestbook/index.html"
        controller: "GuestbookCtrl")
  ])

.controller("GuestbookCtrl",
["$scope", "$http", "$rootScope", "progress", "messenger",
  ($scope, $http, $rootScope, progress, messenger) ->
    #init comment author info
    loginUser = $rootScope._loginUser
    commentAuthor = angular.fromJson($.cookie("comment-author"))
    $scope.entity = {}
    if loginUser
      $scope.entity.Author = loginUser.UserName
      $scope.entity.Email = loginUser.Email
    else if commentAuthor
      $scope.entity.Author = commentAuthor.Author
      $scope.entity.Email = commentAuthor.Email

    $scope.publish = () ->
      $scope.submitted = true
      return if $scope.form.$invalid

      $http.post("#{MEANING.ApiAddress}/comment", $scope.entity)
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
        $http.delete("#{MEANING.ApiAddress}/comment/#{comment._id}",
          headers:
            "meaning-token": $.cookie("meaning-token")
            "login-user": $.cookie("CurrentUser")
        )
        .success (data) ->
          messenger.success "Delete comment successfully!"
          $scope.comments.splice($scope.comments.indexOf(comment), 1)
          progress.complete()
        .error (err) ->
          progress.complete()

    $scope.logout = ->
      messenger.confirm ->
        $.removeCookie("CurrentUser", { path: "/" })
        $.removeCookie("meaning-token", { path: "/" })
        $rootScope._loginUser = undefined
        #read comment author info from cookie
        commentAuthor = angular.fromJson($.cookie("comment-author"))
        if commentAuthor
          $scope.entity.Author = commentAuthor.Author
          $scope.entity.Email = commentAuthor.Email
          $scope.entity.Content = ""
        else
          $scope.entity = {}
        $scope.$apply()

    getCommentList = () ->
      progress.start()
      $http.get("#{MEANING.ApiAddress}/comments/guestbook").success (data) ->
        $scope.comments = data
        progress.complete()

    getCommentList()
])