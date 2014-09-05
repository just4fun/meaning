angular.module("archives", [])

.config(["$routeProvider",
  ($routeProvider) ->
    $routeProvider
    .when("/archives",
      templateUrl: "/modules/archives/index.html"
      controller: "ArchivesCtrl"
      resolve:
        archives: ["$q", "$http", ($q, $http) ->
          deferred = $q.defer()
          $http.get("#{MEANING.ApiAddress}/posts/list/Published")
          .success (data) ->
            dict = []
            for post in data
              date = moment(post.CreateDate).format("MMM YYYY")
              dict[date] = [] unless dict[date]
              dict[date].push post

            result = []
            for own key, value of dict
              result.push
                date: key
                posts: value

            deferred.resolve result
          deferred.promise
        ]
    )
])

.controller("ArchivesCtrl",
["$scope", "$http", "archives",
  ($scope, $http, archives) ->
    $scope.archives = archives
])