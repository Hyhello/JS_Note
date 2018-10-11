var gulp = require('gulp');
var del = require('del');
var shelljs = require('shelljs');
var ghPages = require('gulp-gh-pages');
var minifycss = require('gulp-minify-css');
// var uglify = require('gulp-uglify');
// var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
var runSequence = require('run-sequence');
// var gutil = require('gulp-util');
// var babel = require('gulp-babel');
var revDel = require('gulp-rev-delete-original');
var revCollector = require('gulp-rev-collector');
var rev = require('gulp-rev');
var autoprefixer = require('gulp-autoprefixer');
var root = require('./book.json').root;
var buildDir = './dist';
var branch = shelljs.exec('git branch', {silent:true}).stdout.replace(/\*\s+(.*?)\s+/, '$1');

gulp.task('init', function () {
    if (!shelljs.test('-d', root)) {
        shelljs.echo('-e', '正在生成目录：' + root);
        shelljs.mkdir(root);
        shelljs.echo('-e', '生成目录' + root + '完成！');
        shelljs.exec('gulp init');
    } else if (!shelljs.test('-e', root + '/SUMMARY.md')) {
        shelljs.echo('-e', '初始化gitbook项目');
        shelljs.cd(root);
        shelljs.exec('gitbook init');
        shelljs.cd('..');
        shelljs.echo('-e', '初始化gitbook项目完成');
        shelljs.exec('gulp init');
    } else {
        shelljs.echo('-e', '创建SUMMARY依赖文件');
        shelljs.cd(root);
        shelljs.exec('gitbook init');
        shelljs.cd('..');
        shelljs.echo('-e', '创建SUMMARY依赖文件完成');
    }
});

// 压缩 public 目录 css
gulp.task('minify-css', function() {
    return gulp.src(buildDir + '/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(buildDir));
});

// 压缩 public 目录 html
gulp.task('minify-html', function() {
  return gulp.src(buildDir + '/**/*.html')
    .pipe(htmlclean())
    .pipe(htmlmin({
         removeComments: true,
         minifyJS: true,
         minifyCSS: true,
         minifyURLs: true,
    }))
    .pipe(gulp.dest(buildDir))
});

// 压缩 public/js 目录 js
// gulp.task('minify-js', function() {
//     return gulp.src(['./dist/**/*.js'])
//         .pipe(babel())
//         .pipe(uglify())
//         .on('error', function(err) {
//             gutil.log(gutil.colors.red('[Error]'), err.toString());
//         })
//         .pipe(gulp.dest('./dist'));
// });

gulp.task('copy', function () {
    return gulp.src(['./_book/**/*', '!./_book/**/*.md'])
                .pipe(gulp.dest(buildDir + '/' + branch));
});

// 添加hash
gulp.task('rev', function () {
    return gulp.src([buildDir + '/' + branch + '/**/*', '!' + buildDir + '/' + branch + '/CNAME', '!' + buildDir + '/**/index.html', '!' + buildDir + '/' + branch + '/*.json', '!' + buildDir + '/**/*.{otf,woff,svg,woff2,eot,ttf}'])
        .pipe(rev())
        .pipe(revDel())
        .pipe(gulp.dest(buildDir + '/' + branch))
        .pipe(rev.manifest())
        .pipe(gulp.dest(buildDir));
});

// revCollector
gulp.task('revCollector', function () {
    return gulp.src([buildDir + '/**/*.html', buildDir + '/*.json'])
            .pipe(revCollector({replaceReved: true}))
            .pipe(gulp.dest(buildDir));
});

gulp.task('clean:dist', function (cb) {
    return del([buildDir], cb);
});

// clean
gulp.task('clean', function (cb) {
    return del(['./_book'], cb);
});

// 发布
gulp.task('deploy', function () {
    return gulp.src(buildDir + '/**/*')
            .pipe(ghPages({
                branch: 'master'
            }));
});

// build
gulp.task('build', function (cb) {
    runSequence('clean:dist', 'copy', 'minify-html', 'minify-css', 'rev', 'revCollector', cb);
});

gulp.task('serve', ['init'], function () {
    shelljs.exec('gitbook serve');
});

gulp.task('default', ['serve']);
