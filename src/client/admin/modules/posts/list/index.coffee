angular.module('admin-posts-list', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: 'AdminPostsListCtrl')
])

.controller('AdminPostsListCtrl',
["$scope", "$http", "$rootScope", "$window", "progress",
  ($scope, $http, $rootScope, $window, progress) ->
    progress.start()
    $http.get("#{MEANING.ApiAddress}/posts").success (data) ->
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