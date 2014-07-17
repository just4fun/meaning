module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)
  isdebug = grunt.option("release") isnt true
  LIVERELOAD_PORT = 35729

  minJs = 'dist/client/min.js'
  minCss = 'dist/client/min.css'
  minAdminJs = 'dist/client/min-admin.js'
  minAdminCss = 'dist/client/min-admin.css'
  minLoginJs = 'dist/client/min-login.js'
  minLoginCss = 'dist/client/min-login.css'


  #------------------------------------------------------------

  grunt.initConfig
    assets: grunt.file.readJSON("assets.json")

    connect:
      options:
        port: 9000
        hostname: 'localhost'
      livereload:
        options:
          middleware: (connect) ->
            return [
              require('connect-modrewrite')([
                '^/admin$ /admin/admin-index.html'
                '^/login$ /admin/admin-login.html'
                '^/\\w+$ /index.html'
                '^/admin/\\w+$ /admin/admin-index.html'
              ])
              require('connect-livereload')
                port:LIVERELOAD_PORT
              connect.static(require('path').resolve('dist/client'))
            ]

    open:
      server:
        url:'http://localhost:9000'

    watch:
      normalFile:
        files: [
          'src/client/**/*'
          #except files which have no need for watching
          '!src/client/plugin/**/*'
          '!src/client/**/*.coffee'
          '!src/client/**/*.less'
        ]
        tasks: [
          'newer:copy'
          'scriptlinker'
        ]
      coffee:
        files: [
          'src/client/**/*.coffee'
        ]
        tasks: [
          'newer:coffee'
          'scriptlinker'
        ]
      less:
        files: [
          'src/client/**/*.less'
        ]
        tasks: [
          'newer:less'
          'scriptlinker'
        ]
      server:
        files: [
          'src/server/**/*.coffee'
        ]
        tasks:[
          'newer:coffee:server'
        ]
      livereload:
        options:
          livereload: LIVERELOAD_PORT
        #files which will lead to refresh when changed
        files: [
          "dist/client/**/*"
          #except files which have no need for watching
          '!dist/client/plugin/**/*'
        ]

    coffee:
      options:
        #don't generate js wrapper
        bare: true
      all:
        files: [
          expand: true
          cwd: 'src/'
          src: ['**/*.coffee']
          dest: 'dist/'
          ext: '.js'
        ]
      #only compile server coffee files
      server:
        files: [
          expand: true
          cwd: 'src/server'
          src: ['**/*.coffee']
          dest: 'dist/server'
          ext: '.js'
        ]

    less:
      compile:
        files: [
          expand: true
          cwd: 'src/client/'
          src: ['**/*.less']
          dest: 'dist/client'
          ext: '.css'
        ]

    uglify:
      options: {
        #uglify
        mangle: true
        #minify
        beautify: false
      }
      js:
        src: ["<%= assets.commonJs %>", "<%= assets.js %>"]
        dest: minJs
      loginJs:
        src: ["<%= assets.commonJs %>", "<%= assets.loginJs %>"]
        dest: minLoginJs
      adminJs:
        src: ["<%= assets.commonJs %>", "<%= assets.adminJs %>"]
        dest: minAdminJs

    cssmin:
      css:
        src: ["<%= assets.commonCss %>", "<%= assets.css %>"]
        dest: minCss
      loginCss:
        src: ["<%= assets.commonCss %>", "<%= assets.loginCss %>"]
        dest: minLoginCss
      adminCss:
        src: ["<%= assets.commonCss %>", "<%= assets.adminCss %>"]
        dest: minAdminCss

    scriptlinker:
      js:
        options:
          startTag: "<!--SCRIPTS-->"
          endTag: "<!--SCRIPTS END-->"
          fileTmpl: "<script src='/%s\'></" + "script>\r\n"
          appRoot: "dist/client/"
        files:
          "dist/client/index.html":
            if isdebug then ["<%= assets.configJs %>", "<%= assets.commonJs %>", "<%= assets.js %>"] else ["<%= assets.configJs %>", minJs]
          "dist/client/admin/admin-login.html":
            if isdebug then ["<%= assets.configJs %>", "<%= assets.commonJs %>", "<%= assets.loginJs %>"] else ["<%= assets.configJs %>", minLoginJs]
          "dist/client/admin/admin-index.html":
            if isdebug then ["<%= assets.configJs %>", "<%= assets.commonJs %>", "<%= assets.adminJs %>"] else ["<%= assets.configJs %>", minAdminJs]

      css:
        options:
          startTag: "<!--STYLES-->"
          endTag: "<!--STYLES END-->"
          fileTmpl: "<link href='/%s' rel='stylesheet' />\r\n"
          appRoot: "dist/client/"
        files:
          "dist/client/index.html": if isdebug then ["<%= assets.commonCss %>", "<%= assets.css %>"] else minCss
          "dist/client/admin/admin-login.html": if isdebug then ["<%= assets.commonCss %>", "<%= assets.loginCss %>"] else minLoginCss
          "dist/client/admin/admin-index.html": if isdebug then ["<%= assets.commonCss %>", "<%= assets.adminCss %>"] else minAdminCss

    clean:
      all:
        src: "dist/**/*"

      server:
        src: "dist/server/**/*"

      redundant:
        src: "<%= assets.redundant %>"

    copy:
      all:
        files: [
          expand: true
          cwd: 'src/client/'
          src: [
            '**/*'
            '!**/*.coffee'
            '!**/*.less'
          ]
          dest: 'dist/client'
        ]

    nodemon:
      dev:
        script: 'server.js'
        options:
          nodeArgs: ['--debug']
          cwd: "dist/server"

    concurrent:
      tasks: ['nodemon', 'watch']
      options:
        logConcurrentOutput: true


  #------------------------------------------------------------

  grunt.registerTask "build", ->
    if isdebug
      grunt.task.run [
        "clean:all"
        "copy"
        "coffee:all"
        "less"
        "scriptlinker"
      ]
    else
      grunt.task.run [
        "clean:all"
        "copy"
        "coffee:all"
        "less"
        "uglify"
        "cssmin"
        "scriptlinker"
        "clean:redundant"
      ]

  grunt.registerTask "build-server", [
    "clean:server"
    "coffee:server"
  ]

  grunt.registerTask "run", [
    "connect"
    "open"
    "concurrent"
  ]

  grunt.registerTask "default", [
    "build"
    "run"
  ]