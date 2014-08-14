angular.module("ckEditor",[])

.directive "ckEditor", ->
  require: "?ngModel"
  link: (scope, elm, attr, ngModel)->
    ck = CKEDITOR.replace elm[0], {
      toolbar: "Main"
      extraPlugins: "codesnippet"
      codeSnippet_theme: "github"
    }
    unless ngModel then return
    ck.on "pasteState", ->
      scope.$apply ->
        ngModel.$setViewValue ck.getData()
    ngModel.$render = (value) ->
      ck.setData ngModel.$viewValue

    scope.$on "$destroy", ->
      editor = CKEDITOR.instances[elm[0].name]
      editor.destroy true if editor