angular.module("guestbook", [])

.config(["$routeProvider",
    ($routeProvider) ->
      $routeProvider
      .when("/guestbook",
        templateUrl: "/modules/guestbook/index.html"
        controller: "GuestbookCtrl")
  ])

.controller("GuestbookCtrl",
["$scope", "$http", "progress", "messenger",
  ($scope, $http, progress, messenger) ->
    $scope.publish = () ->
      $http.post("#{MEANING.ApiAddress}/comment", $scope.entity)
      .success (data) ->
        messenger.success "Publish comment successfully!"
        getCommentList()
        $scope.entity = {}
      .error (err) ->
        progress.complete()

    getCommentList = () ->
      progress.start()
      $http.get("#{MEANING.ApiAddress}/comments").success (data) ->
        $scope.comments = data
        progress.complete()

    getCommentList()
])