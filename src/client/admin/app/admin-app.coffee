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
["$scope", "$rootScope", "$http", "$window", "$location", "progress", "messenger",
  ($scope, $rootScope, $http, $window, $location, progress, messenger) ->
    $rootScope._loginUser = angular.fromJson($.cookie('CurrentUser'))

    $scope.isActive = (path) ->
      path is $location.path()

    $scope.isPostActive = () ->
      $location.path() is "/posts" or
      $location.path().indexOf("/posts/") > -1

    $scope.logout = ->
      $.removeCookie('CurrentUser', { path: '/' });
      $.removeCookie('meaning-token', { path: '/' });
      $rootScope._loginUser = undefined
      $window.location.href = '/login'

    #------------change profile------------

    $scope.changeProfile = () ->
      $scope.entity = angular.copy $rootScope._loginUser
      $scope.iconDialog = true

    $scope.save = () ->
      if $scope.entity.NewPassword and !$scope.entity.RePassword
        messenger.error "Please confirm Password."
        return
      if $scope.entity.NewPassword and $scope.entity.RePassword and
      $scope.entity.NewPassword isnt $scope.entity.RePassword
        messenger.error "The RePassword mismatch Password."
        return

      $scope.entity.EditUser = $rootScope._loginUser.UserName
      $scope.entity.EditDate = new Date()
      $scope.entity.Password = $scope.entity.NewPassword
      delete $scope.entity.RePassword

      progress.start()
      $http.put("#{MEANING.ApiAddress}/user/#{$scope.entity._id}",
        $scope.entity,
        headers:
          'meaning-token': $.cookie('meaning-token')
      )
      .success (data) ->
        #update cookie
        user = angular.fromJson($.cookie('CurrentUser'));
        user.UserName = $scope.entity.UserName
        user.Email = $scope.entity.Email
        $.cookie('CurrentUser', angular.toJson(user), {expires: 180, path: '/'})
        #update global variable
        $rootScope._loginUser = angular.fromJson($.cookie('CurrentUser'))

        messenger.success "Change profile successfully!"
        $scope.close()
        progress.complete();
      .error (err) ->
        progress.complete();

    $scope.close = ->
      $scope.iconDialog = false
      $scope.entity = null
])