/* eslint-disable no-underscore-dangle, no-undef, prefer-const, no-restricted-properties*/
const VenueFinderListUnit = require('../36_venue-finder_utils/00_venue-finder-list-class-2').default;

/**
 * JavaScript component handling the venue finder map functionality.
 */
App.prototype.MapVenue = (function () {
  'use strict';

  //#region Props
  const utils = {
    locations: {
      geneve: { lat: 46.2050282, lng: 6.126579 }
    },
    mapBaseZoom: 12,
    elements: {
      mapRow: null,
      mapEl: null,
      mainNav: null,
      filterBox: null,
      viewSwitcher: null,
      loading: null
    },
    state: {
      initMapWithElement: false,
      initMapContext: null,
      mapInitilialized: false,
      map: null,
      pins: null,
      filtered: [],
      allowHotels: false,
      currentPopup: null,
      ignorenNextPopupEvent: false //whether or not to ignore the next popup event when it does not have the current id, since it is closed already. The reason being that the show and hide is triggered on click, but the drag-detection works on mousedown.
    },
    mapSizes: {
      minHeightByViewPort: {
        xs: 444,
        sm: 444,
        md: 536,
        lg: 536,
        xl: 536
      },
      minH: null,
      maxH: 3000
    },
    /**
     * Labels for the popup stuff, since we don't have a clientside store.
     */
    popupLabels: {
      meetingRooms: {
        title: null
      },
      largestRoomsmq: {
        title: null,
        unit: null,
        unitId: null
      },
      largestRoomsq: {
        title: null,
        unit: null,
        unitId: null
      },
      theatherCapacity: {
        title: null
      },
      numberOfRooms: {
        title: null
      },
      addToShortList: {
        title: null
      }
    }
  };
  let venueMap = null,
    google = null;
  /**
   * Defines classes to be used.
   */
  const CSSCLS = {
    FILTERBOX: 'gtc-filter',
    MAINNAV: 'gtc-navigation-main__wrapper',
    FILTERITEMACTIVE: 'js-gtc-filter__item-active',
    FILTERLIST: 'gtc-filter__list',
    FILTERLISTPOPUP: 'gtc-filter__popup-list',
    FILTERPOPVIS: 'gtc-filter__popup--visible',
    JSFILTERITEM: 'js-gtc-filter__item',
    MAPEL: 'gtc-ven-map__el',
    MAPLOADING: 'gtc-ven-map__loading',
    SLIDER: 'gtc-slider',
    MAPROW: 'gtc-row--venue-map',
    MAPROWHIDDEN: 'gtc-row--venue-map-hidden',
    VIEWSWITCHER: 'gtc-venue-finder-view-switcher'
  };
  //#endregion
  //#region Privates
  /**
   * Checks whether or not the map should grow for the mobile view and applies the settings if neccessary.
   */
  function growMapForMobile() {
    //if we are sm or smaller
    if (venueMap.Utils.viewport.current() === venueMap.Utils.viewport.TYPES.XS || venueMap.Utils.viewport.current() === venueMap.Utils.viewport.TYPES.SM) {
      utils.elements.mapEl.parent().parent().css({ 'margin-left': '', 'margin-right': '' }).data('margin-set', false);
      let margin = (utils.elements.mapEl.parent().parent().width() - $(window).width()) / 2;
      if (margin < 0) utils.elements.mapEl.parent().parent().css({ 'margin-left': margin + 'px', 'margin-right': margin + 'px' }).data('margin-set', true);
    } else if (utils.elements.mapEl.parent().parent().data('margin-set')) {
      utils.elements.mapEl.parent().parent().css({ 'margin-left': '', 'margin-right': '' }).data('margin-set', false);
    }
  }
  /**
   * Updates the map min-height according to the viewport.
   */
  function updateMapMinHeight() {
    switch (venueMap.Utils.viewport.current()) {
      case venueMap.Utils.viewport.TYPES.XS:
      case venueMap.Utils.viewport.TYPES.SM:
        if (venueMap.Utils.viewport.isMobile() && utils.mapSizes.minHeightByViewPort[venueMap.Utils.VP] === 'auto' && venueMap.Utils.viewport.isLandscape()) utils.mapSizes.minH = utils.mapSizes.minHeightByViewPort.md;
        else utils.mapSizes.minH = utils.mapSizes.minHeightByViewPort[venueMap.Utils.VP];
        break;
      case venueMap.Utils.viewport.TYPES.MD:
        utils.mapSizes.minH = utils.mapSizes.minHeightByViewPort.md;
        break;
      case venueMap.Utils.viewport.TYPES.LG:
        utils.mapSizes.minH = utils.mapSizes.minHeightByViewPort.lg;
        break;
      case venueMap.Utils.viewport.TYPES.XL:
        utils.mapSizes.minH = utils.mapSizes.minHeightByViewPort.xl;
        break;
      default:
        utils.mapSizes.minH = utils.mapSizes.minHeightByViewPort.md;
    }
  }
  /**
   * Handles the map resize.
   * @param {bool} [specificSize=false] Whether or not to set a specific size.
   * @param {int} [w=null] An Explicit with to set.
   * @param {int} [h=null] An Explicit height to set.
   */
  function resizeMap(specificSize, w, h) {
    if (utils.elements.mapEl && utils.elements.mapEl.length && utils.elements.mapRow.is(':visible')) {
      if (specificSize === true) {
        utils.elements.mapEl.css('min-height', '').parent().css('min-height', '').parent().css('min-height', '');
        utils.elements.mapEl.css({ width: w, height: h }).parent().css({ width: w, height: h }).parent().css({ width: w, height: h });
        utils.elements.mapEl.data('glued-to-size', true);
      } else {
        if (utils.elements.mapEl.data('glued-to-size')) return;
        //remove min-height override
        utils.elements.mapEl.css('min-height', '').parent().css('min-height', '').parent().css('min-height', '');
        updateMapMinHeight();

        //set the new height of the map element based on the available height minus filter view or window height minus offset
        let newHeight = $(window).height();
        if (venueMap.Utils.viewport.current() !== venueMap.Utils.viewport.TYPES.XS && venueMap.Utils.viewport.current() !== venueMap.Utils.viewport.TYPES.SM) newHeight -= utils.elements.filterBox.outerHeight(true) > 0 ? utils.elements.filterBox.outerHeight(true) : 0;
        newHeight -= utils.elements.viewSwitcher.outerHeight(true) > 0 ? utils.elements.viewSwitcher.outerHeight(true) : 0;

        //subtract main header height
        if (utils.elements.mainNav.is(':visible')) newHeight -= utils.elements.mainNav.outerHeight(true);

        //check against minH
        if (utils.mapSizes.minH === 'auto') {
          if (venueMap.Utils.viewport.current() === venueMap.Utils.viewport.TYPES.XS || venueMap.Utils.viewport.current() === venueMap.Utils.viewport.TYPES.SM) newHeight = ($(window).height() * 0.9) - utils.elements.viewSwitcher.outerHeight(true);
        } else if (newHeight < utils.mapSizes.minH) {
          newHeight = utils.mapSizes.minH;
        } else if (newHeight > utils.mapSizes.maxH) {
          newHeight = utils.mapSizes.maxH;
        }
        //make sure the element cannot grow too big
        if (newHeight !== utils.elements.mapEl.height() || newHeight !== utils.elements.mapEl.parent().parent().height()) utils.elements.mapEl.height(newHeight).parent().height(newHeight).parent().height(newHeight);
        //override css min-height if it outgrows the screens "capacity"
        window.setTimeout(function () {
          if (utils.elements.mapEl.data('glued-to-size')) return;
          if (newHeight !== utils.elements.mapEl.height()) {
            const maxMinHeight = $(window).height() * 0.9;
            utils.elements.mapEl.css('min-height', maxMinHeight + 'px').parent().css('min-height', maxMinHeight + 'px').parent().css('min-height', maxMinHeight + 'px');
          }
        }, 0);
        growMapForMobile();
      }
    }
  }
  /**
   * Initializes the elements required on this page.
   */
  function initElements() {
    utils.elements.mapRow = $(`.${CSSCLS.MAPROW}`);
    utils.elements.mainNav = $(`.${CSSCLS.MAINNAV}`);
    utils.elements.viewSwitcher = $(`.${CSSCLS.VIEWSWITCHER}`);
    utils.elements.mapEl = $(`.${CSSCLS.MAPEL}`);
    utils.elements.filterBox = $(`.${CSSCLS.FILTERBOX}`);
    utils.elements.loading = $(`.${CSSCLS.MAPLOADING}`);
    $(window).resize(venueMap.Utils.debounce(resizeMap, 500, venueMap.Utils));
    venueMap.Utils.refreshViewportValue(true);
    resizeMap();
    //initialize the map, if neccessary
    if (utils.state.initMapWithElement) {
      venueMap.initMap(utils.state.initMapContext);
      utils.state.initMapWithElement = false;
    }
  }
  /**
   * Processes the service data by creating local objects of it.
   * @param {Object} data: Pre-processed location data containing at least a "Venues" Array prop.
   */
  function processData(data) {
    if (data && data.data && data.data.length) for (let i = 0, iLen = data.data.length; i < iLen; ++i) {
      venueMap.addPin(data.data[i]);
    }
  }
  /**
   * Filters the data, ensuring that only the elements contained within the result set are being rendered.
   * @param {Object} data Pre-processed location data containing at least a "Venues" Array prop.
   * @param {bool} hotelCall Whether or not this is a hotel call.
   * @param {bool} [noDiff = false] Whether or not we should ignore the differentiation between Venues and pure hotels.
   */
  function filter(data, hotelCall, noDiff = false) {
    //deactivate all elements
    const filterList = [];
    utils.state.filtered = [];
    if (!utils.state.pins) utils.state.pins = new Map();
    //add all allowed elements
    if (data && data.data && data.data.length) {
      for (let i = 0, iLen = data.data.length; i < iLen; ++i) filterList.push(data.data[i].id);
    }
    //process all items and set the render state
    let val, it = utils.state.pins.values();
    while ((val = it.next().value) && val) {
      if (noDiff) {
        //allow all Hotels items being currently filtered and other items that are visible
        if (filterList.indexOf(val.id) > -1) {
          val.render = true;
          utils.state.filtered.push(val.id);
        } else val.render = false;
      } else if (hotelCall) {
        //allow all Hotels items being currently filtered and other items that are visible
        if (val.isHotel && !val.isVenue) {
          if (filterList.indexOf(val.id) > -1) {
            val.render = true;
            utils.state.filtered.push(val.id);
          } else {
            val.render = false;
          }
        } else {
          if (val.render === true) utils.state.filtered.push(val.id);
        }
      } else {
        //allow all Venue items being currently filtered and other items that are visible
        if (((!val.isHotel && val.isVenue) || (val.isHotel && val.isVenue))) {
          if (filterList.indexOf(val.id) > -1) {
            val.render = true;
            utils.state.filtered.push(val.id);
          } else {
            val.render = false;
          }
        } else {
          if (val.render === true) utils.state.filtered.push(val.id);
        }
      }
    }
    //center the map
    venueMap.center();
  }
  /**
   * Renders the currently filtered map data.
   */
  function renderMapData() {
    if (!utils.state.mapInitilialized) window.setTimeout(() => { renderMapData(); }, 250);
    else if (utils.state.pins && utils.state.pins.size) {
      const it = utils.state.pins.values();
      let val;
      while ((val = it.next().value) && val) {
        if (val.render) {
          if (!val.renderState) val.renderPin();
        } else if (val.renderState) val.removePin();
      } //remove
    }
  }
  /**
   * Handles the marker events for the MapPins.
   * @param {Object<MapPin>} marker: Pin that triggered the event.
   * @param {string} ev: Event name.
   */
  function handleMarkerEvents(marker, ev) {
    if (utils.state.ignorenNextPopupEvent && utils.state.currentPopup && marker.id !== utils.state.currentPopup.id) {
      utils.state.ignorenNextPopupEvent = false;
      return;
    }
    if (ev === 'showInfo') {
      if (utils.state.currentPopup && utils.state.currentPopup.id !== marker.id) {
        utils.state.ignorenNextPopupEvent = true;
        utils.state.currentPopup.hideInfo();
      }
      utils.state.currentPopup = marker;
    } else if (ev === 'hideInfo') utils.state.currentPopup = null;
  }
  /**
   * Subscribes the map to the filter to automatically update the rendering, once the filter receives data.
   */
  function subscribeToFilters() {
    venueMap.venueSubId = venueMap.VenueFilters.subscribe(VenueFilterSub.types().VENUES, function (data) {
      //create new pins and stuff.
      processData(data);
      //filter for rendering
      filter(data, false, GTC.Shortlist.isInit());
      //check if we are visible
      if (!venueMap.isHidden()) renderMapData();
    }, venueMap);
    venueMap.hotelSubId = venueMap.VenueFilters.subscribe(VenueFilterSub.types().HOTELS, function (data) {
      //create new pins and stuff.
      processData(data);
      //filter for rendering
      filter(data, true);
      //check if we are visible
      if (!venueMap.isHidden()) renderMapData();
    }, venueMap);

    //subscribe to the events
    venueMap.reqStartedSubId = venueMap.VenueFilters.subscribe(VenueFilterSub.types().REQSTARTED, function () {
      venueMap.showLoading();
    }, venueMap);
    venueMap.reqCanceledSubId = venueMap.VenueFilters.subscribe(VenueFilterSub.types().REQCANCELED, function () {
      venueMap.hideLoading();
    }, venueMap);
    venueMap.reqEndedSubId = venueMap.VenueFilters.subscribe(VenueFilterSub.types().REQENDED, function () {
      if (utils.state.pins) {
        utils.state.pins.forEach((pin, i) => {
          pin.removePin();
        });
      }
      utils.state.pins = new Map();
      venueMap.hideLoading();
    }, venueMap);
  }
  /**
   * Converts position data (lat, lng) to pixel.
   * @param {object} position: Positional object containing two numeric props for lat and lng.
   * @returns{Object<google.maps.Point>}: The point value the latLng values represent on the mpa.
   */
  function fromlatLngToPixel(position) {
    const scale = Math.pow(2, utils.state.map.getZoom()), projection = utils.state.map.getProjection(),
      bounds = utils.state.map.getBounds(),
      nw = projection.fromLatLngToPoint(new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng())),
      point = projection.fromLatLngToPoint(position);
    return new google.maps.Point(Math.floor((point.x - nw.x) * scale), Math.floor((point.y - nw.y) * scale));
  }
  /**
   * Converts a pixel value to a lat/lng value.
   * @param {number} pixel: Number of pixel to convert.
   * @returns {object}: Positional object containing two numeric props for lat and lng.
   */
  function fromPixelToLatLng(pixel) {
    const scale = Math.pow(2, utils.state.map.getZoom()), projection = utils.state.map.getProjection(),
      bounds = utils.state.map.getBounds(),
      nw = projection.fromLatLngToPoint(new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng())),
      point = new google.maps.Point();
    point.x = (pixel.x / scale) + nw.x;
    point.y = (pixel.y / scale) + nw.y;
    return projection.fromPointToLatLng(point);
  }
  /**
   * Initializes label items form data, since we have no clientside store.
   */
  function initPopupLabels() {
    utils.popupLabels.meetingRooms.title = utils.elements.mapEl.data('meeting-rooms');
    utils.popupLabels.largestRoomsq.title = utils.popupLabels.largestRoomsmq.title = utils.elements.mapEl.data('largest-room');
    utils.popupLabels.largestRoomsq.unit = GTC.VenueFilters.labelForUnit(VenueFinderListUnit.types().SQFEET);
    utils.popupLabels.largestRoomsmq.unit = GTC.VenueFilters.labelForUnit(VenueFinderListUnit.types().SQMETER);
    utils.popupLabels.theatherCapacity.title = utils.elements.mapEl.data('theater-cap');
    utils.popupLabels.numberOfRooms.title = utils.elements.mapEl.data('room-count');
    utils.popupLabels.addToShortList.title = utils.elements.mapEl.data('add-to-sh');
  }
  //#endregion
  //#region Publics
  /**
   * Public Singleton Class MapVenue.
   * @extends App
   * @class MapVenue
   */
  class MapVenue extends App {
    constructor() {
      super();
      const that = this;
      that.CSS_NSP = that.Utils.CssNsp;
      that.JS_NSP = that.Utils.JsNsp;
      that.BEM = `${that.CSS_NSP}map`;
      that.venueSubId = null;
      that.hotelSubId = null;
      that.reqStartedSubId = null;
      that.reqCanceledSubId = null;
      that.reqEndedSubId = null;
      //launch prop
      that.launch = that.run();
    }
    run() {
      const that = this;
      that.Utils.Debug(false, 'MapVenue: run');
      //only ever execute any stuff when we got a map element
      if (!$(`.${CSSCLS.MAPEL}`).length) return;
      //wait until we are ready
      $(window).on(`${that.Utils.NS}::MapVenue::ready`, () => {
        that.init();
      });
    }
    init() {
      const that = this;
      that.Utils.Debug(false, 'MapVenue: init');
      initElements();
      initPopupLabels();
      //set initial map min height for md.
      const nMinH = parseFloat(utils.elements.mapEl.css('min-height'));
      utils.mapSizes.minHeightByViewPort.md = !isNaN(nMinH) && nMinH > 0 ? parseFloat(utils.elements.mapEl.css('min-height')) : utils.mapSizes.minHeightByViewPort.md;
      utils.elements.mapEl.css('min-height', '');
      that.setupEvents();
    }
    /**
     * Sets up the required event handlers.
     */
    setupEvents() {
    }
    /**
     * Resizes the map to the specified size (PDF Export).
     * @param {int} w With in pixel.
     * @param {int} h Height in pixel.
     */
    resizeTo(w, h) {
      const that = this;
      if (that.initialized()) resizeMap(true, w, h);
    }
    /**
     * Initializes the maps present in the given context or the default content .gtc-main.
     * @param {$.object} context: (Optional) The context in which too look for map elements to be initialized (default: this.CONTEXT).
     */
    initMap(context) {
      this.Utils.Debug(false, `Map: Initialize the venue map ${context}.`);
      //In case the mapElement is not present at initialization time, initialize the map once the ready event fired
      if (!utils.elements.mapEl) {
        utils.state.initMapWithElement = true;
        utils.state.initMapContext = context;
      } else {
        try {
          if (!google) google = window.google || {};
          utils.state.map = new google.maps.Map(utils.elements.mapEl[0], {
            zoom: utils.state.mapBaseZoom,
            center: utils.locations.geneve,
            mapTypeControl: true,
            mapTypeControlOptions: {
              //style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              //position: google.maps.ControlPosition.LEFT_TOP,
              mapTypeIds: ['roadmap', 'satellite']
            },
            scaleControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP
            }
          });
          utils.state.mapInitilialized = true;
          //remove the loading spinner
          venueMap.hideLoading();
          subscribeToFilters();
        } catch (e) {
          venueMap.Utils.Debug(false, 'Could not render map!');
        }
      }
    }
    /**
     * Attemps to toggle the hotels for the map view.
     * @param {bool} enable: Whether or not the hotels should be visible.
     */
    toggleHotels(enable) {
      if (enable) utils.state.allowHotels = true;
      else utils.state.allowHotels = false;
      //rerender if appropriate
      //filter for rendering
      if (utils.state.pins && utils.state.pins.size) filter(Array.from(utils.state.pins), true);
    }
    /**
     * Should be called when the data is supposed to be rendered.
     * @param {bool} force: Whether or not a rendering should be forced (map data would be rendered, even though the map is not visible.)
     */
    renderData(force) {
      if (force || !this.isHidden()) renderMapData();
    }
    /**
     * Adds the pin to the pins available to the map.
     * @param {object} data: Data Object containing information for the hotel or conference center.
     */
    addPin(data) {
      if (!data || !data.id) return;
      if (!utils.state.pins) utils.state.pins = new Map();

      let displayAsHotel = GTC.HotelVenueStore.matchesVenueIsHotel(data);
      const displayAsVenue = GTC.HotelVenueStore.matchesVenue(data);

      if (utils.state.pins.has(data.id)) {
        utils.state.pins.get(data.id).removePin();
      }

      utils.state.pins.set(data.id, new MapPin(false, data.id, displayAsHotel, displayAsVenue, utils.state.map, data, handleMarkerEvents, utils.elements.mapEl.data('checkbox-icon-id'), utils.elements.mapEl.data('star-icon-id')));
    }
    /**
     * Gets the pixel position for the marker with the given id.
     * @param {string} id The item id of the map data element (marker).
     */
    getPixelPositionForMarkerWith(id) {
      if (utils.state.pins && utils.state.pins.has(id)) {
        const marker = utils.state.pins.get(id);
        return fromlatLngToPixel(marker.pin.position);
      }
      return null;
    }
    /**
     * Attempts to center the map on the given set of rendered items while maintaining the zoom level.
     * @param {bool} restoreDefaultZoom: Whether or not the initial map zoom level is supposed to be restored.
     */
    center(restoreDefaultZoom) {
      //center the currently displayed element if we have some such
      if (utils.state.currentPopup) {
        GTC.MapVenue.offsetCenter(utils.state.currentPopup.position.lat, utils.state.currentPopup.position.lng, 0, (utils.state.currentPopup.infoWidget.getHeight() * MapPin.getCenterOfffsetFactor()) * -1);
        return;
      }
      //create empty LatLngBounds object
      const bounds = new google.maps.LatLngBounds();
      //add the filtered locations
      for (let i = 0, iLen = utils.state.filtered.length; i < iLen; ++i) {
        const marker = utils.state.pins.get(utils.state.filtered[i]);
        //extend the bounds to include each marker's position
        bounds.extend(marker.position);
      }
      //fit the view
      if (!utils.state.filtered.length) utils.state.map.panTo(new google.maps.LatLng(utils.locations.geneve.lat, utils.locations.geneve.lng));
      else utils.state.map.fitBounds(bounds);
      //default zoom
      if (restoreDefaultZoom || !utils.state.filtered.length) {
        const listener = google.maps.event.addListener(utils.state.map, 'idle', function () {
          utils.state.map.setZoom(utils.mapBaseZoom);
          google.maps.event.removeListener(listener);
        });
      }
    }
    /**
     * Sets the center of the map with a certain offset in px.
     * @param {float} lat: The latitude position to offset from.
     * @param {float} lng: The longitude position to offset from.
     * @param {int} x: The offset on the x-axis in px.
     * @param {int} y: The offset on the y-axis in px.
     */
    offsetCenter(lat, lng, x, y) {
      const overlay = new google.maps.OverlayView();
      overlay.onAdd = function () {
        const point = fromlatLngToPixel(new google.maps.LatLng(lat, lng));
        point.x += !isNaN(parseInt(x)) ? parseInt(x) : 0;
        point.y += !isNaN(parseInt(y)) ? parseInt(y) : 0;
        utils.state.map.panTo(fromPixelToLatLng(point));
      };
      overlay.draw = () => { };
      overlay.setMap(utils.state.map);
    }
    /**
     * @returns {object}: The Location of geneve as object with {lat, lng}.
     */
    geneveLocation() { return utils.locations.geneve; }
    /**
     * @returns {bool}: Whether the element is hidden or uninitilized.
     */
    isHidden() { return !utils.elements.mapRow || utils.elements.mapRow.hasClass(CSSCLS.MAPROWHIDDEN); }
    /**
     * Displays the element, only applyable if initilized.
     */
    show() {
      if (utils.elements.mapRow) utils.elements.mapRow.removeClass(CSSCLS.MAPROWHIDDEN);
      resizeMap();
    }
    /**
     * Hides the element, only applyable if initilized.
     */
    hide() { if (utils.elements.mapRow) utils.elements.mapRow.addClass(CSSCLS.MAPROWHIDDEN); }
    /**
     * Returns the collected map popup labels.
     * @returns {object}: Object containing the popup label config structure for the map popup with the labels.
     */
    popupLabels() {
      return utils.popupLabels;
    }
    /**
     * Checks whether or not the map is initilized.
     * @returns {bool} Whether or not the map is initilized.
     */
    initialized() { return utils.state.mapInitilialized; }
    /**
     * Shows the loading overlay on the map, if the map is visible.
     */
    showLoading() {
      //if we are visible and initialized
      if (utils.state.mapInitilialized && !this.isHidden()) utils.elements.loading.show();
    }
    /**
     * Hides the map loading overlay.
     */
    hideLoading() {
      if (utils.state.mapInitilialized) utils.elements.loading.hide();
    }
  }
  //create and return ad new vanueMap instance, but keep the local reference
  venueMap = new MapVenue();
  //#endregion
  return venueMap;
}());
