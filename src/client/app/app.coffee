angular.module("app",
['ngRoute'
 'ngSanitize'
 'ngAnimate'
 'ngCookies'

 'angulartics'
 'angulartics.google.analytics'

 'customDirectives'
 'customFilters'
 'customServices'
 'customModules'
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
  $routeProvider.otherwise redirectTo: "/404"
])

#show loading when route change
.run(["$rootScope", "progress", ($rootScope, progress) ->
  $rootScope.$on '$routeChangeStart', ->
    progress.start()

  $rootScope.$on '$routeChangeSuccess', ->
    progress.complete()
])

.run(["$rootScope", ($rootScope) ->
  $rootScope._loginUser = angular.fromJson($.cookie('CurrentUser'))
])

.controller('NavCtrl',
["$scope", "$http", "$location", "$rootScope",
  ($scope, $http, $location, $rootScope) ->
    $scope.text = if $rootScope._loginUser then "Hello, #{$rootScope._loginUser.Username}" else "Login"

    $scope.isActive = (path) ->
      path is $location.path()
])