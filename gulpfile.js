/**
 * 作者：yeshengqiang
 * 时间：2019-06-11
 * 描述：渲染
 */

 var fs = require('fs');
 var gulp = require('gulp');
 var config = JSON.parse(fs.readFileSync('./.hyhellorc').toString());
 console.log(config.title);