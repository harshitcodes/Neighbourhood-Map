
// plugins ==
var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    sourcemap = require('gulp-sourcemaps'),
    minifyhtml = require('gulp-minify-html'),
    rename = require('gulp-rename'),
    mainBowerFiles = require('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    jshint = require('gulp-jshint'),
    useref = require('gulp-useref'),
    strip = require('gulp-strip-comments'),
    runSequence = require('run-sequence'),
    cache = require('gulp-cache'),
    del = require('del');


var srcPath = 'src/'; // Path to source files
var distPath = 'dist/'; // Path to distribution files



gulp.task('vendorComponents', function() {
  var jsFilter = gulpFilter('**/*.js', {restore: true}),
      cssFilter = gulpFilter('**/*.css', {restore: true});

  return gulp.src(mainBowerFiles())

  // grab vendor js files from mainBowerFiles. I will not be changing these so:
  // minify then push to both srcPath (for working) and distPath (final)
  .pipe(jsFilter)
  .pipe(uglify())
  .pipe(rename({
    suffix: ".min"
  }))
  .pipe(gulp.dest(srcPath + 'components/js/'))
  .pipe(gulp.dest(distPath + 'components/js/'))
  .pipe(jsFilter.restore)

  // grab vendor css files from mainBowerFiles. I will not be changing these so:
  // minify then push to both srcPath (for working) and distPath (final)
  .pipe(cssFilter)
  .pipe(cleanCSS())
  .pipe(rename({
      suffix: ".min"
  }))
  .pipe(gulp.dest(srcPath + 'components/css/'))
  .pipe(gulp.dest(distPath + 'components/css/'))
  .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
  }));
});


// lint the script files
gulp.task('lint', function() {
   return gulp.src(srcPath +'js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['lint'], function(){
  return gulp.src(srcPath +'js/*.js')
  .pipe(sourcemap.init())
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(sourcemap.write())
  .pipe(gulp.dest(distPath + 'js'))
  .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
  }));
});

// clean CSS - minify it
gulp.task('styles', function(){
  return gulp.src(srcPath +'css/*.css')
  .pipe(cleanCSS())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest(distPath + 'css'))
  .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
  }));
});

gulp.task('content', function() {
  return gulp.src(srcPath + '*.html')
  .pipe(useref())
  .pipe(gulp.dest(distPath))
  .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
  }));
});

gulp.task('hello', function() {
  console.log('Hello Val!');
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: distPath
    }
  });
});

// Watchers on source folders
gulp.task('watch', function() {
  gulp.watch( srcPath +'js/*.js', ['lint', 'scripts']);
  gulp.watch( srcPath +'css/*.css', ['styles']);
  gulp.watch( srcPath +'*.html', ['content']);
  gulp.watch( 'bower_components/**', ['vendorComponents']);
});


// Cleaning
gulp.task('clean', function() {
  return del.sync(distPath).then(function(cb) {
    return cache.clearAll(cb);
  });
});

gulp.task('clean:dist', function() {
  return del.sync([ distPath + '**/*']);
});


gulp.task('default', function(callback) {
  runSequence(['vendorComponents', 'lint', 'scripts', 'styles', 'content', 'browserSync', 'watch'],
    callback
  );
});

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['vendorComponents', 'lint', 'scripts', 'styles', 'content'],
    callback
  );
});
