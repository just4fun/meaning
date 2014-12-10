var gulp = require('gulp');

gulp.task('lint', [
  'coffeelint',
  'csslint'
]);
