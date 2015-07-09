angular.module("services.utils.authorize", []).service("authorize", [
  "$http", "$q", "$rootScope", "$cookies", "progress",
  function($http, $q, $rootScope, $cookies, progress) {

    this.login = function(user) {
      var deferred = $q.defer();
      progress.start();
      $http.post("" + MEANING.ApiAddress + "/login", user).success(function(user, status, headers, config) {
        $cookies.put("CurrentUser", angular.toJson(user), {
          expires: 180,
          path: "/"
        });
        $cookies.put("meaning-token", headers("meaning-token"), {
          expires: 180,
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
      $.removeCookie("CurrentUser", { path: "/" });
      $.removeCookie("meaning-token", { path: "/" });
      $rootScope._loginUser = undefined;
    };
  }
]);
