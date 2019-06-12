var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var del = require('del');
var shelljs = require('shelljs');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var ghPages = require('gh-pages');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var postcss = require('gulp-postcss');
var root = require('./book.json').root;
var buildDir = './dist';
// 过滤
var opacity = function (opts) {
    return function (css) {
        css.walkDecls(function(decl) {
            if (decl.prop === 'opacity') {
                decl.parent.insertAfter(decl, {
                    prop: '-ms-filter',
                    value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
                });
            }
        });
    };
};
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
                return valueList.slice(0, valueList.length + (path.basename(value) === path.basename(root) ? -2 : -1)).join('/') + '/' + baseDir;
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
        shelljs.echo('-e', '\033[30;36minfo:\033[0m 正在生成目录：' + root);
        shelljs.mkdir(root);
        shelljs.echo('-e', '\033[30;36minfo:\033[0m 生成目录' + root + '完成！');
    }
    if (!shelljs.test('-e', root + '/SUMMARY.md')) {
        shelljs.echo('-e', '\033[30;36minfo:\033[0m 创建SUMMARY依赖文件');
        shelljs.cd(root);
        shelljs.exec('gitbook init');
        shelljs.cd('..');
        shelljs.echo('-e', '\033[30;36minfo:\033[0m 创建SUMMARY依赖文件完成');
        shelljs.exec('gulp init');
    } else {
        shelljs.echo('-e', '\033[30;36minfo:\033[0m 初始化gitbook项目');
        shelljs.cd(root);
        shelljs.exec('gitbook init');
        shelljs.cd('..');
        shelljs.echo('-e', '\033[30;36minfo:\033[0m 初始化gitbook项目完成');
    }
});

// 压缩 public 目录 css
gulp.task('minify-css', function() {
    return gulp.src(buildDir + '/**/*.css')
        .pipe(postcss(
            [
                autoprefixer(),
                opacity(),
                cssnano()
            ]
        ))
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
    .pipe(gulp.dest(buildDir));
});

// 压缩图片
gulp.task('minify-image', function () {
    return gulp.src(buildDir + '/**/*.{png,jpg,gif,ico}')
                .pipe(cache(imagemin({
                    interlaced: true,
                    progressive: true,
                    optimizationLevel: 5,
                    svgoPlugins: [
                        {
                            removeViewBox: true
                        }
                    ]
                })))
                .pipe(gulp.dest(buildDir));
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
    runSequence('clean:dist', 'copy', ['minify-html', 'minify-css', 'minify-image'], cb);
});

gulp.task('serve', ['init'], function () {
    shelljs.exec('gitbook serve');
});

gulp.task('default', ['serve']);
