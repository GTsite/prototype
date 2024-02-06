/* eslint-disable no-underscore-dangle, no-cond-assign, no-useless-escape, no-undef, function-paren-newline, no-unused-vars, no-multi-assign, arrow-body-style */
/**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.pdfVenuHotel
   * @desc: The shortlist pdf export list venue hotel list item.
   */
(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcPdfVenuHotel',
    CSSCLS = {
      WRAP: 'gtc-pdf-venue-item--hotel',
      HEADER: {
        COUNT: 'gtc-pdf-venue-item__count',
        COUNTHOTEL: 'gtc-pdf-venue-item__count--hotel',

        INFO: {
          BASE: 'gtc-pdf-venue-item__header-info',
          TXT: 'gtc-pdf-venue-item__header-info-txt',
          HEADLIINE: 'gtc-pdf-venue-item__header-info-txt--headline',
          BOLD: 'gtc-pdf-venue-item__header-info-txt--bold',
          LINK: 'gtc-pdf-venue-item__header-info-txt--link',
          RATING: {
            BASE: 'gtc-ven-map__popup-hdr-rting',
            SUB: 'gtc-ven-map__popup-hdr-rting-sub'
          }
        }
      }
    };
  //#endregion
  //#region Widget
  /**
   * @class: gtcPdfVenuBase
   */
  $.widget(ns + name, $.gtc.gtcPdfVenuBase, {
    /**
     * @namespace gtc.gtcPdfVenueHotel
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the list view elements.
     */
    _initElements: (that, opts) => {
      that._super(that, opts);
      that.wrap.addClass(CSSCLS.WRAP);
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @returns {$.object} jquery object containing the info element.
     * @description Creates the header info rooms element.
     */
    _createHeaderInfoRooms: (that, opts) => {
      return $(`<span class="${CSSCLS.HEADER.INFO.TXT} ${CSSCLS.HEADER.INFO.BOLD}">${opts.labels.numberOfHotelRooms}: ${opts.data.item.NumberOfHotelRooms}</span>`);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @returns {string} Html string containing the rating values to be displayed.
     * @description Creates the rating element, if neccessary and returns it.
     */
    _createRatingHtml: (that, opts) => {
      if (!opts.starIconSvgId || !opts.starIconSvgId.length) return '';
      const svgIcon = $('#' + opts.starIconSvgId);
      let html = svgIcon.html();
      if (html === undefined) {
        html = new XMLSerializer().serializeToString(svgIcon[0]);
        html = html.substring(html.indexOf('<title>') - 4, html.indexOf('</symbol>'));
      }
      //append the stars
      if (opts.data.item.HotelRating > 0) {
        let stars = '';
        for (let i = 0, iLen = opts.data.item.HotelRating; i < iLen; ++i) stars += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${svgIcon.attr('viewBox')}">${html}</svg>`;
        return `<span class='${CSSCLS.HEADER.INFO.RATING.BASE}'>${stars}${opts.data.item.IsSuperior ? '<span class="' + CSSCLS.HEADER.INFO.RATING.SUB + '">' + GTC.VenueFilters.superiorityIndicator() + '</span>' : ''}</span>`;
      }
      return '';
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @returns {$.object} jquery object containing the info type element.
     * @description Creates the header info type element.
     */
    _createHeaderInfoType: (that, opts) => {
      return $(`<span class="${CSSCLS.HEADER.INFO.TXT} ${CSSCLS.HEADER.INFO.BOLD}">${opts.data.item.ItemType}${that._createRatingHtml(that, opts)}</span>`);
    },
    /**
     * @namespace gtc.gtcPdfVenuHotel
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the Header elements.
     */
    _renderHeader: (that, opts) => {
      that._super(that, opts);
      that.header.find(`.${CSSCLS.HEADER.COUNT}`).addClass(CSSCLS.HEADER.COUNTHOTEL);
    },
    /**
     * @namespace gtc.gtcPdfVenuHotel
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      const that = this;
      that.wrap.removeClass(CSSCLS.WRAP);
      that.header.find(`.${CSSCLS.HEADER.COUNT}`).removeClass(CSSCLS.HEADER.COUNTHOTEL);
      that._super();
    }
    //#endregion
  });
  //#endregion
})(window, $);