angular.module("login-app", [
  "customServices"
])

.controller("LoginCtrl",
["$scope", "$rootScope", "$http", "$window", "authorize",
  ($scope, $rootScope, $http, $window, authorize) ->
    #site global config
    $rootScope.MEANING = MEANING

    $scope.login = ->
      authorize.login($scope.user)
      .then ->
        $window.location.href = "/admin"
      , (error) ->
        $scope.user.Password = ""
        $scope.error = error
])

#check login
.run(["$window", "$rootScope", ($window, $rootScope) ->
  $rootScope._isLogin = $.cookie("CurrentUser") and $.cookie("meaning-token")
  if $rootScope._isLogin
    $window.location.href = "/admin"
])