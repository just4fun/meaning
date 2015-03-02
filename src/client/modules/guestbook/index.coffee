angular.module("guestbook", [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/guestbook",
      templateUrl: "/modules/guestbook/index.html"
      controller: "GuestbookCtrl")
])

.controller("GuestbookCtrl",
["$scope", "$http", "$rootScope", "progress", "messenger", "authorize",
  ($scope, $http, $rootScope, progress, messenger, authorize) ->
    $rootScope.title = "Guestbook"

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
      $http.post("#{MEANING.ApiAddress}/comments", $scope.entity)
      .success (data) ->
        messenger.success "Publish comment successfully!"
        $scope.comments.push data
        #save author info in cookie
        if !loginUser
          $.cookie("comment-author", angular.toJson({
            Author: $scope.entity.Author
            Email: $scope.entity.Email
          }), {expires: 180, path: "/"})
        $scope.entity.Content = ""
      .error (err) ->
        progress.complete()

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

    getCommentList = () ->
      progress.start()
      $http.get("#{MEANING.ApiAddress}/comments/guestbook").success (data) ->
        $scope.comments = data
        progress.complete()

    getCommentList()
])