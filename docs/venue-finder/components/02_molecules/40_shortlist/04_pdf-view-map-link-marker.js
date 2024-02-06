/* eslint-disable no-underscore-dangle, no-cond-assign, no-useless-escape, no-undef, function-paren-newline, no-unused-vars, no-multi-assign, arrow-body-style */
/**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.gtcPdfVenueLinkMarker
   * @desc: The map marker item for the pdf export view which will be rendered on top of the default marker.
   */
(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcPdfVenueLinkMarker',
    CSSCLS = {
      BASE: 'gtc-pdf-doc__map-marker',
      LINKTAG: 'gtc-pdf-doc__map-marker-link',
      BASEVENUE: 'gtc-pdf-doc__map-marker--venue',
      BASEHOTEL: 'gtc-pdf-doc__map-marker--hotel'
    };
  //#endregion
  //#region Widget
  /**
   * @class: gtcPdfVenueLinkMarker
   */
  $.widget(ns + name, {
    //#region props
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @description Widget options and state.
     */
    options: {
      data: {
        isVenue: true,
        number: 1,
        linkId: null,
        position: null,
        offsetSize: {
          x: 16,
          y: 55
        }
      }
    },
    link: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @function
     * @private
     * @returns {object} A new instance of the List view.
     * @description Creates the list view.
     */
    _create: function () {
      const that = this,
        opts = that.options;
      that._super();
      if (!that._initData(that, opts)) return null;
      that._initElements(that, opts);
      return that;
    },
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @returns {bool} Whether or not the element is capable of initializing.
     * @description Initializes the list view data.
     */
    _initData: (that, opts) => {
      if (!opts.data.position) return false;
      return true;
    },
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the list view elements.
     */
    _initElements: (that, opts) => {
      that.element.addClass(CSSCLS.BASE + ' ' + (opts.data.isVenue ? CSSCLS.BASEVENUE : CSSCLS.BASEHOTEL));
      that.link = $(`<a class="${CSSCLS.LINKTAG}" href="#${opts.data.linkId}">${opts.data.number}</a>`);
      that.element.append(that.link);
      that.setPosition();
    },
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      const that = this;
      that.element.html('').removeClass(CSSCLS.BASE);
      that.link = null;
    },
    //#endregion
    //#region publics
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @function
     * @description Sets the elements position according to it's data.
     */
    setPosition: function () {
      const that = this,
        opts = that.options;
      that.element.css({ top: opts.data.position.y - opts.data.offsetSize.y + 'px', left: opts.data.position.x - opts.data.offsetSize.x });
    },
    /**
     * @namespace gtc.gtcPdfVenueLinkMarker
     * @function
     * @description Destroys the widget.
     */
    destroy: function () {
      const that = this;
      that._destroy();
    }
    //#endregion
  });
  //#endregion
})(window, $);