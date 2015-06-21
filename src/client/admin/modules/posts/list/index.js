angular.module("admin-posts-list", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/posts", {
      templateUrl: "/admin/modules/posts/list/index.html",
      controller: "AdminPostsListCtrl",
      resolve: {
        postCounts: [
          "$q", "$http", function($q, $http) {
            var deferred;
            deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/posts/count", {
              headers: {
                "meaning-token": $.cookie("meaning-token"),
                "login-user": $.cookie("CurrentUser")
              }
            }).success(function(data) {
              return deferred.resolve(data);
            });
            return deferred.promise;
          }
        ]
      }
    }).when("/posts/list/:status", {
      templateUrl: "/admin/modules/posts/list/index.html",
      controller: "AdminPostsListCtrl",
      resolve: {
        postCounts: [
          "$q", "$http", function($q, $http) {
            var deferred;
            deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/posts/count", {
              headers: {
                "meaning-token": $.cookie("meaning-token"),
                "login-user": $.cookie("CurrentUser")
              }
            }).success(function(data) {
              return deferred.resolve(data);
            });
            return deferred.promise;
          }
        ]
      }
    });
  }
]).controller("AdminPostsListCtrl", [
  "$scope", "$http", "$rootScope", "$routeParams", "progress", "postCounts", "messenger", function($scope, $http, $rootScope, $routeParams, progress, postCounts, messenger) {
    var initialToUpper, status, url;
    $rootScope.title = "Posts";
    $scope.postCounts = postCounts;
    url = "" + MEANING.ApiAddress + "/posts";
    status = $routeParams.status;
    initialToUpper = function(str) {
      return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
    };
    if (status) {
      status = initialToUpper(status);
      url += "/list/" + status;
    }
    progress.start();
    $http.get(url, {
      headers: {
        "meaning-token": $.cookie("meaning-token"),
        "login-user": $.cookie("CurrentUser")
      }
    }).success(function(data) {
      var p, t, tags, _i, _j, _len, _len1, _ref;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        p = data[_i];
        if (p.Tags && p.Tags.length > 0) {
          tags = [];
          _ref = p.Tags;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            t = _ref[_j];
            tags.push(t.TagName);
          }
          p.Tags = tags.join(",");
        } else {
          p.Tags = "";
        }
      }
      if (status) {
        $rootScope.title = "Posts (" + status + ")";
      }
      $scope.posts = data;
      return progress.complete();
    });
    return $scope.del = function(post) {
      return messenger.confirm(function() {
        progress.start();
        url = post.Url.substring(post.Url.lastIndexOf("/") + 1);
        return $http["delete"]("" + MEANING.ApiAddress + "/posts/" + url, {
          headers: {
            "meaning-token": $.cookie("meaning-token"),
            "from-admin-console": true
          }
        }).success(function(data) {
          $scope.posts.splice($scope.posts.indexOf(post), 1);
          $http.get("" + MEANING.ApiAddress + "/posts/count", {
            headers: {
              "meaning-token": $.cookie("meaning-token"),
              "login-user": $.cookie("CurrentUser")
            }
          }).success(function(data) {
            return $scope.postCounts = data;
          });
          messenger.success("Delete post successfully!");
          return progress.complete();
        }).error(function(err) {
          return progress.complete();
        });
      });
    };
  }
]);
