angular.module("services.utils.authorize", [])

.service("authorize",
["$http", "$q", "progress",
  ($http, $q, progress) ->

    @login = (user) ->
      deferred = $q.defer()
      progress.start()
      $http.post("#{MEANING.ApiAddress}/login", user)
      .success (user, status, headers, config) ->
        $.cookie("CurrentUser", angular.toJson(user), {expires: 180, path: "/"})
        $.cookie("meaning-token", headers("meaning-token"), {expires: 180, path: "/"})
        progress.complete()
        deferred.resolve user
      .error (err) ->
        progress.complete()
        deferred.reject err.Message
      deferred.promise

    return
])