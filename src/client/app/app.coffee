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
  $httpProvider.interceptors.push ["$rootScope", "$q", "messenger", "$location",
    ($rootScope, $q, messenger, $location) ->
      {
        response: (res) ->
          res

        responseError: (res) ->
          if res.status is 404
            $location.path "/404"
          else if res.data and res.data.Message
            messenger.error res.data.Message
          $q.reject res
      }
  ]
])

.config(["$routeProvider", ($routeProvider) ->
  $routeProvider.otherwise redirectTo: "/404"
])

.run(() ->
  #init Messenger position
  Messenger.options = {
    extraClasses: "messenger-fixed messenger-on-top"
  }
)

#show loading when route change
.run(["$rootScope", "progress", ($rootScope, progress) ->
  $rootScope.$on "$routeChangeStart", ->
    progress.start()

  $rootScope.$on "$routeChangeSuccess", ->
    progress.complete()

    #hide responsive navbar when route change on handheld
    $rootScope._isNavDisplay = false
])

.run(["$rootScope", ($rootScope) ->
  $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"))
])

.controller("NavCtrl",
["$scope", "$http", "$location", "$rootScope",
  ($scope, $http, $location, $rootScope) ->
    #site global config
    $rootScope.MEANING = MEANING
    $rootScope._isNavDisplay = false

    $scope.toggleCollapsibleMenu = ->
      $rootScope._isNavDisplay = !$rootScope._isNavDisplay

    $scope.isActive = (path) ->
      path is $location.path()

    $scope.isPostActive = () ->
      $location.path() is "/posts" or
      $location.path().indexOf("/posts/") > -1
])