import gulp        from 'gulp';
import pug         from 'gulp-pug';
import newer       from 'gulp-newer';
import debug       from 'gulp-debug';
import cached      from 'gulp-cached';
import remember    from 'gulp-remember';
import notify      from 'gulp-notify';
import stylus      from 'gulp-stylus';
import nib         from 'nib';
import sourcemaps  from 'gulp-sourcemaps';
import eslint      from 'gulp-eslint';
import del         from 'del';
import browserSync from 'browser-sync';

let bs = browserSync.create();

let dir = {
    root: 'dist',
    css: 'dist/css'
};

const isDev = ! process.env.NODE_ENV || process.env.NODE_ENV === 'dev';

gulp.task('clean', () => {
    return del('./dist/**/*');
});

gulp.task('assets', () => {
    return gulp.src('src/images/**',  {since: gulp.lastRun('assets')})
            .pipe(newer(dir.root))
            .pipe(gulp.dest('dist/images'));
});

gulp.task('pug', () => {
    return gulp.src(['src/templates/**/*.pug', '!src/templates/**/_*.pug'])
            .pipe(pug({
                pretty: true
            }))
            .on('error', notify.onError((error) => {
                return {
                    title: 'Pug templates',
                    message: error.message
                };
            }))
            .pipe(gulp.dest(dir.root))
            .pipe(bs.stream());
});

gulp.task('styles', () => {
    return gulp.src('src/styles/index.styl')
            .pipe(sourcemaps.init())
            .pipe(stylus({use: nib()}))
            .on('error', notify.onError((error) => {
                return {
                    title: 'Styles',
                    message: error.message
                };
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dir.css))
            .pipe(bs.stream());
});

gulp.task('lint', () => {
    return gulp.src('src/js/*.js')
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
});

gulp.task('serve', () => {
    bs.init({
        server: dir.root
    });

    bs.watch('dist/*.html').on('change', bs.reload);
    bs.watch('dist/css/*.css').on('change', bs.reload);
});

gulp.task('watch', () => {
    gulp.watch('src/templates/**/*.pug', gulp.series('pug'));
    gulp.watch('src/styles/**/*.styl', gulp.series('styles'));
});

gulp.task('default', gulp.series('pug', 'styles', 'lint', gulp.parallel('serve', 'watch')));
//gulp.watch('src/images/**', gulp.series('assets'));
