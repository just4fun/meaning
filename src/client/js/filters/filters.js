angular.module("customFilters", []).filter("convertToHtmlLine", function() {
  return function(input) {
    if (!input) {
      return "";
    }
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
  };
}).filter("gravatar", function() {
  return function(email) {
    if (!email) {
      return "/img/avatar.png";
    }
    var hash = md5(email);
    return "http://www.gravatar.com/avatar/" + hash + "?default=" + MEANING.DefaultAvatar;
  };
});
