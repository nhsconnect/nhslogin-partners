// Core dependencies
const gulp = require('gulp');

// External dependencies
const babel = require('gulp-babel');
const browserSync = require('browser-sync');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const htmlmin = require('gulp-htmlmin');
const nunjucksRender = require('gulp-nunjucks-render');
// const replace = require('gulp-string-replace');
// const notify = require('gulp-notify');
// const debug = require('gulp-debug');

// Local dependencies
const config = require('./app/config');

// Set configuration variables
const port = process.env.PORT || config.port;

// Delete all the files in /public build directory
function cleanPublic() {
  return gulp.src('public', { allowEmpty: true})
  .pipe(clean());
}

// Compile SASS to CSS
function compileStyles() {
  return gulp.src([
    'app/assets/sass/**/*.scss',
    'docs/assets/sass/**/*.scss'
  ])
    .pipe(sass())
    .pipe(gulp.dest('public/css'))
    .on('error', (err) => {
      console.log(err)
      process.exit(1)
    });
}

// Compile JavaScript (with ES6 support)
function compileScripts() {
  return gulp.src([
    'app/assets/javascript/**/*.js',
    'docs/assets/javascript/**/*.js'
  ])
  .pipe(babel())
  .pipe(gulp.dest('public/js'));
}

// Compile Images
function compileImages() {
  return gulp.src([
    'app/assets/images/**/*.*',
    'docs/assets/images/**/*.*'
  ])
  .pipe(gulp.dest('public/images'));
}

// Clean the components folder
function cleanComponents() {
  return gulp.src('app/components', { allowEmpty: true})
  .pipe(clean());
}

// copy the components from nhsuk-frontend
function copyComponents() {
  return gulp.src('node_modules/nhsuk-frontend/packages/components/**/*')
        .pipe(gulp.dest('app/components'));
}

// Start nodemon
function startNodemon(done) {
  const server = nodemon({
    script: 'app.js',
    stdout: false,
    ext: 'scss js html',
    quiet: true,
  });
  let starting = false;

  const onReady = () => {
    starting = false;
    done();
  };

  server.on('start', () => {
    starting = true;
    setTimeout(onReady);
  });

  server.on('stdout', (stdout) => {
    process.stdout.write(stdout);
    if (starting) {
      onReady();
    }
  });
}

function reload() {
  browserSync.reload();
}

// Start browsersync
function startBrowserSync(done){
  browserSync.init({
    proxy: 'localhost:' + port,
    port: port + 1000,
    ui: false,
    files: ['app/views/**/*.*', 'docs/views/**/*.*'],
    ghostmode: false,
    open: false,
    notify: true,
    watch: true,
  }, done);
  gulp.watch("public/**/*.*").on("change", reload);
}

// Compile HTML
function compileHTML() {
  return gulp.src('app/views/**/*.+(html|nunjucks)')
   .pipe(nunjucksRender({
     path: ['app/views', 'app/components']
   }))
    .pipe(htmlmin(
      {
        collapseWhitespace: true,
        removeComments: true
      }))
    .pipe(gulp.dest('public'))
}

// Replace URLS
// This is not pretty, in fact it's quite horrific
// This takes the static files that are output to the public folder
// It loops through all the .html files and looks for internal links
// and adds the .html extension so that it will work in an S3 bucket
// I've search high and low for another method, either express to be
// able to handle .html within the extensions or a way to build the
// static files
// I could improve this by taking the current src and using that to
// check what is referencing it

// function replaceURLS() {
//  return gulp.src('public/**/*.+(html)')
//    .pipe(notify({ message: 'starting' }))
//    .pipe(replace('what-is-nhs-login', 'what-is-nhs-login.html'))
//    .pipe(replace('why-use-nhs-login', 'why-use-nhs-login.html'))
//    .pipe(replace('index', 'index.html'))
//    .pipe(replace('how-it-works', 'how-it-works.html'))
//    .pipe(replace('features', 'features.html'))
//    .pipe(replace('authentication-verification', 'authentication-verification.html'))
//    .pipe(replace('safety-and-security', 'safety-and-security.html'))
//    .pipe(replace('get-started', 'get-started.html'))
//    .pipe(replace('onboarding-summary', 'onboarding-summary.html'))
//    .pipe(replace('request-onboarding', 'request-onboarding.html'))
//    .pipe(notify({ message: 'found one' }))
//    .pipe(gulp.dest('public'));
// }

// Watch for changes within assets/
function watch() {
  gulp.watch('app/assets/sass/**/*.scss', compileStyles);
  gulp.watch('app/assets/javascript/**/*.js', compileScripts);
  gulp.watch('app/assets/images/**/*.*', compileImages);
  gulp.watch('docs/assets/sass/**/*.scss', compileStyles);
  gulp.watch('docs/assets/javascript/**/*.js', compileScripts);
  gulp.watch('docs/assets/images/**/*.*', compileImages);
}

exports.watch = watch;
exports.compileStyles = compileStyles;
exports.compileScripts = compileScripts;
exports.cleanPublic = cleanPublic;

gulp.task('clean', gulp.series(cleanPublic));
gulp.task('HTML', gulp.series(copyComponents, compileHTML));
 gulp.task('public', gulp.series(cleanComponents, copyComponents, cleanPublic, compileScripts, compileImages, compileStyles, compileHTML, cleanComponents));
// gulp.task('replace', gulp.series(replaceURLS));
gulp.task('build', gulp.series(cleanPublic, compileStyles, compileScripts, compileImages));
gulp.task('default', gulp.series(startNodemon, startBrowserSync, watch));
