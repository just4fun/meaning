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
  $httpProvider.responseInterceptors.push ["$rootScope", "$q", ($rootScope, $q) ->
    success = (response) ->
      response
    error = (response) ->
      debugger
      $q.reject(response)
    (promise) ->
      promise.then success, error
  ]
])

.config(["$routeProvider", ($routeProvider) ->
  $routeProvider.otherwise redirectTo: "/"
])

.run(["$window", "$rootScope", ($window, $rootScope) ->
  $rootScope._isLogin = !!$.cookie('CurrentUser')
  if !$rootScope._isLogin
    $window.location.href = "/login"
])

.run(["$window", ($window) ->
  #init basepath of ckeditor
  $window.CKEDITOR_BASEPATH = "/plugin/ckeditor/"
])


.controller('AdminCtrl',
["$scope", "$rootScope", "$http", "$window", "$location",
  ($scope, $rootScope, $http, $window, $location) ->
    $rootScope._loginUser = angular.fromJson($.cookie('CurrentUser'))

    $scope.isActive = (path) ->
      path is $location.path()

    $scope.logout = ->
      $.removeCookie('CurrentUser')
      $.removeCookie('meaning-token')
      $rootScope._loginUser = undefined
      $window.location.href = '/login'
])