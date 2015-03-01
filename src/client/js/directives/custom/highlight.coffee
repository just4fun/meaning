angular.module("directives.custom.highlight", [])

.directive "highlight", ->
  restrict: "A"
  link: (scope, elm, attr) ->
    scope.$watch(elm.html(), ->
      hljs.initHighlighting()
    )
