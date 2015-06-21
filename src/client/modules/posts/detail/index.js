angular.module("posts-view", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/posts/:year/:month/:day/:url", {
      templateUrl: "/modules/posts/detail/index.html",
      controller: "PostsDetailCtrl",
      resolve: {
        post: [
          "$q", "$http", "$route", "$location", "$rootScope", function($q, $http, $route, $location, $rootScope) {
            var deferred, url;
            url = $route.current.params.url;
            if (url.toLowerCase() === "count") {
              $location.path("/404");
              return;
            }
            deferred = $q.defer();
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
  "$scope", "$http", "$window", "progress", "$routeParams", "$location", "$rootScope", "post", "messenger", "authorize", function($scope, $http, $window, progress, $routeParams, $location, $rootScope, post, messenger, authorize) {
    var commentAuthor, getCommentList, loginUser;
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
    loginUser = $rootScope._loginUser;
    commentAuthor = angular.fromJson($.cookie("comment-author"));
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
      return $http.post("" + MEANING.ApiAddress + "/comments", $scope.entity).success(function(data) {
        messenger.success("Publish comment successfully!");
        $scope.comments.push(data);
        if (!loginUser) {
          $.cookie("comment-author", angular.toJson({
            Author: $scope.entity.Author,
            Email: $scope.entity.Email
          }), {
            expires: 180,
            path: "/"
          });
        }
        return $scope.entity.Content = "";
      }).error(function(err) {
        return progress.complete();
      });
    };
    $scope.del = function(comment) {
      return messenger.confirm(function() {
        progress.start();
        return $http["delete"]("" + MEANING.ApiAddress + "/comments/" + comment._id, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Delete comment successfully!");
          $scope.comments.splice($scope.comments.indexOf(comment), 1);
          return progress.complete();
        }).error(function(err) {
          return progress.complete();
        });
      });
    };
    getCommentList = function() {
      progress.start();
      return $http.get("" + MEANING.ApiAddress + "/posts/" + post._id + "/comments").success(function(data) {
        $scope.comments = data;
        return progress.complete();
      });
    };
    return getCommentList();
  }
]);
