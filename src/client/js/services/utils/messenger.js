angular.module("services.utils.messenger", []).factory("messenger", function() {
  return {

    success: function(msg) {
      Messenger().post({
        message: msg,
        type: "success",
        showCloseButton: true
      });
    },

    error: function(msg) {
      Messenger().post({
        message: msg,
        type: "error",
        showCloseButton: true
      });
    },

    confirm: function(callback, msg) {
      msg = Messenger().post({
        message: msg || "Do you want to continue?",
        showCloseButton: true,
        actions: {
          OK: {
            label: "OK",
            phrase: "Confirm",
            delay: 60,
            action: function() {
              callback();
              return msg.cancel();
            }
          },
          cancel: {
            action: function() {
              return msg.cancel();
            }
          }
        }
      });
    }
  };
});
