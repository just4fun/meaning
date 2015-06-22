angular.module("admin-app", [
  "ngRoute",
  "ngSanitize",
  "ngAnimate",
  "ngCookies",

  "customDirectives",
  "customFilters",
  "customServices",

  "admin-modules"
]).config([
  "$locationProvider", function($locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix("!");
  }
]).config([
  "$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push([
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
    $routeProvider.otherwise({
      redirectTo: "/404"
    });
  }
]).run([
  "$window", function($window) {
    // init basepath of ckeditor
    $window.CKEDITOR_BASEPATH = "/plugin/ckeditor/";

    // init Messenger position
    Messenger.options = {
      extraClasses: "messenger-fixed messenger-on-top"
    };
  }
]).run([
  "$rootScope", "progress", function($rootScope, progress) {
    // show loading when route change
    $rootScope.$on("$routeChangeStart", function() {
      progress.start();
    });

    $rootScope.$on("$routeChangeSuccess", function() {
      progress.complete();
    });
  }
]).run([
  "$window", "$rootScope", function($window, $rootScope) {
    // check login
    $rootScope._isLogin = $.cookie("CurrentUser") && $.cookie("meaning-token");
    if (!$rootScope._isLogin) {
      $window.location.href = "/login";
    }
  }
]).controller("AdminCtrl", [
  "$scope", "$rootScope", "$http", "$window", "$location", "progress", "messenger", "authorize",
  function($scope, $rootScope, $http, $window, $location, progress, messenger, authorize) {
    // site global config
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
      $window.location.href = "/login";
    };

    // ------------change profile------------

    $scope.changeProfile = function() {
      $scope.entity = angular.copy($rootScope._loginUser);
      $scope.profileDialog = true;
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
        progress.complete();
        // update cookie
        var user = angular.fromJson($.cookie("CurrentUser"));
        user.UserName = $scope.entity.UserName;
        user.Email = $scope.entity.Email;
        $.cookie("CurrentUser", angular.toJson(user), {
          expires: 180,
          path: "/"
        });

        // update global variable
        $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"));

        messenger.success("Change profile successfully!");
        $scope.close();
      }).error(function(err) {
        return progress.complete();
      });
    };

    $scope.close = function() {
      $scope.profileDialog = false;
      $scope.entity = null;
    };
  }
]);
