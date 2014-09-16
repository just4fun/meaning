angular.module("customFilters", [])

.filter "convertToHtmlLine", ->
  (input) ->
    return "" if !input
    input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")

.filter "gravatar", ->
  (email) ->
    return "/img/avatar.png" unless email
    hash = md5(email)
    return "http://www.gravatar.com/avatar/#{hash}?default=#{MEANING.DefaultAvatar}"