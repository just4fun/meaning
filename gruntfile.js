module.exports = function(grunt) {
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
  var isdebug = grunt.option("release") !== true;
  var LIVERELOAD_PORT = 35729;

  grunt.initConfig({
    assets: grunt.file.readJSON("assets.json"),

    connect: {
      options: {
        port: 9000,
        hostname: "localhost"
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              require("connect-modrewrite")([
                "^/admin$ /admin/admin-index.html",
                "^/login$ /admin/admin-login.html",
                "^/\\w+$ /index.html",
                "^/admin/\\w+$ /admin/admin-index.html"
              ]), require("connect-livereload")({
                port: LIVERELOAD_PORT
              }), connect["static"](require("path").resolve("dist/client"))
            ];
          }
        }
      }
    },

    open: {
      server: {
        url: "http://localhost:9000"
      }
    },

    watch: {
      normalFile: {
        files: [
          "src/client/**/*",
          // except files which have no need for watching
          "!src/client/plugin/**/*",
          "!src/client/**/*.less"
        ],
        tasks: ["newer:copy", "scriptlinker"]
      },
      less: {
        files: ["src/client/**/*.less"],
        tasks: ["newer:less", "scriptlinker"]
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        // files which will lead to refresh when changed
        files: [
          "dist/client/**/*",
          // except files which have no need for watching
          "!dist/client/lib/**/*",
          "!dist/client/plugin/**/*"
        ]
      }
    },

    less: {
      compile: {
        files: [
          {
            expand: true,
            cwd: "src/client/",
            src: ["**/*.less"],
            dest: "dist/client",
            ext: ".css"
          }
        ]
      }
    },

    uglify: {
      options: {
        // uglify
        mangle: true,
        // minify
        beautify: false,
        sourceMap: true
      },
      js: {
        src: ["<%= assets.commonJs %>", "<%= assets.js %>"],
        dest: "dist/client/min.js"
      },
      loginJs: {
        src: ["<%= assets.commonJs %>", "<%= assets.loginJs %>"],
        dest: "dist/client/min-login.js"
      },
      adminJs: {
        src: ["<%= assets.commonJs %>", "<%= assets.adminJs %>"],
        dest: "dist/client/min-admin.js"
      }
    },

    cssmin: {
      css: {
        src: ["<%= assets.commonCss %>", "<%= assets.css %>"],
        dest: "dist/client/min.css"
      },
      loginCss: {
        src: ["<%= assets.commonCss %>", "<%= assets.loginCss %>"],
        dest: "dist/client/min-login.css"
      },
      adminCss: {
        src: ["<%= assets.commonCss %>", "<%= assets.adminCss %>"],
        dest: "dist/client/min-admin.css"
      }
    },

    scriptlinker: {
      js: {
        options: {
          startTag: "<!--SCRIPTS-->",
          endTag: "<!--SCRIPTS END-->",
          fileTmpl: "<script src='/%s\'></" + "script>\r\n",
          appRoot: "dist/client/"
        },
        files: {
          "dist/client/index.html": isdebug ? ["<%= assets.configJs %>", "<%= assets.commonJs %>", "<%= assets.js %>"] : ["<%= assets.configJs %>", "dist/client/*.min.js"],
          "dist/client/admin/admin-login.html": isdebug ? ["<%= assets.configJs %>", "<%= assets.commonJs %>", "<%= assets.loginJs %>"] : ["<%= assets.configJs %>", "dist/client/*.min-login.js"],
          "dist/client/admin/admin-index.html": isdebug ? ["<%= assets.configJs %>", "<%= assets.commonJs %>", "<%= assets.adminJs %>"] : ["<%= assets.configJs %>", "dist/client/*.min-admin.js"]
        }
      },
      css: {
        options: {
          startTag: "<!--STYLES-->",
          endTag: "<!--STYLES END-->",
          fileTmpl: "<link href='/%s' rel='stylesheet' />\r\n",
          appRoot: "dist/client/"
        },
        files: {
          "dist/client/index.html": isdebug ? ["<%= assets.commonCss %>", "<%= assets.css %>"] : "dist/client/*.min.css",
          "dist/client/admin/admin-login.html": isdebug ? ["<%= assets.commonCss %>", "<%= assets.loginCss %>"] : "dist/client/*.min-login.css",
          "dist/client/admin/admin-index.html": isdebug ? ["<%= assets.commonCss %>", "<%= assets.adminCss %>"] : "dist/client/*.min-admin.css"
        }
      }
    },

    clean: {
      all: {
        src: "dist/**/*"
      },
      server: {
        src: "dist/server/**/*"
      },
      redundant: {
        src: "<%= assets.redundant %>"
      }
    },

    copy: {
      all: {
        files: [
          {
            expand: true,
            cwd: "src/",
            src: ["**/*", "!**/*.less"],
            dest: "dist/"
          }
        ]
      },
      lib: {
        files: [
          {
            expand: true,
            cwd: "lib",
            src: ["**/*"],
            dest: "dist/client/lib"
          }
        ]
      }
    },

    nodemon: {
      dev: {
        script: "server.js",
        options: {
          nodeArgs: ["--debug"],
          cwd: "dist/server"
        }
      }
    },

    concurrent: {
      tasks: ["nodemon", "watch", "node-inspector"],
      options: {
        logConcurrentOutput: true
      }
    },

    // cache busting
    rev: {
      files: {
        src: ["dist/client/min*.*", "!dist/client/*.map"]
      }
    },

    // for debugging node.js
    "node-inspector": {
      custom: {
        options: {
          "web-port": 1337,
          "web-host": "localhost",
          "debug-port": 5858,
          "save-live-edit": true,
          "no-preload": true,
          "stack-trace-limit": 50,
          "hidden": ["node_modules"]
        }
      }
    }
  });

  grunt.registerTask("build", function() {
    if (isdebug) {
      return grunt.task.run(["clean:all", "copy", "less", "scriptlinker"]);
    } else {
      return grunt.task.run(["clean:all", "copy", "less", "uglify", "cssmin", "rev", "scriptlinker", "clean:redundant"]);
    }
  });
  grunt.registerTask("run", ["connect", "open", "concurrent"]);
  grunt.registerTask("default", ["build", "run"]);
};
