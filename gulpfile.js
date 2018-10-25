var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var del = require('del');
var shelljs = require('shelljs');
var minifycss = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var ghPages = require('gh-pages');
var autoprefixer = require('gulp-autoprefixer');
var root = require('./book.json').root;
var buildDir = './dist';
var branch = shelljs.exec('git branch | grep "*"', {silent:true}).stdout.replace(/\*\s+(.*?)\s+/, '$1');

gulp.task('syncBookJson', function () {
    var isChange = false;
    var valueList = [];
    var baseDir = branch + '/' + path.basename(root);
    var book = JSON.parse(fs.readFileSync(__dirname + '/' + 'book.json').toString());
    book = JSON.stringify(book, function (key, value) {
        if (key === 'base' && typeof value === 'string') {
            if (!~value.indexOf(baseDir)) {
                isChange = true;
                valueList = value.split('/');
                return valueList.slice(0, valueList.length + path.basename(value) === path.basename(root) ? -2 : -1).join('/') + '/' + baseDir;
            }
        }
        return value;
    }, 4);
    if (isChange) {
        fs.writeFileSync(path.join(__dirname, 'book.json'), book, 'utf-8', function (err) {
            if (err) console.log(err);
        });
    }
});

gulp.task('init', ['syncBookJson'], function () {
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

gulp.task('copy', function () {
    return gulp.src(['./_book/**/*', '!./_book/**/*.md'])
                .pipe(gulp.dest(buildDir));
});

gulp.task('clean:dist', function (cb) {
    return del([buildDir], cb);
});

// clean
gulp.task('clean', ['syncBookJson'], function (cb) {
    return del(['./_book'], cb);
});

// 发布
gulp.task('deploy', function () {
    return ghPages.publish(buildDir, {
        branch: 'master',
        dest: branch
    }, function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
    });
});

// build
gulp.task('build', function (cb) {
    runSequence('clean:dist', 'copy', ['minify-html', 'minify-css'], cb);
});

gulp.task('serve', ['init'], function () {
    shelljs.exec('gitbook serve');
});

gulp.task('default', ['serve']);
