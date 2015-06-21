angular.module("directives.custom.ckEditor", []).directive("ckEditor", function() {
  return {
    require: "?ngModel",
    link: function(scope, elm, attr, ngModel) {
      var ck;
      ck = CKEDITOR.replace(elm[0], {
        toolbar: "Main",
        extraPlugins: "codesnippet",
        codeSnippet_theme: "github"
      });
      if (!ngModel) {
        return;
      }
      ck.on("pasteState", function() {
        return scope.$apply(function() {
          return ngModel.$setViewValue(ck.getData());
        });
      });
      ngModel.$render = function(value) {
        return ck.setData(ngModel.$viewValue);
      };
      return scope.$on("$destroy", function() {
        var editor;
        editor = CKEDITOR.instances[elm[0].name];
        if (editor) {
          return editor.destroy(true);
        }
      });
    }
  };
});
