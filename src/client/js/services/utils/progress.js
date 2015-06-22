angular.module("services.utils.progress", []).provider("progress", function() {
  this.$get = [
    "$document", "$window", "$compile", "$rootScope",
    function($document, $window, $compile, $rootScope) {
      var $scope = $rootScope;
      var $body = $document.find("body");
      var el = $compile("<div class='loadingbox' ng-show='loading'>{{ loading }}</div>")($scope);
      $body.append(el);

      return {
        start: function(tip) {
          $scope.loading = (tip || "Loading") + "...";
        },
        complete: function() {
          $scope.loading = "";
        },
        status: function() {
          return !!$scope.loading;
        }
      };
    }
  ];
});
