#!/usr/bin/env node
"use strict";

var _reactSvgLoader = _interopRequireDefault(require("react-svg-loader"));

var _fs = _interopRequireDefault(require("fs"));

var _yargs = _interopRequireDefault(require("yargs"));

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash.isplainobject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeFilename(filename) {
  return filename + ".react.js";
}

function handlePath(configFile) {
  switch (_path.default.extname(configFile)) {
    case ".yaml":
      return _jsYaml.default.safeLoad(_fs.default.readFileSync(configFile).toString());

    case ".json":
      return JSON.parse(_fs.default.readFileSync(configFile).toString());

    case ".js":
      return require(_path.default.join(process.cwd(), configFile));

    default:
      throw new Error("Unsupported config file format.");
  }
}

function getArgv() {
  return _yargs.default.usage("Usage: $0 [files] [options]").option("jsx", {
    describe: "Output JSX instead of applying babel-preset-react",
    boolean: true,
    default: false
  }).option("stdout", {
    describe: "Print output to stdout",
    boolean: true,
    default: false
  }) // svgo options
  .option("svgo", {
    describe: "Path to YAML or JS or JSON config file for SVGO"
  }).demand(1).version(require("../package.json").version).help("h").alias("h", "help").argv;
}

function getSVGOOpts(argv) {
  var svgoOpts = {};

  if (typeof argv.svgo === "string") {
    svgoOpts = handlePath(argv.svgo);
  } else if ((0, _lodash.default)(argv.svgo)) {
    svgoOpts = argv.svgo; // convert plugin object to array of objects

    if ((0, _lodash.default)(svgoOpts.plugins)) {
      svgoOpts.plugins = Object.keys(svgoOpts.plugins).map(function (key) {
        return {
          [key]: svgoOpts.plugins[key] === "false" ? false : true
        };
      });
    } else if (typeof svgoOpts.plugins === "string") {
      svgoOpts.plugins = [svgoOpts.plugins];
    }
  }

  return svgoOpts;
}

function getLoaderContext(_ref) {
  var argv = _ref.argv,
      query = _ref.query,
      file = _ref.file;
  return {
    query,

    addDependency() {},

    async() {
      return function (err, result) {
        /* eslint-disable no-console */
        if (err) console.error("REACT-SVG-LOADER ERROR", file, err.stack);else if (argv["stdout"]) console.log(result);else _fs.default.writeFileSync(makeFilename(file), result);
        /* eslint-enable */
      };
    }

  };
}

function run() {
  var argv = getArgv();
  var svgoOpts = getSVGOOpts(argv);

  argv._.map(function (file) {
    var source = _fs.default.readFileSync(file);

    var query = {
      svgo: svgoOpts,
      jsx: argv.jsx
    };

    _reactSvgLoader.default.apply(getLoaderContext({
      argv,
      query,
      file
    }), [source]);
  });
}

if (require.main === module) {
  run();
}