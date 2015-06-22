angular.module("directives.custom.ckEditor", []).directive("ckEditor", function() {
  return {
    require: "?ngModel",

    link: function(scope, elm, attr, ngModel) {
      if (!ngModel) {
        return;
      }

      var ck = CKEDITOR.replace(elm[0], {
        toolbar: "Main",
        extraPlugins: "codesnippet",
        codeSnippet_theme: "github"
      });

      ck.on("pasteState", function() {
        scope.$apply(function() {
          ngModel.$setViewValue(ck.getData());
        });
      });

      ngModel.$render = function(value) {
        ck.setData(ngModel.$viewValue);
      };

      scope.$on("$destroy", function() {
        var editor = CKEDITOR.instances[elm[0].name];
        if (editor) {
          editor.destroy(true);
        }
      });
    }
  };
});
