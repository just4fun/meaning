angular.module("app", [
  "ngRoute",
  "ngSanitize",
  "ngAnimate",
  "ngCookies",

  "angulartics",
  "angulartics.google.analytics",

  "customDirectives",
  "customFilters",
  "customServices",
  "customModules"

]).config([
  "$locationProvider", function($locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix("!");
  }
]).config([
  "$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push([
      "$rootScope", "$q", "messenger", "$location",
      function($rootScope, $q, messenger, $location) {
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
]).run(function() {
  // init Messenger position
  Messenger.options = {
    extraClasses: "messenger-fixed messenger-on-top"
  };
}).run([
  "$rootScope", "progress", function($rootScope, progress) {
    // show loading when route change
    $rootScope.$on("$routeChangeStart", function() {
      progress.start();
    });

    $rootScope.$on("$routeChangeSuccess", function() {
      progress.complete();

      // hide responsive navbar when route change on handheld
      $rootScope._isNavDisplay = false;
    });
  }
]).run([
  "$rootScope", function($rootScope) {
    $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"));
  }
]).controller("NavCtrl", [
  "$scope", "$http", "$location", "$rootScope",
  function($scope, $http, $location, $rootScope) {
    // site global config
    $rootScope.MEANING = MEANING;
    $rootScope._isNavDisplay = false;

    $scope.toggleCollapsibleMenu = function() {
      $rootScope._isNavDisplay = !$rootScope._isNavDisplay;
    };

    $scope.isActive = function(path) {
      return path === $location.path();
    };

    $scope.isPostActive = function() {
      return $location.path() === "/posts" || $location.path().indexOf("/posts/") > -1;
    };
  }
]);
