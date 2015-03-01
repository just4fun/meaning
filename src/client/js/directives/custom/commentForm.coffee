angular.module("directives.custom.commentForm", [])

.directive "commentForm",
["messenger", "authorize",
  (messenger, authorize) ->
    restrict: "AE"
    scope:
      author: "="
      sessionUser: "="
      post: "@"
      onPublish: "&"
    link: (scope, elm, attr) ->
      scope.publish = ->
        scope.submitted = true
        return if scope.form.$invalid

        scope.submitted = false
        scope.onPublish()

      scope.logout = ->
        messenger.confirm ->
          authorize.logout()
          commentAuthor = angular.fromJson($.cookie("comment-author"))
          if commentAuthor
            scope.author.Author = commentAuthor.Author
            scope.author.Email = commentAuthor.Email
            scope.author.Content = ""
          else if post? then scope.author = {Post: post._id} else scope.author = {}
          scope.$apply()

    templateUrl: "/js/directives/template/commentForm.html"
]