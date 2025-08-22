// "use strict";
import { src, dest, series, parallel, watch } from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cssbeautify from "gulp-cssbeautify";
import removeComments from "gulp-strip-css-comments";
import rename from "gulp-rename";
import sass from "gulp-dart-sass"; 
import cssnano from "gulp-cssnano";
import plumber from "gulp-plumber";
import panini from "panini";
import { deleteAsync } from "del"; 
import notify from "gulp-notify";
import browserSync from "browser-sync";
import concatCss from "gulp-concat-css";
import combineMq from "gulp-combine-mq";
import concat from "gulp-concat";

const browserSyncInstance = browserSync.create();

/* Paths */
const srcPath = "src/";
const distPath = "dist/";

const path = {
  build: {
    html: distPath,
    js: distPath + "assets/js/",
    css: distPath + "assets/css/",
    images: distPath + "assets/images/",
    fonts: distPath + "assets/fonts/",
  },
  src: {
    html: srcPath + "*.html",
    js: srcPath + "assets/js/**/*.js",
    css: srcPath + "assets/scss/*.scss",
    images:
      srcPath +
      "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
    fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
  },
  watch: {
    html: srcPath + "**/*.html",
    js: srcPath + "assets/js/**/*.js",
    css: srcPath + "assets/scss/**/*.scss",
    images:
      srcPath +
      "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
    fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
  },
  clean: "./" + distPath,
};

/* Tasks */
function server() {
  browserSyncInstance.init({
    server: {
      baseDir: "./" + distPath,
    },
  });
}

function html() {
  panini.refresh();
  return src(path.src.html, { base: srcPath })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "HTML Error",
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(
      panini({
        root: srcPath,
        layouts: srcPath + "layouts/",
        partials: srcPath + "partials/",
        helpers: srcPath + "helpers/",
        data: srcPath + "data/",
      })
    )
    .pipe(dest(path.build.html))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function css() {
  return src(path.src.css, { base: srcPath + "assets/scss/" })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "SCSS Error",
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(
      sass({ includePaths: ["./node_modules/"] }).on("error", sass.logError)
    )
    .pipe(concatCss("style.css"))
    .pipe(combineMq({ beautify: true }))
    .pipe(rename({ suffix: ".min", extname: ".css" }))
    .pipe(dest(path.build.css))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function js() {
  return src(path.src.js, { base: srcPath + "assets/js/" })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: "JS Error",
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function images() {
	return src(path.src.images, { encoding: false })
    .pipe(dest(path.build.images))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function fonts() {
	return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function clean() {
  return deleteAsync(path.clean)
}

function startWatch(done) {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
  watch([path.watch.images], images);
  watch([path.watch.fonts], fonts);
  done()
}

const build = series(clean, parallel(html, css, js, images, fonts));
const run = series(build, startWatch, server);

/* Exports Tasks */
export { html, css, js, images, fonts, build, startWatch };
export default run;
