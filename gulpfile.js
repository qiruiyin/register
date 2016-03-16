(function(gulp, gulpLoadPlugins){
	var $ = gulpLoadPlugins({
			    pattern: '*',
			    lazy: true
				}),
			_ = {
				app:  'app', 
        dist: 'dist', 
        sass: 'app/sass',
        tmpl: 'app/src',        
        js:   'app/js',
        css:  'app/css',
        img:  'app/img'
			},
			files = [
		    'app/*.html',
		    'app/css/**/*.css',
		    'app/img/**/*',
		    'app/js/**/*.js'
		  ];

	// 处理错误
	function handleError(error){
    console.log(error.message);
    this.emit('end');
  }

  // gulp-jshint
  // js代码校验
  gulp.task('jshint', function() {
    return gulp.src([ 'gulpfile.js' , _.js + '/**/*.js'])
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'));
  });

  // gulp-scss-lint
  // scss校验
  gulp.task('scss-lint', function() {
    return gulp.src([_.sass + '/**/*.{scss, sass}'])
      .pipe($.scssLint({
        'config': '.scsslintrc',
        'customReport': $.scssLintStylish
      }));
  });

	// gulp-sass, gulp-autoprefixer, gulp-sourcemaps
	// 将sass预处理为css，
	// 使用autoprefixer来补全浏览器兼容的css
	// 使用sourcemaps 检查错误
	gulp.task('sass', function(){
		return gulp.src(_.sass + '/*.scss')
			.pipe($.plumber({ errorHandler: handleError}))
			.pipe($.sourcemaps.init())
			.pipe($.autoprefixer({
				browers: ['last 2 versions','safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
			}))
			.pipe($.sass({
        outputStyle: 'expanded',
        includePaths: [ './bower_components/' ]
      }))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest(_.css))
			.pipe($.size({
        title: 'CSS files:'
      }));
	});

  // 渲染html文件模板
  // 使用gulp-file-include合并模板文件
  gulp.task('html', function() {
    return gulp.src([_.tmpl + '/*.html'])
      .pipe($.plumber())
      .pipe($.fileInclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest(_.app + '/'))
      .pipe($.size({
        title: 'HTML files:'
      }));
  });

	// browser-sync
  // 实时将修改信息渲染到浏览器
  gulp.task('browser-sync', function(){
  	$.browserSync.init(files,{
  		server: {
  			baseDir: './app'
  		},
  		port: 9000
  	});
  });

  // 监听修改信息
	gulp.task('watch', function(){
		// 监听css修改
		$.watch([_.sass + '/*.scss'], function(){
			gulp.start('sass');
		});
		// 监听html修改
		$.watch([_.tmpl + '/**/*.html'], function(){
			gulp.start('html');
		});
		gulp.start('browser-sync');
	});

	// 上面是开发环境，下面是打包上线

	// 图片压缩
	gulp.task('image', function(){
		return gulp.src(_.img + '/**/*')
			.pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
			.pipe($.imagemin({
				pregressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [$.imageminPngquant()]
			}))
			.pipe(gulp.dest(_.dist + '/img'))
			.pipe($.size({
				title: 'IMAGE files:'
			}));
	});

	// js、css、html压缩处理（可选）
	// 打包到dist文件夹下
	gulp.task('dist', function(){
		return gulp.src('app/*.html')
			.pipe($.plumber())
			.pipe($.useref())
			.pipe($.if('*.js', $.uglify()))
			.pipe($.if('*.css', $.cssnano()))
			.pipe(gulp.dest(_.dist));
	});

	// 删除dist文件夹
	gulp.task('rimraf', function(){
		return gulp.src(_.dist + '*', {read: false})
			.pipe($.rimraf({force: true}));
	});

	// gulp-start
	// 启动项目
	gulp.task('start', ['watch', 'html', 'sass']);
	// 检查css和js
  gulp.task('test',  ['jshint', 'scss-lint']);
	// 默认
	gulp.task('default', ['html', 'sass', 'rimraf'], function(){
		gulp.start(['image', 'dist']);
	});
})(require('gulp'), require('gulp-load-plugins'));