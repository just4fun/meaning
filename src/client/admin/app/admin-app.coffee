angular.module("admin-app",
['ngRoute'
 'ngSanitize'
 'ngAnimate'
 'ngCookies'

 'customDirectives'
 'customFilters'
 'customServices'

 'admin-modules'
])

.config(["$locationProvider", ($locationProvider) ->
  $locationProvider.html5Mode(false).hashPrefix('!')
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
  $rootScope.$on '$routeChangeStart', ->
    progress.start()

  $rootScope.$on '$routeChangeSuccess', ->
    progress.complete()
])

#check login
.run(["$window", "$rootScope", ($window, $rootScope) ->
  $rootScope._isLogin = !!$.cookie('CurrentUser')
  if !$rootScope._isLogin
    $window.location.href = "/login"
])

#init basepath of ckeditor
.run(["$window", ($window) ->
  $window.CKEDITOR_BASEPATH = "/plugin/ckeditor/"
])


.controller('AdminCtrl',
["$scope", "$rootScope", "$http", "$window", "$location",
  ($scope, $rootScope, $http, $window, $location) ->
    $rootScope._loginUser = angular.fromJson($.cookie('CurrentUser'))

    $scope.isActive = (path) ->
      path is $location.path()

    $scope.isPostActive = () ->
      $location.path() is "/posts" or
      $location.path().indexOf("/posts/") > -1

    $scope.logout = ->
      $.removeCookie('CurrentUser')
      $.removeCookie('meaning-token')
      $rootScope._loginUser = undefined
      $window.location.href = '/login'
])