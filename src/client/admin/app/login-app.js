angular.module("login-app", [
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
  "$window", "$rootScope", function($window, $rootScope) {
    // check login
    $rootScope._isLogin = $.cookie("CurrentUser") && $.cookie("meaning-token");
    if ($rootScope._isLogin) {
      $window.location.href = "/admin";
    }
  }
]);
