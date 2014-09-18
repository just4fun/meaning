angular.module("services.utils.messenger", [])

.factory "messenger", ->
  success : (msg) ->
    Messenger().post
      message : msg
      type : "success"
      showCloseButton : true

  error : (msg) ->
    Messenger().post
      message : msg
      type : "error"
      showCloseButton : true

  confirm : (callback, msg) ->
    msg = Messenger().post
      message : msg || "Do you want to continue?"
      showCloseButton : true
      actions :
        OK :
          label : "OK"
          phrase : "Confirm"
          delay : 60
          action : ->
            callback()
            msg.cancel()
        cancel :
          action : ->
            msg.cancel()