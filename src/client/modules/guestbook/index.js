angular.module("guestbook", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/guestbook", {
      templateUrl: "/modules/guestbook/index.html",
      controller: "GuestbookCtrl"
    });
  }
]).controller("GuestbookCtrl", [
  "$scope", "$http", "$rootScope", "progress", "messenger", "authorize", function($scope, $http, $rootScope, progress, messenger, authorize) {
    var commentAuthor, getCommentList, loginUser;
    $rootScope.title = "Guestbook";
    loginUser = $rootScope._loginUser;
    commentAuthor = angular.fromJson($.cookie("comment-author"));
    $scope.entity = {};
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
      return $http.get("" + MEANING.ApiAddress + "/comments/guestbook").success(function(data) {
        $scope.comments = data;
        return progress.complete();
      });
    };
    return getCommentList();
  }
]);
