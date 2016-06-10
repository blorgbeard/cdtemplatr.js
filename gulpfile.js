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
      "app/lib/bootstrap/dist/css/bootstrap.min.css",
      "app/lib/bootstrap/dist/css/bootstrap.min.css.map",
      "app/lib/bootstrap/dist/js/bootstrap.min.js",
      "app/lib/bootstrap/dist/js/bootstrap.min.js.map",
      "app/lib/jquery/dist/jquery.min.js",
      "app/lib/jquery/dist/jquery.min.js.map",
    ])
    .pipe(gulp.dest("app/dist"));
});

gulp.task("default",
  ["copy"],
  function() {
    console.log("Gulp completed...");
  }
);
