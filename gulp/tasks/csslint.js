var gulp = require('gulp');
var csslint = require('gulp-csslint');

gulp.task('csslint', function() {
  gulp.src([
  	'src/client/**/*.css',
    '!src/client/css/others/**/*.css',
    '!src/client/plugin/**/*.css'
  ])
  .pipe(csslint())
  .pipe(csslint.reporter());
});