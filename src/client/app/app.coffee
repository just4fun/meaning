angular.module("app", [
  "ngRoute"
  "ngSanitize"
  "ngAnimate"
  "ngCookies"

  "angulartics"
  "angulartics.google.analytics"

  "customDirectives"
  "customFilters"
  "customServices"
  "customModules"
])

.config(["$locationProvider", ($locationProvider) ->
  $locationProvider.html5Mode(false).hashPrefix("!")
])

.config(["$httpProvider", ($httpProvider) ->
  $httpProvider.responseInterceptors.push ["$rootScope", "$q", "messenger", "$location",
    ($rootScope, $q, messenger, $location) ->
      success = (response) ->
        response
      error = (response) ->
        debugger
        if response.status is 404
          $location.path "/404"
        else if response.data and response.data.Message
          messenger.error response.data.Message
        $q.reject(response)
      (promise) ->
        promise.then success, error
  ]
])

.config(["$routeProvider", ($routeProvider) ->
  $routeProvider.otherwise redirectTo: "/404"
])

#show loading when route change
.run(["$rootScope", "progress", ($rootScope, progress) ->
  $rootScope.$on "$routeChangeStart", ->
    progress.start()

  $rootScope.$on "$routeChangeSuccess", ->
    progress.complete()

    #hide responsive navbar when route change on handheld
    $rootScope._isNavDisplay = false;
])

.run(["$rootScope", ($rootScope) ->
  $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"))
])

.controller("NavCtrl",
["$scope", "$http", "$location", "$rootScope",
  ($scope, $http, $location, $rootScope) ->
    $rootScope._isNavDisplay = false;

    $scope.toggleCollapsibleMenu = ->
      $rootScope._isNavDisplay = !$rootScope._isNavDisplay

    $scope.isActive = (path) ->
      path is $location.path()

    $scope.isPostActive = () ->
      $location.path() is "/posts" or
      $location.path().indexOf("/posts/") > -1
])