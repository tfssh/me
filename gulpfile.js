var env = process.env.BUILD || 'pro'

var gulp = require('gulp'), // 基础库
    imagemin = require('gulp-imagemin'), // 图片压缩
    sass = require('gulp-sass'), // sass
    autoprefixer = require('gulp-autoprefixer'), // css 浏览器前缀
    minifycss = require('gulp-minify-css'), // css压缩
    uglify  = require('gulp-uglify'), // js压缩
    rename = require('gulp-rename'), // 重命名
    concat = require('gulp-concat'), // 合并文件
    clean = require('gulp-clean'), // 清空文件夹
    htmlmin = require('gulp-htmlmin'), // html页面压缩,
    livereload = require('gulp-livereload'),//浏览器自刷新
    // proxyMiddleware = require('http-proxy-middleware'), // 代理中间件
    rev = require('gulp-rev-append'),
    browserSync = require('browser-sync'); // 热加载服务

var browserS = browserSync.create('me'),
    reload = browserSync.get('me').reload;

//可以通过cli独立运行，在实际编译中不执行
gulp.task('clean', function() {
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('test:rev', function() {
  return  gulp.src('./src/index.html')
    .pipe(rev())
    .pipe(gulp.dest('./dist'))
});

gulp.task('brSync', function() {
  if (env === 'dev') {
    browserS.init({
      server: {
        baseDir: './dist',
        // middleware: [targetProxy]
      },
      notify: false,
      port: 3020,
      ui: {
        port: 3021
      }
    });
  }
});

gulp.task('css', function () {
  gulp.src(['./src/scss/*.scss'])
    .pipe(sass({'sourcemap': env !== 'pro'}))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4.0'],
      cascade: true, //是否美化属性值 默认：true
      remove: true //是否去掉不必要的前缀 默认：true
    }))
    .pipe(rename({ 'suffix': '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./dist/css/'));
});


gulp.task('images', function () {
  return gulp.src('./src/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images/'));
});

gulp.task('js', function () {
  return gulp.src(['./src/js/*.js'])
    .pipe(rename({ 'suffix': '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'))
});

gulp.task('html', function () {
  gulp.src(['./src/index.html'])
    .pipe(htmlmin({
      'removeComments': true, // 清除HTML注释
      'collapseWhitespace': true, // 压缩HTML
      'collapseBooleanAttributes': true, // 省略布尔属性的值 <input checked='true'/> ==> <input />
      'removeEmptyAttributes': false, // 不删除所有空格作属性值 <input id=' /> ==> <input />
      'removeScriptTypeAttributes': false, // 不删除<script>的type='text/javascript'
      'removeStyleLinkTypeAttributes': false, // 不删除<style>和<link>的type='text/css'
      'minifyJS': true, // 压缩页面JS
      'minifyCSS': true // 压缩页面CSS
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('awesome', function() {
  gulp.src(['./src/font-awesome/fonts/*'])
    .pipe(gulp.dest('./dist/font-awesome/fonts'));
  gulp.src(['./src/font-awesome/css/*.min.css'])
    .pipe(gulp.dest('./dist/font-awesome/css'));
})

gulp.task('build', ['clean'], function() {
  return gulp.run(['images', 'html', 'css', 'js', 'awesome']);
})

gulp.task('server', [
  'images', 'html', 'css', 'js', 'awesome', 'brSync'], function () {
    livereload.listen();
    gulp.watch(['./src/images/**/*'], ['images']).on('change', reload);
    gulp.watch(['./src/index.html'], ['html']).on('change', reload);
    gulp.watch(['./src/scss/**/*'], ['css']).on('change', reload);
    gulp.watch(['./src/js/*.js'], ['js']).on('change', reload);
});

gulp.task('default', ['server']);
