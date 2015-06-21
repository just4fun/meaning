angular.module("services.utils.progress", []).provider("progress", function() {
  this.$get = [
    "$document", "$window", "$compile", "$rootScope", function($document, $window, $compile, $rootScope) {
      var $body, $scope, el;
      $scope = $rootScope;
      $body = $document.find("body");
      el = $compile("<div class='loadingbox' ng-show='loading'>{{ loading }}</div>")($scope);
      $body.append(el);
      return {
        start: function(tip) {
          return $scope.loading = (tip || "Loading") + "...";
        },
        complete: function() {
          return $scope.loading = "";
        },
        status: function() {
          return !!$scope.loading;
        }
      };
    }
  ];
});
