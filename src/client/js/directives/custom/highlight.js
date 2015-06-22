angular.module("directives.custom.highlight", []).directive("highlight", function() {
  return {
    restrict: "A",

    link: function(scope, elm, attr) {
      scope.$watch(elm.html(), function() {
        hljs.initHighlighting();
      });
    }
  };
});
