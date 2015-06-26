angular.module("services.utils.month", []).service("month", function() {
    var _monthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");

    this.getShortName = function(month) {
      return _monthsShort[month];
    };
  }
);
