angular.module("guestbook", []).config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/guestbook", {
      templateUrl: "/modules/guestbook/index.html",
      controller: "GuestbookCtrl"
    });
  }
]).controller("GuestbookCtrl", [
  "$scope", "$http", "$rootScope", "progress", "messenger", "authorize",
  function($scope, $http, $rootScope, progress, messenger, authorize) {
    $rootScope.title = "Guestbook";

    // init comment author info
    var loginUser = $rootScope._loginUser;
    var commentAuthor = angular.fromJson($.cookie("comment-author"));
    $scope.entity = {};

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
          $.cookie("comment-author", angular.toJson({
            Author: $scope.entity.Author,
            Email: $scope.entity.Email
          }), {
            expires: 180,
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
        $http["delete"]("" + MEANING.ApiAddress + "/comments/" + comment._id, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
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
      $http.get("" + MEANING.ApiAddress + "/comments/guestbook").success(function(data) {
        $scope.comments = data;
        progress.complete();
      });
    };
    getCommentList();
  }
]);
