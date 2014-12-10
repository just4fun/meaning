var gulp = require('gulp');
var coffeelint = require('gulp-coffeelint');

gulp.task('coffeelint', function () {
  gulp.src([
    'src/client/**/*.coffee',
    '!src/client/js/directives/vendor/**/*.coffee',
    '!src/client/js/vendor/**/*.coffee',
    '!src/client/plugin/**/*.coffee',

    "src/server/**/*.coffee"
  ])
  .pipe(coffeelint())
  .pipe(coffeelint.reporter());
});