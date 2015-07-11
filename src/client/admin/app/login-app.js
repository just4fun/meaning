angular.module("login-app", [
  "ngCookies",
  "customServices"
]).controller("LoginCtrl", [
  "$scope", "$rootScope", "$http", "$window", "authorize",
  function($scope, $rootScope, $http, $window, authorize) {
    // site global config
    $rootScope.MEANING = MEANING;

    $scope.login = function() {
      authorize.login($scope.user).then(function() {
        $window.location.href = "/admin";
      }, function(error) {
        $scope.user.Password = "";
        $scope.error = error;
      });
    };
  }
]).run([
  "$window", "$rootScope", "$cookies", function($window, $rootScope, $cookies) {
    // check login
    $rootScope._isLogin = $cookies.get("CurrentUser") && $cookies.get("meaning-token");
    if ($rootScope._isLogin) {
      $window.location.href = "/admin";
    }
  }
]);
