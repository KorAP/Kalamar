(async function() {
  const originalOnload = window.onload;
  window.onload = function() {};

  const script = document.createElement('script');
  script.src = '/__moduleRoot__/dev/js/lib/require.js';

  const libs = [
   // "dagre.js"
  ];
  
  script.onload = async function() {
    require.config({
      baseUrl: '/__src__',
      paths: { spec: '/__spec__' }
    });
    
/*   const specUrls = await discoverSpecs();
    const specModules = specUrls.map(url =>
      'spec/' + url.replace(/\.js$/, '').replace(/^\//, '')
    );
*/
    const specModules = [
      "/__spec__/alwaysMenuSpec.js",
      "/__spec__/buttongroupSpec.js",
      "/__spec__/containerMenuSpec.js",
      "/__spec__/corpusByMatchSpec.js",
      "/__spec__/datepickerSpec.js",
      // -> "/__spec__/hintSpec.js",
      // -> "/__spec__/matchSpec.js",
      "/__spec__/menuSpec.js",
      "/__spec__/pageInfoSpec.js",
      // -> "/__spec__/panelSpec.js"
      "/__spec__/pipeSpec.js",
      // -> "/__spec__/pluginSpec.js",
      "/__spec__/queryCreatorSpec.js",
      "/__spec__/selectMenuSpec.js",
      "/__spec__/sessionSpec.js",
      "/__spec__/stateSpec.js",
      "/__spec__/statSpec.js",
      // -> "/__spec__/tourSpec.js"
      "/__spec__/tutSpec.js",
      "/__spec__/utilSpec.js",
      // -> "/__spec__/vcSpec.js",
      // -> "/__spec__/viewSpec.js"
    ];
    console.log('[RequireJS] Loading specs:', specModules);

    require(specModules, function() {
      setTimeout(() => {
        if (originalOnload) originalOnload();
        else jasmine.getEnv().execute();
      }, 0);
    });
  };

  document.head.appendChild(script);

  for (let i = 0; i < libs.length; i++) {
    const libe = document.createElement('script');
    libe.src = '/__moduleRoot__/dev/js/lib/' + libs[i];
    document.head.appendChild(libe);  
  };
    

  async function discoverSpecs() {
    try {
      const res = await fetch('/__spec__/');
      const text = await res.text();
      const matches = [...text.matchAll(/href="([^"]+Spec\.js)"/gi)];
      return matches.map(m => m[1]);
    } catch (err) {
      console.error('Failed to fetch spec list:', err);
      return [];
    }
  }
})();


/*
function discoverSpecs() {
  return fetch('/__spec__/')
    .then(res => res.text())
    .then(text => {
      const matches = [...text.matchAll(/href="([^"]+Spec\.js)"/gi)];
      return matches.map(m => m[1]);
    })
    .catch(err => {
      console.error('Failed to fetch spec list:', err);
      return [];
    });
}

(function() {
  // Prevent Jasmine auto-execution
  const originalOnload = window.onload;
  window.onload = function() {};

  const script = document.createElement('script');

  // Import RequireJS from the import map
  // const requirejs = await import('requirejs');

  
  script.src = './__moduleRoot__/dev/js/lib/require.js'; // jasmine-browser serves /base/ from project root
  script.onload = function() {
    // Basic RequireJS setup — no spec list, just config
    require.config({
      // baseUrl: '/dev/js/src',
      baseUrl: '/__src__',
      paths: {
	spec: '/__spec__/'
        // You can map module IDs if needed
        // 'jquery': '../lib/jquery.min'
      }
    });


    
    // Automatically find all *Spec.js files under /__spec__/
    // const specUrls = discoverSpecs();

    // Convert URLs to RequireJS module IDs ("spec/filename")
    // const specModules = specUrls.map(url =>
    //   'spec/' + url.replace(/\.js$/, '').replace(/^\//, '')
    // );

    // console.log('[RequireJS] Loading specs:', specModules);

    // Manually load all your specs via RequireJS
   
    discoverSpecs().then(specUrls => {
      console.log("----");
      const specModules = specUrls.map(url =>
        '/__spec__/' + url.replace(/\.js$/, '').replace(/^\//, '')
      );

      console.log('[RequireJS] Loading specs:', specModules);
    
      require(specModules, function() {

	setTimeout(() => {
	  // Once RequireJS is available, restore Jasmine’s boot
	  if (originalOnload) {
	    originalOnload();
	  } else {
	    jasmine.getEnv().execute();
	  }
	}, 0);
      });
    });
  };

  document.head.appendChild(script);

})();
*/
