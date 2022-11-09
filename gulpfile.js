var gulp = require("gulp");
var swig = require('gulp-swig');
const { parallel } = require('gulp');

async function templates (){
 return  gulp.src('./src/bs5/main/*.html')
    .pipe(swig({varControls: ['<%=', '%>'],
      }))
      
    .pipe(gulp.dest('./dist/main/'))
}

async function base (){
  gulp.src(['./src/renderer.js'])
  .pipe(gulp.dest('./dist/main/js/'))

  return gulp.src('./src/logo.svg')
  .pipe(gulp.dest('./dist/images/'))
}


async function assets (){

  return gulp.src('./src/bs5/assets/**')
    .pipe(gulp.dest('./dist/assets/'));
}

async function images (){

  return gulp.src('./src/bs5/images/**')
    .pipe(gulp.dest('./dist/images/'));
}

async function main (){

  return gulp.src('./src/bs5/main/*/**')
    .pipe(gulp.dest('./dist/main/'));
}


gulp.task("default",async function(){

  assets();
  images();
  main();
  base();
  templates();
 
})


