export default {
  srcDir: "dev/js/src",
  // srcFiles: [
  //  "**/*.js"
  //],
  specDir: "dev/js/spec",
  //specFiles: [
  //  "**/*[sS]pec.js"
  //],
  helpers: [
    "helpers/requirejs-bootstrap.js",
    "helpers/**/*.js"
  ],
  "importMap":{
    "imports":{
      "requirejs": "/dev/js/lib/require.js",
      "lib/dagre": "/dev/js/lib/dagre.js"
    }
  },
  env: {
    stopSpecOnExpectationFailure: false,
    stopOnSpecFailure: false,
    random: true,
    // Fail if a suite contains multiple suites or specs with the same name.
    forbidDuplicateNames: true
  },

  "random":false,

  // For security, listen only to localhost. You can also specify a different
  // hostname or IP address, or remove the property or set it to "*" to listen
  // to all network interfaces.
  listenAddress: "localhost",

  // The hostname that the browser will use to connect to the server.
  hostname: "localhost",

  browser: {
    name: "firefox"
  }
};
