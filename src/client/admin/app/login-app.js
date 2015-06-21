angular.module("login-app", ["customServices"]).controller("LoginCtrl", [
  "$scope", "$rootScope", "$http", "$window", "authorize", function($scope, $rootScope, $http, $window, authorize) {
    $rootScope.MEANING = MEANING;
    return $scope.login = function() {
      return authorize.login($scope.user).then(function() {
        return $window.location.href = "/admin";
      }, function(error) {
        $scope.user.Password = "";
        return $scope.error = error;
      });
    };
  }
]).run([
  "$window", "$rootScope", function($window, $rootScope) {
    $rootScope._isLogin = $.cookie("CurrentUser") && $.cookie("meaning-token");
    if ($rootScope._isLogin) {
      return $window.location.href = "/admin";
    }
  }
]);
