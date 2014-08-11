angular.module("login-app",
["customServices"
])

.controller('LoginCtrl',
["$scope", "$http", "$window", "progress",
  ($scope, $http, $window, progress) ->
    $scope.login = ->
      progress.start()
      $scope.error = ''
      $http.post("#{MEANING.ApiAddress}/login", $scope.user)
        .success (user, status, headers, config)->
          progress.complete()
          $.cookie('CurrentUser', angular.toJson(user), {expires: 180, path: '/'})
          $.cookie('meaning-token', headers('meaning-token'), {expires: 180, path: '/'})
          $window.location.href = "/admin"
        .error (error) ->
          debugger
          progress.complete()
          $scope.user.Password = ''
          $scope.error = error.Message
])

#check login
.run(["$window", "$rootScope", ($window, $rootScope) ->
    $rootScope._isLogin = !!$.cookie('CurrentUser')
    if $rootScope._isLogin
      $window.location.href = "/admin"
])