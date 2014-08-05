angular.module('admin-users', [])

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

.controller('AdminUsersCtrl',
["$scope", "$http", "$rootScope", "messenger", "progress",
  ($scope, $http, $rootScope, messenger, progress) ->
    getUserList = ->
      progress.start();
      $http.get("#{MEANING.ApiAddress}/users")
      .success (data) ->
        $scope.users = data
        progress.complete();

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
        progress.start();
        $http.delete("#{MEANING.ApiAddress}/user/#{user._id}",
          headers:
            'meaning-token': $.cookie('meaning-token')
        )
        .success (data) ->
          $scope.users.splice($scope.users.indexOf(user), 1)
          messenger.success "Delete user successfully!"
          progress.complete();
        .error (err) ->
          progress.complete();

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
        $http.put("#{MEANING.ApiAddress}/user/#{$scope.entity._id}",
          $scope.entity,
          headers:
            'meaning-token': $.cookie('meaning-token')
        )
        .success (data) ->
          messenger.success "Update user successfully!"
          $scope.close()
          getUserList()
        .error (err) ->
          progress.complete();
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
            'meaning-token': $.cookie('meaning-token')
        )
        .success (data) ->
          messenger.success "Create user successfully!"
          $scope.close()
          getUserList()
        .error (err) ->
          progress.complete();

    getUserList()
])