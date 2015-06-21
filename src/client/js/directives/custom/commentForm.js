angular.module("directives.custom.commentForm", []).directive("commentForm", [
  "messenger", "authorize", function(messenger, authorize) {
    return {
      restrict: "AE",
      scope: {
        author: "=",
        sessionUser: "=",
        postId: "@",
        onPublish: "&"
      },
      link: function(scope, elm, attr) {
        scope.publish = function() {
          scope.submitted = true;
          if (scope.form.$invalid) {
            return;
          }
          scope.submitted = false;
          return scope.onPublish();
        };
        return scope.logout = function() {
          return messenger.confirm(function() {
            var commentAuthor;
            authorize.logout();
            commentAuthor = angular.fromJson($.cookie("comment-author"));
            return scope.$apply(function() {
              if (commentAuthor) {
                scope.author.Author = commentAuthor.Author;
                scope.author.Email = commentAuthor.Email;
                return scope.author.Content = "";
              } else if (scope.postId != null) {
                return scope.author = {
                  Post: scope.postId
                };
              } else {
                return scope.author = {};
              }
            });
          });
        };
      },
      templateUrl: "/js/directives/template/commentForm.html"
    };
  }
]);
