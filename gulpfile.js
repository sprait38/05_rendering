const { src, dest, series, watch } = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const svgSprite = require('gulp-svg-sprite')
const image = require('gulp-image')
const babel = require('gulp-babel')
const notify = require('gulp-notify')
const uglify = require('gulp-uglify-es').default
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const ttfWoff = require('gulp-ttf2woff')
const ttfWoff2 = require('gulp-ttf2woff2')
const webp = require('gulp-webp');
var rename = require("gulp-rename")
var groupMedia = require('gulp-group-css-media-queries');
const sass = require('gulp-sass')(require('sass'))
const browserSync = require('browser-sync').create()

// DEV
const clean = () => {
  return del(['dist'])
}

const fonts = () => {
  src('src/fonts/**/*.ttf')
    .pipe(ttfWoff())
    .pipe(dest('dist/fonts'))
  return src('src/fonts/**/*.ttf')
    .pipe(ttfWoff2())
    .pipe(dest('dist/fonts'))
}

const resourses = () => {
  return src('src/resourses/**')
    .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const sassCompile = () => {
  return src('src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', notify.onError()))
    .pipe(sourcemaps.write())
    .pipe(dest('src/styles'))
    .pipe(browserSync.stream())
}

const styles = () => {
  return src('src/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({
      outputStyle: 'expanded',
    }).on('error', notify.onError()))
    .pipe(groupMedia())
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
      flexbox: true,
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
};

const html = () => {
  return src('src/**/*.html')
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/img/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/img'))
    .pipe(browserSync.stream())
}

const scripts = () => {
  return src([
    'src/js/**/*.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('script.js'))
    .pipe(dest('dist/js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false,
  })
}

const images = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.png',
    'src/img/**/*.jpeg',
    'src/img/**/*.svg',
  ])
    .pipe(image())
    .pipe(webp({
      quality: 75,
    }))
    .pipe(dest('dist/img'))
    .pipe(browserSync.stream())
}

watch('src/**/*.html', html)
watch('src/styles/**/*.css', styles)
watch('src/js/**/*.js', scripts)
watch('src/resourses/**', resourses)
watch('src/fonts/**.ttf', fonts)
watch('src/images/svg/**/*.svg', svgSprites)
watch([
  'src/img/**/*.jpg',
  'src/img/**/*.png',
  'src/img/**/*.jpeg',
], images);

exports.clean = clean
exports.styles = styles
exports.scripts = scripts
exports.html = html
exports.fonts = fonts
exports.images = images;
exports.default = series(clean, fonts, resourses, html, scripts, sassCompile, styles, images, svgSprites, watchFiles)

//build
const htmlBuild = () => {
  return src('src/**/*.html')
    .pipe(htmlMin({
      collapseWhitespace: true
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const stylesBuild = () => {
  return src('src/scss/style.scss')
    .pipe(sass({
      outputStyle: 'expanded',
    }).on('error', notify.onError()))
    .pipe(groupMedia())
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
      flexbox: true,
    }))
    .pipe(cleanCSS({
      level: 2,
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
};

const scriptsBuild = () => {
  return src([
    'src/js/**/*.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('script.js'))
    .pipe(uglify({
      toplevel: true,
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
}

function imagesBuild() {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.png',
    'src/img/**/*.jpeg',
  ])
    .pipe(image())
    .pipe(webp({
      quality: 75,
    }))
    .pipe(dest('dist/img'))
    .pipe(browserSync.stream())
}


exports.htmlBuild = htmlBuild
exports.stylesBuild = stylesBuild
exports.scriptsBuild = scriptsBuild
exports.imagesBuild = imagesBuild
exports.build = series(clean, fonts, resourses, htmlBuild, stylesBuild, scriptsBuild, svgSprites, imagesBuild) // watchFiles не надо в билде
