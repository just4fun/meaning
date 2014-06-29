angular.module('admin-posts-list', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: 'AdminPostsListCtrl')
  .when("/posts/list/:status",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: 'AdminPostsListCtrl')
])

.controller('AdminPostsListCtrl',
["$scope", "$http", "$rootScope", "$routeParams", "progress",
  ($scope, $http, $rootScope, $routeParams, progress) ->
    url = "#{MEANING.ApiAddress}/posts"
    status = $routeParams.status
    initialToUpper = (str) ->
      str.substr(0 ,1).toUpperCase() + str.substr(1).toLowerCase()

    if status
      status = initialToUpper(status)
      url += "/list/#{status}"

    progress.start()
    $http.get(url).success (data) ->
      for p in data
        if p.Tags and p.Tags.length > 0
          tags = []
          for t in p.Tags
            tags.push t.TagName
          p.Tags = tags.join(",")
        else
          p.Tags = ""

      $scope.posts = data
      progress.complete()
])