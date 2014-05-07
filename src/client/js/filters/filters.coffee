angular.module("customFilters", [])

#string 格式化json日期
.filter "jsondate", ->
    (input,fmt) ->
      input.Format(fmt)
#date 判断是否大于当前日期
.filter "isFuture", ->
    (input) ->
      new Date(input)>new Date()
#bool 转换为图形
.filter 'checkmark', ->
    (input) ->
      if input then '\u2713' else '\u2718'
#bool 转换为Yes or No
.filter 'yesno', ->
    (input) ->
      if input then 'Yes' else 'No'
#string中\n转换为<br />
.filter 'convertToHtmlLine', ->
    (input) ->
      return input if input==null or input==undefined
      input.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />')
#转换文件size单位
.filter 'formatFileSize', ->
    (bytes) ->
      return bytes if bytes==null or bytes==undefined
      return '' if typeof bytes isnt 'number'
      return (bytes / 1000000000).toFixed(2) + ' GB' if bytes >= 1000000000
      return (bytes / 1000000).toFixed(2) + ' MB' if bytes >= 1000000
      (bytes / 1000).toFixed(2) + ' KB'