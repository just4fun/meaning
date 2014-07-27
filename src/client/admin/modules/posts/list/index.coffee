angular.module('admin-posts-list', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: 'AdminPostsListCtrl'
    resolve:
      postCounts: ['$q', '$http', ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/posts/count",
          headers:
            "login-user": $.cookie("CurrentUser")
        )
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
  )
  .when("/posts/list/:status",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: 'AdminPostsListCtrl'
    resolve:
      postCounts: ['$q', '$http', ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/posts/count",
          headers:
            "login-user": $.cookie("CurrentUser")
        )
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
  )
])

.controller('AdminPostsListCtrl',
["$scope", "$http", "$rootScope", "$routeParams", "progress", "postCounts",
  ($scope, $http, $rootScope, $routeParams, progress, postCounts) ->
    $scope.postCounts = postCounts
    url = "#{MEANING.ApiAddress}/posts"
    status = $routeParams.status
    initialToUpper = (str) ->
      str.substr(0 ,1).toUpperCase() + str.substr(1).toLowerCase()

    if status
      status = initialToUpper(status)
      url += "/list/#{status}"

    progress.start()
    $http.get(url,
      headers:
        "login-user": $.cookie("CurrentUser")
    ).success (data) ->
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