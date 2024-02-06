(function (window) {
  'use strict';

  let google, Popup;
  const createPopupClass = window.createPopupClass || {},
    utils = {
      pinVenue: 'pin1.png',
      pinHotel: 'pin2.png',
      pinVenueHotel: 'pin4.png',
      pinVenueExport: 'pin1-pdf.png',
      pinHotelExport: 'pin2-pdf.png',
      pinActive: 'pin3.png',
      centerOffsetFactorY: 0.5,
      state: {
        pinVenue: null,
        pinHotel: null,
        pinVenueHotel: null,
        pinActive: null
      }
    };
  /**
   * @class MapPin
   * @classdesc: Map pin functionality for Google maps with some additional props and functions is available via this class.
   */
  class MapPin {
    /**
     * Creates a new instace of the MapPin.
     * @param {bool} render Whether or not to render the element.
     * @param {int/string} id unque id of the location.
     * @param {bool} isHotel Whether or not the pin is a hotel.
     * @param {bool} isVenue Whether or not the pin is a Venue.
     * @param {$.object} map Map reference for the pin.
     * @param {object} data Pin data.
     * @param {function} eventCb Callback funtion which will be called when the pin is either hidden or shown, since we lack clear js props.Called async with (pin: MapPin, eventName: string).
     * @param {string} checkBoxIconId Id of the checkbox icon to be utilized by the map popup.
     * @param {string} starIconId Id of the star icon to be utilized by the map popup.
     */
    constructor(render, id, isHotel, isVenue, map, data, eventCb, checkBoxIconId, starIconId) {
      const that = this;
      that.render = render;
      that.id = id;
      that.data = data;
      that.map = map;
      that.isHotel = isHotel;
      that.isVenue = isVenue;
      that.renderState = false;
      that.eventCb = eventCb;
      //info window and stuff
      that.info = null;
      that.position = null;
      that.infoWidget = null;
      that.infoBound = false;
      that.checkboxIconId = checkBoxIconId;
      that.starIconId = starIconId;
      that.initOptions();
      that.create();
      that.bindEvents();
    }
    initOptions() {
      const that = this;
      //set the pin references
      if (GTC.Shortlist.isInExportMode()) {
        utils.state.pinHotel = utils.pinHotelExport;
        utils.state.pinVenue = utils.pinVenueExport;
        utils.state.pinVenueHotel = utils.pinVenueExport;
      } else {
        utils.state.pinHotel = utils.pinHotel;
        utils.state.pinVenue = utils.pinVenue;
        utils.state.pinVenueHotel = utils.pinVenueHotel;
      }

      let pinIcon = null;
      if (that.isHotel && !that.isVenue) {
        pinIcon = utils.state.pinHotel;
      } else if (that.isHotel && that.isVenue) {
        pinIcon = utils.state.pinVenueHotel;
      } else {
        pinIcon = utils.state.pinVenue;
      }

      that.icon = GTC.Utils.urls.images() + (pinIcon);
      that.position = {
        lng: parseFloat(that.data.longitude),
        lat: parseFloat(that.data.latitude)
      };
    }
    /**
     * Creates the actual map pin, based on the data.
     */
    create() {
      const that = this;
      if (!google) google = window.google;
      if (!Popup) Popup = createPopupClass();
      that.pin = new google.maps.Marker({
        position: that.position,
        title: that.data.name,
        icon: that.icon
      });
    }
    /**
     * Renders this pin to the map.
     */
    renderPin() {
      this.pin.setMap(this.map);
      this.renderState = true;
    }
    /**
     * Removes this pin from the map.
     */
    removePin() {
      this.pin.setMap(null);
      this.renderState = false;
    }
    /**
     * Updates the pin icon.
     * @param {bool} noInit: Whether or not the initialization should not be executed.
     */
    updatePinIcon(noInit) {
      const that = this;
      if (!noInit) that.initOptions();
      if (that.pin) that.pin.setIcon(that.icon);
    }
    /**
     * Generates the info window html and content and binds the events.
     */
    generateInfo() {
      const that = this;
      that.infoWidget = $('<div></div>').gtcMapPopup({ data: that.data, checkMarkIconId: that.checkboxIconId, starIconSvgId: that.starIconId, parent: that }).data('gtcGtcMapPopup');
      that.info = new Popup(new google.maps.LatLng(parseFloat(that.data.latitude), parseFloat(that.data.longitude)), that.infoWidget.element[0], that.pin);
    }
    /**
     * Called on mousedown and mouseup, so we can detect whether or not a following click event should be seen as "click" on point.
     * @param {$.event} e: jQuery event object.
     */
    mouseDown(e) {
      const that = this;
      if (e.type === 'mousedown' || e.type === 'touchstart') that.lastMouseDown = new Date().getTime();
    }
    /**
     * @returns {bool}: Detects whether or not the last click event rather was a drag or other event not inteded as click.
     */
    clickwasDrag() {
      const that = this;
      return new Date().getTime() - that.lastMouseDown > 125;
    }
    /**
     * Binds the google maps pin events.
     */
    bindEvents() {
      const that = this;
      that.pin.addListener('click', () => {
        //trigger event, so we can hide other elements while rendering this. The whole thing should only be called when the popup is hidden.
        if ($.isFunction(that.eventCb) && (!that.infoWidget || !that.infoWidget.isDisplayed())) window.setTimeout(() => {
          that.eventCb(that, 'showInfo');
          that.oldPin = that.icon;
          that.icon = GTC.Utils.urls.images() + utils.pinActive;
          that.updatePinIcon(true);
          return true;
        }, 0);
        if (!that.info && !that.infoBound) that.generateInfo();
        else that.infoWidget.update({ data: that.data, checkMarkIconId: that.checkboxIconId, starIconSvgId: that.starIconId, parent: that });
        that.info.setMap(that.map);
        $('body').on('click.' + that.id, () => {
          if (!that.clickwasDrag() && that.lastMouseDown !== undefined) {
            //set a  variable on the given element to make sure it wont' be displayed again
            that.hideInfo();
          }
        });
        //add a hide handler on click of an element of the map
        $('body').on('mousedown.' + that.id + ' touchstart.' + that.id, (e) => {
          that.mouseDown(e);
          if (GTC.Utils.isTouchEnabled()) $('body').one('touchend.' + that.id, () => { $('body').trigger('click.' + that.id); });
        });
        that.infoWidget.popupDisplayed();
        //tell the map we currently display information
        GTC.MapVenue.offsetCenter(that.position.lat, that.position.lng, 0, (that.infoWidget.getHeight() * utils.centerOffsetFactorY) * -1);
        //stop event, so we got what we need
        return false;
      });
    }
    /**
     * Hides Pin info box explicitly, if it's being displayed.
     */
    hideInfo() {
      const that = this;
      //trigger event, so we can hide other elements while rendering this.
      if ($.isFunction(that.eventCb)) that.eventCb(that, 'hideInfo');
      $('body').off('mousedown.' + that.id + ' click.' + that.id + ' touchstart.' + that.id + ' touchend.' + that.id);
      if (that.infoWidget) that.infoWidget.popupHidden();
      that.icon = that.oldPin;
      that.updatePinIcon(true);
      if (that.info) that.info.setMap(null);
    }
    /**
     * The center offset factor the custom pin popups.
     * @returns {float} The value as float.
     */
    static getCenterOfffsetFactor() {
      return utils.centerOffsetFactorY;
    }
  }
  //make global, since cannot import export
  window.MapPin = MapPin;
})(window);
