angular.module("admin-posts-list", [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: "AdminPostsListCtrl"
    resolve:
      postCounts: ["$q", "$http", ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/posts/count",
          headers:
            "meaning-token": $.cookie("meaning-token")
            "login-user": $.cookie("CurrentUser")
        )
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
  )
  .when("/posts/list/:status",
    templateUrl: "/admin/modules/posts/list/index.html"
    controller: "AdminPostsListCtrl"
    resolve:
      postCounts: ["$q", "$http", ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/posts/count",
          headers:
            "meaning-token": $.cookie("meaning-token")
            "login-user": $.cookie("CurrentUser")
        )
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
  )
])

.controller("AdminPostsListCtrl",
["$scope", "$http", "$rootScope", "$routeParams", "progress", "postCounts", "messenger",
  ($scope, $http, $rootScope, $routeParams, progress, postCounts, messenger) ->
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
        #for get /posts
        "meaning-token": $.cookie("meaning-token")
        "login-user": $.cookie("CurrentUser")
    )
    .success (data) ->
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

    $scope.del = (post) ->
      messenger.confirm ->
        progress.start();
        url = post.Url.substring(post.Url.lastIndexOf("/") + 1)
        $http.delete("#{MEANING.ApiAddress}/posts/#{url}",
          headers:
            "meaning-token": $.cookie("meaning-token")
            "from-admin-console": true
        )
        .success (data) ->
          $scope.posts.splice($scope.posts.indexOf(post), 1)
          #change count
          $http.get("#{MEANING.ApiAddress}/posts/count",
            headers:
              "meaning-token": $.cookie("meaning-token")
              "login-user": $.cookie("CurrentUser")
          )
          .success (data) ->
            $scope.postCounts = data

          messenger.success "Delete post successfully!"
          progress.complete();
        .error (err) ->
          progress.complete();
])