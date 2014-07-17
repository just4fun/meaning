angular.module('admin-posts-detail', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/posts/new",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsNewCtrl'
    resolve:
      categories: ['$q', '$http', ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/categories")
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
  )
  .when("/posts/:url",
    templateUrl: "/admin/modules/posts/detail/index.html"
    controller: 'AdminPostsDetailCtrl'
    resolve:
      categories: ['$q', '$http', ($q, $http) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/categories")
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
      post: ['$q', '$http', "$route", ($q, $http, $route) ->
        deferred = $q.defer()
        $http.get("#{MEANING.ApiAddress}/posts/#{$route.current.params.url}",
          headers:
            "from-admin-console": true
        )
        .success (data) ->
          deferred.resolve data
        deferred.promise
      ]
  )
])

#Create
.controller('AdminPostsNewCtrl',
["$scope", "$http", "$rootScope", "$window", "messenger", "categories", "$location",
  ($scope, $http, $rootScope, $window, messenger, categories, $location) ->
    $scope.categories = categories
    $scope.submitText = "Publish"

    $scope.publish = ->
      save("Published")

    $scope.saveDraft = ->
      save("Draft")

    save = (status) ->
      #to prevent Two-Way Binding
      tempPost = angular.copy $scope.post

      if tempPost.Url.toLowerCase() is "count"
        messenger.error "The post url can not be 'count'."
        return
      if !tempPost.Content
        messenger.error "Post content is required."
        return

      tempPost.Status = status
      tempPost.Category = tempPost.Category._id
      tempPost.Author = $rootScope._loginUser._id

      $scope.submitting = true
      $http.post("#{MEANING.ApiAddress}/posts",
        tempPost,
        headers:
          "meaning-token": $.cookie('meaning-token')
      )
      .success (data) ->
        $scope.submitting = false

        if status is "Published"
          $window.location.href = "/#!/posts/#{data.Url}"
        else
          messenger.success "Save draft successfully!"
          #change url to edit mode, otherwise it will create again when press
          #save draft button twice.
          $location.path "/posts/#{tempPost.Url}"
])

#Update
.controller('AdminPostsDetailCtrl',
["$scope", "$http", "$rootScope", "$window", "$routeParams", "post", "messenger", "categories", "$location",
  ($scope, $http, $rootScope, $window, $routeParams, post, messenger, categories, $location) ->
    #to avoid "/posts/count" route being fired
    if $routeParams.url.toLowerCase() is "count"
      $location.path "/404"
      return

    if post.Tags and post.Tags.length > 0
      tags = []
      for t in post.Tags
        tags.push t.TagName
      post.Tags = tags.join(",")
    else
      post.Tags = ""

    $scope.categories = categories
    $scope.post = post
    $scope.submitText = "Published"
    $scope.submitText = "Update" if post.Status is "Published"
    $scope.operateText = "Move to Trash"
    $scope.operateText = "Restore" if post.Status is "Trash"

    $scope.publish = ->
      save("Published")

    $scope.saveDraft = ->
      save("Draft")

    $scope.moveToTrash = () ->
      messenger.confirm ->
        if post.Status is "Published"
          save("Trash")
        else
          save("Published")

    save = (status) ->
      #to prevent Two-Way Binding
      tempPost = angular.copy $scope.post

      if tempPost.Url.toLowerCase() is "count"
        messenger.error "The post url can not be 'count'."
        return
      if !tempPost.Content
        messenger.error "Post content is required."
        return

      tempPost.Status = status
      tempPost.Category = tempPost.Category._id
      tempPost.EditUser = $rootScope._loginUser.Username

      $scope.submitting = true
      $http.put("#{MEANING.ApiAddress}/posts/#{$routeParams.url}",
        tempPost,
        headers:
          "meaning-token": $.cookie('meaning-token')
          #without below param, the getByUrl() in node.js will return 404
          "from-admin-console": true
      )
      .success (data) ->
        $scope.submitting = false

        if status is "Published"
          $window.location.href = "/#!/posts/#{data.Url}"
        else if status is "Trash"
          $window.location.href = "#!/posts/list/trash"
        else
          messenger.success "Save draft successfully!"
])