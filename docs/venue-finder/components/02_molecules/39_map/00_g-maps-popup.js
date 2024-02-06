/* eslint-disable no-underscore-dangle, no-unused-vars*/
(function (window) {
  'use strict';

  /**
   * Specifies globally used css classes.
   */
  const CSSCLS = {
    MAPPOPUP: 'gtc-map__pop',
    ANCHOR: 'gtc-map__pop-anc',
    CONTAINER: 'gtc-map__pop-cnt'
  };
  /**
   * Returns the map popup class.
   * refer to: https://developers.google.com/maps/documentation/javascript/examples/overlay-popup
   *
   * Unfortunately, the Popup class can only be defined after
   * google.maps.OverlayView is defined, when the Maps API is loaded.
   * This function should be called by initMap.
   */
  function createPopupClass() {
    const google = window.google || {};
    /**
     * A customized popup on the map.
     * @param {!google.maps.LatLng} position
     * @param {!Element} content The bubble div.
     * @param {Object<google.maps.Marker>} pin: The pin the bubble is for.
     * @extends {google.maps.OverlayView}
     */
    function Popup(position, content, pin) {
      if (!(content instanceof jQuery)) content = $(content);
      this.position = position;
      content.addClass(CSSCLS.MAPPOPUP);
      // This zero-height div is positioned at the bottom of the bubble.
      var bubbleAnchor = $(`<div class="${CSSCLS.ANCHOR}"></div>`);
      bubbleAnchor.append(content);
      // This zero-height div is positioned at the bottom of the tip.
      this.containerDiv = $(`<div class='${CSSCLS.CONTAINER}'></div>`);
      this.containerDiv.append(bubbleAnchor);
      //Pin anchor point, also defining the height in pixel of the pin
      this.pinAnchorY = pin.anchorPoint.y;
      // Optionally stop clicks, etc., from bubbling up to the map.
      google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv[0]);
    }
    // ES5 magic to extend google.maps.OverlayView.
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);
    /**
     * Called when the popup is added to the map.
     */
    Popup.prototype.onAdd = function () {
      this.getPanes().floatPane.appendChild(this.containerDiv[0]);
    };
    /**
     * Called when the popup is removed from the map.
     */
    Popup.prototype.onRemove = function () {
      if (this.containerDiv[0].parentElement) this.containerDiv[0].parentElement.removeChild(this.containerDiv[0]);
    };
    /**
     * Called each frame when the popup needs to draw itself.
     */
    Popup.prototype.draw = function () {
      const divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
      // Hide the popup when it is far out of view.
      const display = Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';

      if (display === 'block') {
        this.containerDiv[0].style.left = divPosition.x + 'px';
        this.containerDiv[0].style.top = (divPosition.y + this.pinAnchorY) + 'px';
      }
      if (this.containerDiv[0].style.display !== display) {
        this.containerDiv[0].style.display = display;
      }
    };
    return Popup;
  }
  //make global, since cannot import export
  window.createPopupClass = createPopupClass;
})(window);