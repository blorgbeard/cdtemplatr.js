'use strict';

var path = require('path');
  
global.PROJECT_ROOT = __dirname;
global.requireShared = function(filename) {
  return require(path.join(__dirname, 'src/shared', filename));
};

var gulp = require("gulp");
var browserify = require("browserify");
var reactify = require("reactify");
var source = require("vinyl-source-stream");
var transformTools = require('browserify-transform-tools');

var config = requireShared('Config');
var getTfs = requireShared('Tfs')(config);

var replaceTokens = transformTools.makeStringTransform(
  "replace_tokens", null, (content, options, done) => {
    var token = "___GULP_WILL_REPLACE_WITH_TFS_BASE_URL___";    
    getTfs.then(tfs => {
      var replacement = tfs.url;
      done(null, content.replace(token, replacement));
    });
  }
);

gulp.task("bundle", function () {
    return browserify({
        entries: "./src/website/app/main.jsx",
        debug: true,
        transform: [replaceTokens]
    })
    .transform(reactify)
    .bundle()
    .pipe(source("main.js"))
    .pipe(gulp.dest("src/website/app/dist"))
});

gulp.task("copy", ["bundle"], function () {
    return gulp.src([
      "src/website/app/*.png",
      "src/website/app/favicon*.*",
      "src/website/app/lib/bootstrap/dist/css/bootstrap.min.*",
      "src/website/app/lib/bootstrap/dist/js/bootstrap.min.*",
      "src/website/app/lib/bootstrap-toggle/css/bootstrap-toggle.min.*",
      "src/website/app/lib/bootstrap-toggle/js/bootstrap-toggle.min.*",
      "src/website/app/lib/toastr/toastr.*",
      "src/website/app/lib/jquery/dist/jquery.min.*",
      "src/website/app/*.css",
    ])
    .pipe(gulp.dest("src/website/app/dist"));
});

gulp.task("copyFonts", function () {
    return gulp.src([
      "src/website/app/lib/bootstrap/dist/fonts/*",
    ])
    .pipe(gulp.dest("src/website/app/dist/fonts"));
});

gulp.task("default",
  ["copy", "copyFonts"],
  function() {
    console.log("Gulp completed...");
  }
);
