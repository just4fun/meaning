angular.module("services.utils.authorize", []).service("authorize", [
  "$http", "$q", "$rootScope", "$cookies", "progress", "date",
  function($http, $q, $rootScope, $cookies, progress, date) {

    this.login = function(user) {
      var deferred = $q.defer();
      progress.start();
      $http.post("" + MEANING.ApiAddress + "/login", user).success(function(user, status, headers, config) {
        $cookies.put("CurrentUser", angular.toJson(user), {
          expires: date.getDate(180),
          path: "/"
        });
        $cookies.put("meaning-token", headers("meaning-token"), {
          expires: date.getDate(180),
          path: "/"
        });
        progress.complete();
        return deferred.resolve(user);
      }).error(function(err) {
        progress.complete();
        return deferred.reject(err.Message);
      });
      return deferred.promise;
    };

    this.logout = function() {
      $cookies.remove("CurrentUser", { path: "/" });
      $cookies.remove("meaning-token", { path: "/" });
      $rootScope._loginUser = undefined;
    };
  }
]);
