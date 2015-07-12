angular.module("posts-view", []).config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/posts/:year/:month/:day/:url", {
      templateUrl: "/modules/posts/detail/index.html",
      controller: "PostsDetailCtrl",
      resolve: {
        post: [
          "$q", "$http", "$route", "$location", "$rootScope",
          function($q, $http, $route, $location, $rootScope) {
            var url = $route.current.params.url;

            // to avoid "/posts/count" route being fired
            if (url.toLowerCase() === "count") {
              $location.path("/404");
              return;
            }

            var deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/posts/" + url).success(function(data) {
              return deferred.resolve(data);
            });

            return deferred.promise;
          }
        ]
      }
    });
  }
]).controller("PostsDetailCtrl", [
  "$scope", "$http", "$window", "progress", "$routeParams", "$location", "$rootScope", "$cookies", "post", "messenger", "date",
  function($scope, $http, $window, progress, $routeParams, $location, $rootScope, $cookies, post, messenger, date) {
    $rootScope.title = post.Title;
    $scope.post = post;

    $scope.canEdit = function() {
      var currentUser;
      currentUser = $rootScope._loginUser;
      if (!currentUser) {
        return false;
      }
      if (currentUser.Role !== "Admin" && currentUser.UserName !== post.Author.UserName) {
        return false;
      }
      return true;
    };

    // init comment author info
    var loginUser = $rootScope._loginUser;
    var commentAuthor = angular.fromJson($cookies.get("comment-author"));
    $scope.entity = {
      Post: post._id
    };

    if (loginUser) {
      $scope.entity.Author = loginUser.UserName;
      $scope.entity.Email = loginUser.Email;
    } else if (commentAuthor) {
      $scope.entity.Author = commentAuthor.Author;
      $scope.entity.Email = commentAuthor.Email;
    }

    $scope.publish = function() {
      $http.post("" + MEANING.ApiAddress + "/comments", $scope.entity).success(function(data) {
        messenger.success("Publish comment successfully!");
        $scope.comments.push(data);

        // save author info in cookie
        if (!loginUser) {
          $cookies.put("comment-author", angular.toJson({
            Author: $scope.entity.Author,
            Email: $scope.entity.Email
          }), {
            expires: date.getDate(180),
            path: "/"
          });
        }

        $scope.entity.Content = "";
      }).error(function(err) {
        progress.complete();
      });
    };

    $scope.del = function(comment) {
      messenger.confirm(function() {
        progress.start();
        return $http["delete"]("" + MEANING.ApiAddress + "/comments/" + comment._id, {
          headers: {
            "meaning-token": $cookies.get("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Delete comment successfully!");
          $scope.comments.splice($scope.comments.indexOf(comment), 1);
          progress.complete();
        }).error(function(err) {
          progress.complete();
        });
      });
    };

    var getCommentList = function() {
      progress.start();
      $http.get("" + MEANING.ApiAddress + "/posts/" + post._id + "/comments").success(function(data) {
        $scope.comments = data;
        progress.complete();
      });
    };

    getCommentList();
  }
]);
