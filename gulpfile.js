var gulp = require("gulp");

gulp.task("copy", function () {
    return gulp.src([
      "app/index.html"
    ])
    .pipe(gulp.dest("app/dist"));
});

gulp.task("default",
  ["copy"],
  function() {
    console.log("Gulp completed...");
  }
);
