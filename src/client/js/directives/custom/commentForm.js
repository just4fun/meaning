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
          scope.onPublish();
        };

        scope.logout = function() {
          messenger.confirm(function() {
            authorize.logout();
            var commentAuthor = angular.fromJson($.cookie("comment-author"));
            scope.$apply(function() {
              if (commentAuthor) {
                scope.author.Author = commentAuthor.Author;
                scope.author.Email = commentAuthor.Email;
                scope.author.Content = "";
              } else if (scope.postId != null) {
                scope.author = {
                  Post: scope.postId
                };
              } else {
                scope.author = {};
              }
            });
          });
        };
      },

      templateUrl: "/js/directives/template/commentForm.html"
    };
  }
]);
