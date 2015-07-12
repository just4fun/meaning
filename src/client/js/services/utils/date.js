angular.module("services.utils.date", []).service("date", function() {
    this.getDate = function(number) {
      var expires = new Date();
      expires.setDate(expires.getDate() + number);
      return expires;
    };
  }
);
