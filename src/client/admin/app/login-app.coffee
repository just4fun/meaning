angular.module("login-app", [])

.controller('LoginCtrl',
["$scope", "$http", "$window", ($scope, $http, $window) ->
  $scope.login = ->
    $scope.submitting = true
    $scope.error = ''
    $http.post("#{MEANING.ApiAddress}/login", $scope.user)
      .success (user, status, headers, config)->
        $.cookie('CurrentUser', angular.toJson(user), {expires: 180, path: '/'})
        $.cookie('meaning-token', headers('meaning-token'), {expires: 180, path: '/'})
        $scope.submitting = false
        $window.location.href = "/admin"
      .error (error) ->
        debugger
        $scope.submitting = false
        $scope.user.Password = ''
        $scope.error = error.Message
])