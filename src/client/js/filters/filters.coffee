angular.module("customFilters", [])

.filter "convertToHtmlLine", ->
  (input) ->
    return "" if !input
    input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")

.filter "gravatar", ->
  (email) ->
    return "" if !email
    hash = md5(email)
    pic = "http%3A%2F%2Ftalent-is.me%3A9000%2Fimg%2Favatar.png"
    "http://www.gravatar.com/avatar/#{hash}?default=#{pic}"