angular.module("admin-app", ["ngRoute", "ngSanitize", "ngAnimate", "ngCookies", "customDirectives", "customFilters", "customServices", "admin-modules"]).config([
  "$locationProvider", function($locationProvider) {
    return $locationProvider.html5Mode(false).hashPrefix("!");
  }
]).config([
  "$httpProvider", function($httpProvider) {
    return $httpProvider.interceptors.push([
      "$rootScope", "$q", "messenger", "$location", function($rootScope, $q, messenger, $location) {
        return {
          response: function(res) {
            return res;
          },
          responseError: function(res) {
            if (res.status === 404) {
              $location.path("/404");
            } else if (res.data && res.data.Message) {
              messenger.error(res.data.Message);
            }
            return $q.reject(res);
          }
        };
      }
    ]);
  }
]).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.otherwise({
      redirectTo: "/404"
    });
  }
]).run([
  "$window", function($window) {
    $window.CKEDITOR_BASEPATH = "/plugin/ckeditor/";
    return Messenger.options = {
      extraClasses: "messenger-fixed messenger-on-top"
    };
  }
]).run([
  "$rootScope", "progress", function($rootScope, progress) {
    $rootScope.$on("$routeChangeStart", function() {
      return progress.start();
    });
    return $rootScope.$on("$routeChangeSuccess", function() {
      return progress.complete();
    });
  }
]).run([
  "$window", "$rootScope", function($window, $rootScope) {
    $rootScope._isLogin = $.cookie("CurrentUser") && $.cookie("meaning-token");
    if (!$rootScope._isLogin) {
      return $window.location.href = "/login";
    }
  }
]).controller("AdminCtrl", [
  "$scope", "$rootScope", "$http", "$window", "$location", "progress", "messenger", "authorize", function($scope, $rootScope, $http, $window, $location, progress, messenger, authorize) {
    $rootScope.MEANING = MEANING;
    $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"));
    $scope.isActive = function(path) {
      return path === $location.path();
    };
    $scope.isPostActive = function() {
      return $location.path() === "/posts" || $location.path().indexOf("/posts/") > -1;
    };
    $scope.logout = function() {
      authorize.logout();
      return $window.location.href = "/login";
    };
    $scope.changeProfile = function() {
      $scope.entity = angular.copy($rootScope._loginUser);
      return $scope.profileDialog = true;
    };
    $scope.save = function() {
      if ($scope.entity.NewPassword && !$scope.entity.RePassword) {
        messenger.error("Please confirm Password.");
        return;
      }
      if ($scope.entity.NewPassword && $scope.entity.RePassword && $scope.entity.NewPassword !== $scope.entity.RePassword) {
        messenger.error("The RePassword mismatch Password.");
        return;
      }
      $scope.entity.EditUser = $rootScope._loginUser.UserName;
      $scope.entity.EditDate = new Date();
      $scope.entity.Password = $scope.entity.NewPassword;
      delete $scope.entity.RePassword;
      progress.start();
      return $http.put("" + MEANING.ApiAddress + "/users/" + $scope.entity._id, $scope.entity, {
        headers: {
          "meaning-token": $.cookie("meaning-token")
        }
      }).success(function(data) {
        var user;
        progress.complete();
        user = angular.fromJson($.cookie("CurrentUser"));
        user.UserName = $scope.entity.UserName;
        user.Email = $scope.entity.Email;
        $.cookie("CurrentUser", angular.toJson(user), {
          expires: 180,
          path: "/"
        });
        $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"));
        messenger.success("Change profile successfully!");
        return $scope.close();
      }).error(function(err) {
        return progress.complete();
      });
    };
    return $scope.close = function() {
      $scope.profileDialog = false;
      return $scope.entity = null;
    };
  }
]);
