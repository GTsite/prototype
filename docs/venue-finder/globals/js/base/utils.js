/* eslint-disable no-undef, no-unused-vars, newline-per-chained-call*/
App.prototype.Utils = (function () {
  'use strict';

  const ns = 'gtc';
  // ReSharper disable once JoinDeclarationAndInitializerJs
  let gUtils;
  class Utils extends App {
    constructor() {
      super();
      this.loading = null;
      this.LOCAL = false;
      this.debugState = false;
      this.CSS_NSP = 'gtc-';
      this.JS_NSP = 'js-';
      this.VP = null;
      this.BFS = 20;
      this.EM = '';
      this.TARGET = '';
      this.ARIA_TRIGGER_MENU_ATTRIBUTE = 'aria-expanded';
      this.ARIA_TRIGGER_ACCORDION_ATTRIBUTE = 'aria-expanded';
      this.ARIA_TRIGGER_TAB_ATTRIBUTE = 'aria-selected';

      if (this.Local || window.location.host.match(/.*dev.local*/)) {
        this.DebugMode = true;
        this.Local = true;
      }
      /**
       * List of static CSS Classes to be used throughout the application
       */
      this.CSSCLS = {
        LOADING: {
          BASE: this.JS_NSP + this.CSS_NSP + 'loading',
          BRIGHT: this.JS_NSP + this.CSS_NSP + 'loading--bright',
          OVERLAY: this.JS_NSP + this.CSS_NSP + 'loading__overlay',
          SPIN: this.JS_NSP + this.CSS_NSP + 'loading__spin'
        },
        BODYLOADING: this.JS_NSP + this.CSS_NSP + 'body-loading',
        CONTAINER: {
          BASE: this.CSS_NSP + 'container',
          FLUID: this.CSS_NSP + 'container-fluid'
        }
      };
    }
    //#region Getter & Setter
    /**
     * @returns {bool}: Whether or not the application is running locally.
     */
    get Local() {
      return this.LOCAL;
    }
    /**
     * Sets whether or not the application is running locally.
     * @param {bool} local: Whether or not the application is running locally.
     */
    set Local(local) {
      this.LOCAL = local;
    }
    /**
     * @returns {bool}: Whether or not the application is running locally.
     */
    get DebugMode() {
      return this.debugState;
    }
    /**
     * Sets whether or not the application is running locally.
     * @param {bool} local: Whether or not the application is running locally.
     */
    set DebugMode(mode) {
      this.debugState = mode;
    }
    /**
     * Sets the global css namespace selector use.
     * @param {string} nsp: New namespace.
     */
    set CssNsp(nsp) {
      this.CSS_NSP = nsp;
    }
    /**
     * @returns {string}: The current CSS Namespace selector use.
     */
    get CssNsp() {
      return this.CSS_NSP;
    }
    /**
     * Sets the global js namespace for selector use.
     * @param {string} nsp: New namespace.
     */
    set JsNsp(nsp) {
      this.JS_NSP = nsp;
    }
    /**
     * @returns {string}: The current js Namespace selector use.
     */
    get JsNsp() {
      return this.JS_NSP;
    }

    /**
     * @returns {string}: The current gloabl js namespace for default scenarios.
     */
    get NS() { return ns; }

    set AriaTriggerMenuAttribute(attribute) {
      this.ARIA_TRIGGER_MENU_ATTRIBUTE = attribute;
    }

    get AriaTriggerMenuAttribute() {
      return this.ARIA_TRIGGER_MENU_ATTRIBUTE;
    }

    set AriaTriggerAccordionAttribute(attribute) {
      this.ARIA_TRIGGER_ACCORDION_ATTRIBUTE = attribute;
    }

    get AriaTriggerAccordionAttribute() {
      return this.ARIA_TRIGGER_ACCORDION_ATTRIBUTE;
    }

    set AriaTriggerTabAttribute(attribute) {
      this.ARIA_TRIGGER_TAB_ATTRIBUTE = attribute;
    }

    get AriaTriggerTabAttribute() {
      return this.ARIA_TRIGGER_TAB_ATTRIBUTE;
    }
    /**
     * @returns {string}: The current viewport abbreviation (sm, lg, etc.) or null.
     */
    get Viewport() {
      return this.VP;
    }
    get Target() {
      return this.TARGET;
    }

    set Target($trigger) {
      this.Debug(false, 'Utils: getTarget');
      let target = $trigger.attr('aria-controls') || $trigger.data('target') || $trigger.attr('href');
      if (!target) target = 0;
      this.TARGET = target;
    }
    /**
     * Sets the module name to be used for the fire ready event of the given module and fires the event.
     * @param {string} module: The module name to be used as part of the event identifier.
     */
    set fireReadyEvent(module) {
      this.Debug(false, `Utils: fireReadyEvent for ${module} + => ${this.NS}::${module}::ready`);
      $(window).trigger(`${this.NS}::${module}::ready`);
    }
    //#endregion
    /**
     * Calculates the pixel ratio for the value using the base fontsize as referece and stores that value.
     * @param  {numeric} pixel: pixel value to be set as reference.
     * @param {string}: Either the calculated or stored(pixel NaN) reference or null.
     */
    em(pixel) {
      if (pixel !== null && pixel !== undefined && this.Utils.numeric.isNumber(parseFloat(pixel))) {
        this.EM = ((pixel / this.BFS) * 1) + 'em';
      } else if (this.EM && this.EM.length) return this.EM;
      return null;
    }
    setAriaAttributeValue(el, ariaType, newProperty) {
      this.Utils.Debug(false, 'Utils: setAriaAttribute');
      if (!(el instanceof jQuery)) el.setAttribute(ariaType, newProperty);
      else el[0].setAttribute(ariaType, newProperty);
    }
    /**
     * Logs information for each given value via console.log if the debug mode is active.
     * @param {bool} log: Whether log or debug should be used.
     * @param {...any} args: Arguments to be printed.
     */
    Debug(log, ...values) {
      /* eslint-disable no-console */
      if (this.debugState) {
        if (!$.isFunction(console.debug)) log = true; //IE11
        values.forEach((el) => {
          if (log) console.log(typeof el, el);
          else console.debug(typeof el, el);
        });
      }
      /* eslint-enable no-console */
    }

    /**
    * debouncing, executes the function if there was no new event in $wait milliseconds
    * @param func
    * @param wait
    * @param scope
    * @returns {Function}
    */
    debounce(...args) { // ...args: (func, wait, scope)
      this.Debug(false, 'Utils: Debounce');
      let timeout;
      return function () {
        const context = args[2] || this; // scope
        const later = function () {
          timeout = null;
          args[0].apply(context, args); // func //this behaviour is absolutely undesired and may have side effects in certain situations, I'd advise for a separate set of args for the fuction to be called.
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, args[1]); // wait
      };
    }

    throttle(...args) { // ...args: (fn, threshhold, scope)
      this.Debug(false, 'Utils: Throttle');
      // threshhold || (threshhold = 250);
      var last;
      var deferTimer;
      return function () {
        var context = args[2] || this;

        var now = +new Date();
        // var args = arguments;
        if (last && now < last + args[1]) {
          // hold on to it
          clearTimeout(deferTimer);
          deferTimer = setTimeout(function () {
            last = now;
            args[0].apply(context, args);
          }, args[1]);
        } else {
          last = now;
          args[0].apply(context, args);
        }
      };
    }

    refreshViewportValue(force) {
      const newValue = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/"/g, '');
      this.Debug(false, `Utils: refreshViewportValue : previousViewport: ${this.VP}`);

      if (force === true || (this.VP !== newValue)) {
        $(window).trigger('changeViewport', {
          previousViewport: this.VP,
          currentViewport: newValue
        });
      }

      this.VP = newValue;
      this.Debug(false, `Utils: refreshViewportValue : currentViewport : ${this.VP}`);
    }

    initViewport() {
      this.Debug(false, 'Utils: initViewport');
      this.refreshViewportValue();
      window.addEventListener('resize', this.debounce(this.refreshViewportValue, 250, this));
    }
    //#region Loading
    /**
     * Displays a full size loading indicator, appending it to the given element.
     * @param {$.object} tag: jQuery Element to append it to.
     * @param {bool} [bright=false] Whether or not to show the bright variant.
     */
    showLoading(tag, bright = false) {
      const that = this;
      if (!tag || !tag.length) return;
      if (!that.loading || !that.loading.length) that.loading = $(`<div class= "${that.Utils.CSSCLS.LOADING.BASE}"><div class="${that.Utils.CSSCLS.LOADING.OVERLAY}"></div><div class="${that.Utils.CSSCLS.LOADING.SPIN}"></div></div>`);
      tag.append(that.loading);

      if (bright) that.loading.addClass(that.Utils.CSSCLS.LOADING.BRIGHT);
      else that.loading.removeClass(that.Utils.CSSCLS.LOADING.BRIGHT);

      that.loading.show();
      const parent = tag.parent()[0], spinner = that.loading.find('.' + that.Utils.CSSCLS.LOADING.SPIN);
      if (parent.scrollTop > 0) spinner.css('top', `calc(50 % + ${parent.scrollTop}px - ${spinner.height()}px)`);
      else spinner.css('top', '');
      if (tag[0].tagName.toLowerCase() === 'body') tag.addClass(that.CSSCLS.BODYLOADING);
    }
    /**
     * Hides the previously displayed laoding indidocator.
     * @param {bool} remove: (Optional) Whether or not the element should be removed.
     */
    hideLoading(remove) {
      if (this.loading) {
        if (remove) {
          this.loading.remove();
          this.loading = null;
        } else this.loading.hide();
      }
      $('body').removeClass(this.CSSCLS.BODYLOADING);
    }
    //#endregion

    /**
     * Converts a ES6 Map oject to a default object, using the keys as object prop key.
     * ==> Shallow copies values!!
     * @param {Object<Map>} map: map to be converted.
     */
    mapToObject(map) {
      const ret = {};
      if (map && map instanceof Map) for (const [key, val] of map) ret[key] = val;
      return ret;
    }
    /**
     * Returns a Pseudo random number int the given range.
     * @param {int} min: Minimum value.
     * @param {int} max: Maximum value.
     * @returns {int}: A random number between min (inclusive) and max (exclusive).
     */
    randomNumber(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }
    /**
     * Decodes HTML decodes strings e.g.: &lt; to the appropriate html representation.
     * @param {string} input: Input string to to be decoded.
     * @returns {string}: Decoded Html string or "".
     */
    htmlDecode(input) {
      // handle case of empty input
      const e = document.createElement('textarea');
      e.innerHTML = input;
      return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
    }
    /**
     * Checks whether the current client has touch support.
     * @returns {bool}: Whether or not the current client usees touch controls.
     */
    isTouchEnabled() { return 'ontouchstart' in window ? true : false; }
  }

  //#region request Utility
  /**
   * Contains functionality for handling web server requests.
   */
  const req = {};
  (function () {
    //#region Props
    /**
     * The available request types.
     */
    req.TYPES = {
      POST: 0,
      APIGET: 1,
      APIPUT: 2,
      APITDEL: 3
    };
    //#endregion
    //#region Privates
    /**
     * Sends an ajax request via jQuery for the different request types.
     * @param {req.TYPES int} type: Type of the request.
     * @param {object} opts: Default jQuery Ajax Options.
     * @returns {$.ajax function}: The ajax function call.
     */
    function sendAjax(type, opts) {
      opts = $.extend({
        url: null, method: null, cache: false, async: true, headers: null, data: null
      }, opts);
      if (typeof opts.async !== 'boolean') opts.async = true;
      if (opts.data && opts.contentType && opts.contentType.toLowerCase().indexOf('json') > -1 && typeof opts.data !== 'string') {
        opts.data = JSON.stringify(opts.data);
      }
      //type
      if (type === req.TYPES.POST) opts.method = 'POST';
      else if (type === req.TYPES.APIGET) {
        opts.method = 'GET';
        delete opts.contentType;
      } else if (type === req.TYPES.APIPUT) opts.method = 'PUT';
      else opts.method = 'DELETE';
      //request
      return $.ajax(opts).fail(opts.onFail).done(opts.onDone).then(opts.onThen).always(opts.onAlways);
    }
    //#endregion
    //#region Publics
    /**
     * Sends a post request to the server.
     * @param {object} opts: Default jQuery Ajax Options.
     */
    req.post = function (options) { return sendAjax(req.TYPES.POST, options); };
    /**
     * Sends a post request to the server and sets the content type to JSON.
     * @param {object} opts: Default jQuery Ajax Options.
     */
    req.postJSON = function (options) {
      if (options && typeof options === 'object') options.contentType = 'application/json';
      return req.post(options);
    };
    /**
     * Sends a XMLHttp Request to the server.
     * @param {string} url: Service URL.
     * @param {string} method: Service Method to be called.
     * @param {object} data: Data to be passed.
     * @param {function} success: Success callback.
     * @param {function} error: Error callback.
     * @param {string} methodName: Name of the method in which the error occurred.
     */
    req.sendXMLHttp = function (url, method, data, success, error, methodName) {
      try {
        request.post({
          url: url + '/ ' + method,
          methodName: methodName,
          contentType: 'application/json',
          data: data,
          onDone: success,
          onFail: error
        });
      } catch (e) {
        if ($.isFunction(error)) error.apply(this, 'Error calling the service', url, method, data);
        else {
          GTC.Utils.Debug(false, [`Error calling the webservice @${url}/${method} with the following data: `, data]);
        }
      }
    };
    //#endregion
  })(Utils.prototype.request = req);
  //#endregion
  //#region Url Utils
  /**
   * Url based functions and constants.
   */
  const urls = {};
  (function () {
    //#region Props
    const utils = {
      base: '',
      images: '/build/images/',
      service: {
        base: __IS_LOCAL__ ? 'https://www.geneve.com/api/sitecore/' : '/api/sitecore/',
        venueSearch: 'SearchFilter/',
        searchHotels: 'SearchHotelsJSON',
        searchVenues: 'SearchVenuesJSON',
        searchShortlist: 'SearchShortListItemsJSON',
        toggleShortListItem: 'Shortlist/ToggleShortListItem',
        getShortListCountFor: 'Shortlist/GetShortListCountFor',
        getShortList: 'Shortlist/GetShortList',
        blockCntDetail: 'BlockDetails/RenderContentDetail',
        pdfExporter: 'HtmlToPdf/ConvertPage'
      }
    };
    //#endregion
    //#region Privates
    /**
     * Gets the base urls from window.location.origin.
     */
    function getBaseUrl() { utils.base = window.location.origin; }
    //#endregion
    //#region Publics
    /**
     * @returns {string}: The Url to the common image directory.
     */
    urls.images = function () { return __IS_LOCAL__ ? 'https://www.geneve.com' + utils.images : utils.base + utils.images; };
    /**
     * @returns {string}: The Url to the base service.
     */
    urls.baseService = function () { return utils.service.base; };
    /**
     * @returns {string}: Url to the Venue Hotel search service.
     */
    urls.hotelSearch = function () { return utils.service.base + utils.service.venueSearch + utils.service.searchHotels; };
    /**
     * @returns {string}: Url to the Venue Finder Venue search service.
     */
    urls.venueSearch = function () { return utils.service.base + utils.service.venueSearch + utils.service.searchVenues; };
    /**
     * @returns {string}: Url to the Venue Finder Short list search service.
     */
    urls.shortListSearch = function () { return utils.service.base + utils.service.venueSearch + utils.service.searchShortlist; };
    /**
     * @returns {string}: Url to the Block detail loader API method.
     */
    urls.blockDetails = function () { return utils.service.base + utils.service.blockCntDetail; };
    /**
     * @returns {string}: Url to add new item to Shortlist via API.
     */
    urls.toggleShortListItem = function () { return utils.service.base + utils.service.toggleShortListItem; };
    /**
     * @returns {string}: Url to add new item to Shortlist via API.
     */
    urls.searchShortlistItems = function () { return utils.service.base + utils.service.searchShortlistItems; };
    /**
     * @returns {string}: Url to query the item count for a shortlist.
     */
    urls.queryShortListItemCount = function () { return utils.service.base + utils.service.getShortListCountFor; };
    /**
     * @returns {string}: Url to query the item count for a shortlist.
     */
    urls.getShortlist = function () { return utils.service.base + utils.service.getShortList; };
    /**
     * @returns {string}: Url to pdf page export functionality.
     */
    urls.pdfExporter = function () { return utils.service.base + utils.service.pdfExporter; };
    /**
     * Attempts to get the url parameters form window.location.href;
     * @returns {Map} Map of Url parameters or an empty map.
     */
    urls.getUrlParameters = function () {
      const urlParams = window.location.href.substring(window.location.href.indexOf('?') + 1, window.location.href.length).split('&'),
        parameters = new Map();
      if (urlParams && urlParams.length) for (let i = 0, iLen = urlParams.length; i < iLen; ++i) {
        if (urlParams[i] && urlParams[i].length) {
          const currentParam = urlParams[i].split('=');
          if (!currentParam || !currentParam.length) continue;

          if (parameters.has(currentParam[0])) {
            const pararmObj = parameters.get(currentParam[0]);
            if (Array.isArray(pararmObj.value)) pararmObj.value.push(currentParam[1]);
            else pararmObj.value = [pararmObj.value, currentParam[1]];
          } else parameters.set(currentParam[0], { key: currentParam[0], value: currentParam[1] });
        }
      }
      return parameters;
    };
    /**
     * Attempts to get url parameter witht he given name.
     * @param {string} name Url Parameter name string.
     * @returns {object<string, string>} Url parameter object or null.
     */
    urls.getParameterbyName = function (name) {
      const urlParams = urls.getUrlParameters();
      if (urlParams && urlParams.size) return urlParams.get(name);
      return null;
    };
    //#endregion
    getBaseUrl();
  })(Utils.prototype.urls = urls);
  //#endregion

  //#region numeric utilities.
  /**
   * Numeric functions and constants.
   */
  const nums = {};
  (function () {
    //#region Props
    const utils = {
      sqMtosqFtMulti: 10.76391,
      sqFttoSqMMulti: 0.09290304
    };
    //#endregion
    //#region Privates
    //#endregion
    //#region Publics
    /**
     * Checks whether or not a value is a Numnber in a true way. Null, undefined, "", true will be NaN.
     * @param {any} value: Value to be checked.
     * @returns {bool}: Whether or not the value is a Number.
     */
    nums.isNumber = function (value) { return !isNaN(parseFloat(value)) && isFinite(value) && typeof value === 'number'; };
    /**
     * Converts square meter values to square feet.
     * @param {numeric} value: Value to be converted.
     * @param {numeric} precision: (Optional) Precision of the result (default: 3).
     * @returns {float}: Square feet value with the given precision or 0.
     */
    nums.squareMetersToSquareFeet = function (value, precision) {
      precision = nums.isNumber(precision) && precision > 0 ? precision : 3;
      return nums.isNumber(value) ? parseFloat((parseFloat(value) * utils.sqMtosqFtMulti).toFixed(precision)) : 0;
    };
    /**
     * Converts square feet values to square meter.
     * @param {numeric} value: Value to be converted.
     * @param {numeric} precision: (Optional) Precision of the result (default: 3).
     * @returns {float}: Square meter value with the given precision or 0.
     */
    nums.squareFeetToSquareMeter = function (value, precision) {
      precision = nums.isNumber(precision) && precision > 0 ? precision : 3;
      return nums.isNumber(value) ? parseFloat((parseFloat(value) * utils.sqFttoSqMMulti).toFixed(precision)) : 0;
    };
    //#endregion
  })(Utils.prototype.numeric = nums);
  //#endregion

  //#region cookie utilities.
  /**
   * Cookie functions.
   */
  const cookie = {};
  (function () {
    //#region Publics
    /**
     * Returns the cookie value  for the cookie with the given name or null.
     * @param {string} name: Name of the cookie at the current path.
     * @returns {Array<string>}: Cookie value(s) or null.
     */
    cookie.getCookie = function (name) {
      if (cookie.hasCookie(name)) {
        let cookies = document.cookie;
        const vals = [];
        if (cookies.indexOf(name) > -1) {
          cookies = cookies.split(';');
          for (let i = 0, iLen = cookies.length; i < iLen; ++i) if ((cookies[i].substring(0, cookies[i].indexOf('='))).trim() === name) vals.push((cookies[i].substring(cookies[i].indexOf('=') + 1, cookies[i].length)).trim());
        }
        return vals;
      }
      return null;
    };
    /**
     * Sets an new cookie with the specified values.
     * @param {string} name: The name the cookie is supposed to have.
     * @param {string} value: The string values the cookie is supposed to have.
     * @param {int} expires: (Optional) The expiration in days from now (default: "").
     * @param {string} path: (Optional) The path to set the cookie to. (default: "/");
     * @param {bool} secure: (Optional) Whether or not the secure param should be set.
     */
    cookie.setCookie = function (name, value, expires, path, secure) {
      if (name && name.length && typeof value === 'string') {
        let newCookie;
        newCookie = name + '=' + value;
        if (!isNaN(expires) && expires > 0) newCookie += '; expires=' + new Date(Date.now() + (parseInt(expires) * 24 * 60 * 60 * 1000)).toGMTString();
        else newCookie += '; expires= ';
        if (secure) newCookie += ';secure';
        if (path && typeof path === 'string' && path.length) newCookie += ';path=' + path;
        else newCookie += ';path=/';
        //set
        document.cookie = newCookie;
      }
    };
    /**
     * Whether or not the cookie to be tested exists.
     * @param {string} name: Name of the Cookie.
     */
    cookie.hasCookie = function (name) {
      if (name && name.length) {
        let cookies = document.cookie;
        if (cookies.indexOf(name) > -1) {
          cookies = cookies.split(';');
          for (let i = 0, iLen = cookies.length; i < iLen; ++i) if ((cookies[i].substring(0, cookies[i].indexOf('='))).trim() === name) return true;
        }
      }
      return false;
    };
    //#endregion
  })(Utils.prototype.cookie = cookie);
  //#endregion

  //#region Viewport
  /**
   * Url based functions and constants.
   */
  const viewport = {};
  (function () {
    //#region Privates
    //#endregion
    //#region publics
    /**
     * Available viewport types.
     */
    viewport.TYPES = {
      XS: 'xs',
      SM: 'sm',
      MD: 'md',
      LG: 'lg',
      XL: 'xl'
    };
    /**
     * @returns {string} The currently active viewport value.
     */
    viewport.current = function () { return gUtils.VP; };
    /**
     * Returns whether or not the device is a mobile/tablet.
     * @returns {bool} Whether or not a the current device is mobile not.
     */
    viewport.isMobile = function () { return window.orientation ? true : false; };
    /**
     * Returns whether or not the current orientation is landscape.
     * @returns {bool} Whether or not the current orientation is landscape.
     */
    viewport.isLandscape = function () { return window.orientation ? window.orientation === 90 || window.orientation === 270 : $(window).width() >= $(window).height(); };
    /**
     * Returns whether or not the current orientation is portrait.
     * @returns {bool} Whether or not the current orientation is portrait.
     */
    viewport.isPortrait = function () { return window.orientation ? window.orientation === 0 || window.orientation === 180 : $(window).width() <= $(window).height(); };
    //#endregion
  })(Utils.prototype.viewport = viewport);
  //#endregion
  //#region Singleton Init
  gUtils = new Utils();
  return gUtils;
  //#endregion
}());
