angular.module("admin-users", [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/users",
    templateUrl: "/admin/modules/users/index.html"
    controller: "AdminUsersCtrl"
    resolve:
      check: ["$q", "$http", "$rootScope", "$location",
        ($q, $http, $rootScope, $location) ->
          if $rootScope._loginUser.Role isnt "Admin"
            $location.path "/"
      ]
  )
])

.controller("AdminUsersCtrl",
["$scope", "$http", "$rootScope", "messenger", "progress",
  ($scope, $http, $rootScope, messenger, progress) ->
    $rootScope.title = "Users"

    $scope.create = ->
      $scope.modalTitle = "Create"
      $scope.iconDialog = true

    $scope.close = ->
      $scope.iconDialog = false
      $scope.entity = null

    $scope.edit = (user) ->
      $scope.entity = angular.copy user
      $scope.modalTitle = "Update"
      $scope.iconDialog = true

    $scope.del = (user) ->
      messenger.confirm ->
        progress.start()
        $http.delete("#{MEANING.ApiAddress}/users/#{user._id}",
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          messenger.success "Delete user successfully!"
          $scope.getUserList(1)
        .error (err) ->
          progress.complete()

    $scope.save = ->
      #Update
      if $scope.entity._id
        if $scope.entity.NewPassword and !$scope.entity.RePassword
          messenger.error "Please confirm Password."
          return
        if $scope.entity.NewPassword and $scope.entity.RePassword and
        $scope.entity.NewPassword isnt $scope.entity.RePassword
          messenger.error "The RePassword mismatch Password."
          return

        $scope.entity.EditUser = $rootScope._loginUser.UserName
        $scope.entity.EditDate = new Date()
        $scope.entity.Password = $scope.entity.NewPassword
        delete $scope.entity.RePassword

        progress.start()
        $http.put("#{MEANING.ApiAddress}/users/#{$scope.entity._id}",
          $scope.entity,
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          #update cookie and global variable
          if $scope.entity._id is $rootScope._loginUser._id
            user = angular.fromJson($.cookie("CurrentUser"))
            user.UserName = $scope.entity.UserName
            user.Email = $scope.entity.Email
            #if update role here, a user from admin to author will own no right immediately
            #user.Role = $scope.entity.Role
            $.cookie("CurrentUser", angular.toJson(user), {expires: 180, path: "/"})
            #update global variable
            $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"))

          messenger.success "Update user successfully!"
          $scope.close()
          $scope.getUserList($scope.currentPage)
        .error (err) ->
          progress.complete()
      #Create
      else
        if !$scope.entity.NewPassword
          messenger.error "Password is required."
          return
        if !$scope.entity.RePassword
          messenger.error "Please confirm Password."
          return
        if $scope.entity.NewPassword isnt $scope.entity.RePassword
          messenger.error "The RePassword mismatch Password ."
          return

        $scope.entity.Password = $scope.entity.NewPassword
        delete $scope.entity.RePassword

        progress.start()
        $http.post("#{MEANING.ApiAddress}/user",
          $scope.entity,
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          messenger.success "Create user successfully!"
          $scope.close()
          $scope.getUserList(1)
        .error (err) ->
          progress.complete()

    $scope.getUserList = (page) ->
      progress.start()
      $scope.currentPage = page
      $http.get("#{MEANING.ApiAddress}/users?pageIndex=#{page - 1}",
        headers:
          "meaning-token": $.cookie("meaning-token")
      )
      .success (data) ->
        $scope.users = data.list
        $scope.totalCount = data.totalCount
        progress.complete()

    $scope.getUserList(1)
])