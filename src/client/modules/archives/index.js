var __hasProp = {}.hasOwnProperty;

angular.module("archives", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/archives", {
      templateUrl: "/modules/archives/index.html",
      controller: "ArchivesCtrl",
      resolve: {
        archives: [
          "$q", "$http", function($q, $http) {
            var deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/posts/list/Published").success(function(data) {
              var date, dict, key, post, result, value, _i, _len;
              dict = [];
              for (_i = 0, _len = data.length; _i < _len; _i++) {
                post = data[_i];
                date = moment(post.CreateDate).format("MMM YYYY");
                if (!dict[date]) {
                  dict[date] = [];
                }
                dict[date].push(post);
              }

              result = [];
              for (key in dict) {
                if (!__hasProp.call(dict, key)) continue;
                value = dict[key];
                result.push({
                  date: key,
                  posts: value
                });
              }

              return deferred.resolve(result);
            });
            return deferred.promise;
          }
        ]
      }
    });
  }
]).controller("ArchivesCtrl", [
  "$scope", "$http", "$rootScope", "archives",
  function($scope, $http, $rootScope, archives) {
    $rootScope.title = "Archives";
    $scope.archives = archives;
  }
]);
