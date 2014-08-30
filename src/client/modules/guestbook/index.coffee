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
    $scope.publish = () ->
      # if user is logged in
      loginUser = $rootScope._loginUser
      if loginUser
        $scope.entity = $scope.entity || {}
        $scope.entity.Author = loginUser.UserName
        $scope.entity.Email = loginUser.Email
        # change the validity state
        # $setValidity(validationErrorKey, isValid);
        $scope.form.author.$setValidity("required", true);
        $scope.form.email.$setValidity("required", true);


      $scope.submitted = true
      return if $scope.form.$invalid

      $http.post("#{MEANING.ApiAddress}/comment", $scope.entity)
      .success (data) ->
        messenger.success "Publish comment successfully!"
        getCommentList()
        $scope.entity = {}
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
      $.removeCookie("CurrentUser", { path: "/" })
      $.removeCookie("meaning-token", { path: "/" })
      $rootScope._loginUser = undefined

    getCommentList = () ->
      progress.start()
      $http.get("#{MEANING.ApiAddress}/comments").success (data) ->
        $scope.comments = data
        progress.complete()

    getCommentList()
])