angular.module("directives.custom.highlight", []).directive("highlight", function() {
  return {
    restrict: "A",
    link: function(scope, elm, attr) {
      return scope.$watch(elm.html(), function() {
        return hljs.initHighlighting();
      });
    }
  };
});
