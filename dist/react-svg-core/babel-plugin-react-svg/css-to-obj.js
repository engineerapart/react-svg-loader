"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cssToObj;

function cssToObj(css) {
  var o = {};
  var elements = css.split(";");
  elements.filter(function (el) {
    return !!el;
  }).map(function (el) {
    var s = el.split(":"),
        key = s.shift().trim(),
        value = s.join(":").trim();
    o[key] = value;
  });
  return o;
}