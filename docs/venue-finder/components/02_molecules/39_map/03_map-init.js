'use strict';

/**
 * Handles the initilization of the maps for the specific contexts.
 * Calls the initializer of the Maps elements, once the google script finished loading.
 */
function gtcInitMap(context) {  // eslint-disable-line
  const gtc = window.GTC || {};
  if (!gtc.Utils) {
    window.setTimeout(() => { gtcInitMap(context); }, 350);
    return;
  }
  gtc.Utils.Debug(false, 'Map: init call from google');
  if (context && $(context).hasClass('.gtc-block__box')) gtc.MapBase.initMap(context);
  else {
    gtc.Utils.Debug(false, 'Map: Initialize the venue map context.');
    if (!gtc.MapVenue.initialized()) gtc.MapVenue.initMap(context);
    //init the base map too
    gtc.MapBase.initMap(context);
  }
}

window.gtcInitMap = gtcInitMap;