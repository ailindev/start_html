let gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),
    rsync = require('gulp-rsync'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('browser-sync', function () {
   browserSync({
      // proxy: "domain.local",
      server: {
         baseDir: './app'
      },
      notify: false,
      ghostMode: false,
      open: false,
      // online: false, // Work Offline Without Internet Connection
      // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
   })
});

gulp.task('styles', function () {
   return gulp.src('./app/scss/style.scss')
       .pipe(sourcemaps.init())
       .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
       .pipe(rename({suffix: '.min', prefix: ''}))
       .pipe(autoprefixer(['last 15 versions']))
       .pipe(cleancss({level: {1: {specialComments: 0}}})) // Opt., comment out when debugging
       .pipe(sourcemaps.write('./'))
       .pipe(gulp.dest('./app/css'))
       .pipe(browserSync.stream())
});

gulp.task('scripts', function () {
   return gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      './app/js/_custom.js', // Always at the end
   ])
       .pipe(concat('scripts.min.js'))
       // .pipe(uglify()) // Minify js (opt.)
       .pipe(gulp.dest('./app/js'))
       .pipe(browserSync.reload({stream: true}))
});

gulp.task('code', function () {
   return gulp.src('./app/*.html')
       .pipe(browserSync.reload({stream: true}))
});

gulp.task('rsync', function () {
   return gulp.src('./app/**')
       .pipe(rsync({
          root: './app/',
          hostname: 'username@yousite.com',
          destination: 'yousite/public_html/',
          // include: ['*.htaccess'], // Includes files to deploy
          exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
          recursive: true,
          archive: true,
          silent: false,
          compress: true
       }))
});

gulp.task('watch', function () {
   gulp.watch('./app/scss/**/*.scss', gulp.parallel('styles'));
   gulp.watch(['./app/libs/**/*.js', './app/js/_custom.js'], gulp.parallel('scripts'));
   gulp.watch('./app/*.html', gulp.parallel('code'));
});

gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));