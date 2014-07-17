angular.module('posts-view', [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/posts/:year/:month/:day/:url",
      templateUrl: "/modules/posts/detail/index.html"
      controller: 'PostsDetailCtrl')
])

.controller('PostsDetailCtrl',
["$scope", "$http", "$window", "progress", "$routeParams", "$location",
  ($scope, $http, $window, progress, $routeParams, $location) ->
    #to avoid "/posts/count" route being fired
    if $routeParams.url.toLowerCase() is "count"
      $location.path "/404"
      return

    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts/#{$routeParams.url}").success (data) ->
      #comment below code tentatively because of time zone issue

      #check route
      ###date = new Date(data.CreateDate)
      year = date.getFullYear()
      month = date.getMonth() + 1
      day = date.getDate()
      if $routeParams.year isnt year.toString() or
      $routeParams.month isnt month.toString() or
      $routeParams.day isnt day.toString()
        $location.path "/404"
        return###

      $scope.post = data
      progress.complete()
])