var gulp = require("gulp");
var browserify = require("browserify");
var reactify = require("reactify");
var source = require("vinyl-source-stream");

gulp.task("bundle", function () {
    return browserify({
        entries: "./app/main.jsx",
        debug: true
    })
    .transform(reactify)
    .bundle()
    .pipe(source("main.js"))
    .pipe(gulp.dest("app/dist"))
});

gulp.task("copy", ["bundle"], function () {
    return gulp.src([
      "app/lib/bootstrap/dist/css/bootstrap.min.*",
      "app/lib/bootstrap/dist/js/bootstrap.min.*",
      "app/lib/jquery/dist/jquery.min.*",
      "app/app.css",
    ])
    .pipe(gulp.dest("app/dist"));
});

gulp.task("copyFonts", function () {
    return gulp.src([
      "app/lib/bootstrap/dist/fonts/*",
    ])
    .pipe(gulp.dest("app/dist/fonts"));
});

gulp.task("default",
  ["copy", "copyFonts"],
  function() {
    console.log("Gulp completed...");
  }
);
