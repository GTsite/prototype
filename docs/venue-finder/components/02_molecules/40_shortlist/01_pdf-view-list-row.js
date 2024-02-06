/* eslint-disable no-underscore-dangle, no-cond-assign, no-useless-escape, no-undef, function-paren-newline, no-unused-vars, no-multi-assign, arrow-body-style */
/**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.pdfVenuBase
   * @desc: The shortlist pdf export list venue base list item.
   */
(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcPdfVenuBase',
    CSSCLS = {
      BASE: 'gtc-pdf-doc__sec-cnt-lst-itm',
      WRAP: 'gtc-pdf-venue-item',
      HEADER: {
        BASE: 'gtc-pdf-venue-item__header',
        COUNT: 'gtc-pdf-venue-item__count',
        IMG: {
          BASE: 'gtc-pdf-venue-item__img',
          IMG: 'gtc-pdf-venue-item__img-el'
        },
        INFO: {
          BASE: 'gtc-pdf-venue-item__header-info',
          TXT: 'gtc-pdf-venue-item__header-info-txt',
          HEADLIINE: 'gtc-pdf-venue-item__header-info-txt--headline',
          BOLD: 'gtc-pdf-venue-item__header-info-txt--bold',
          LINK: 'gtc-pdf-venue-item__header-info-txt--link'
        }
      }
    };
  //#endregion
  //#region Widget
  /**
   * @class: gtcPdfVenuBase
   */
  $.widget(ns + name, {
    //#region props
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @description Widget options and state.
     */
    options: {
      data: {
        item: null,
        itemIndex: null,
        displayIndex: null
      },
      starIconSvgId: '',
      labels: {
        numberOfHotelRooms: '# of hotel rooms [FB]',
        numberOfMeetingRooms: '# of meeting rooms [FB]',
        largestRoom: 'Largest Room [FB]',
        unitSq: 'm² [FB]',
        tableCols: ['Surface Area [FB]', 'Theatre Style [FB]', 'Classroom Style [FB]', 'Banquet Style [FB]', 'Cocktail Style [FB]', 'BoardroomStyle [FB]', 'U-Style [FB]']
      },
      parent: null,
      state: {
        initialized: false
      }
    },
    wrap: null,
    header: null,
    content: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @returns {object} A new instance of the List view.
     * @description Creates the list view.
     */
    _create: function () {
      const that = this,
        opts = that.options;
      opts.state.initialized = false;
      that._super();
      that._initData(that, opts);
      that._initElements(that, opts);
      opts.state.initialized = true;
      return that;
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the list view data.
     */
    _initData: (that, opts) => {
      if (!opts.data.item) {
        opts.data.item = null;
        opts.data.itemIndex = -1;
        opts.data.displayIndex = -1;
      }
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the list view options.
     */
    _initOptions: (that, opts) => { },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the list view elements.
     */
    _initElements: (that, opts) => {
      that.element.addClass(CSSCLS.BASE);
      that.wrap = $(`<div class="${CSSCLS.WRAP}"></div>`);
      that._renderHeader(that, opts);
      that.element.append(that.wrap);
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @returns {$.object} jquery object containing the info link element.
     * @description Creates the header info link element.
     */
    _createHeaderInfoLink: (that, opts) => {
      return $(`<a class="${CSSCLS.HEADER.INFO.TXT} ${CSSCLS.HEADER.INFO.LINK}" href="${opts.data.item.Url}" target="_blank">${opts.data.item.Url}</a>`);
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
      return $(`<span class="${CSSCLS.HEADER.INFO.TXT}">${opts.labels.numberOfMeetingRooms}: ${opts.data.item.NumberOfMeetingRooms}</span><span class="${CSSCLS.HEADER.INFO.TXT}">${opts.labels.largestRoom}: ${opts.data.item.LargestSurface} ${GTC.Utils.htmlDecode(opts.labels.unitSq)}</span>`);
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
      return $(`<span class="${CSSCLS.HEADER.INFO.TXT} ${CSSCLS.HEADER.INFO.BOLD}">${opts.data.item.ItemType}</span>`);
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @returns {$.object} jquery object containing the info element.
     * @description Creates the Header info element.
     */
    _createHeaderInfo: (that, opts) => {
      const info = $(`<div class="${CSSCLS.HEADER.INFO.BASE}"><h3 id="${opts.data.item.ItemId}" class="${CSSCLS.HEADER.INFO.TXT} ${CSSCLS.HEADER.INFO.HEADLIINE}">${opts.data.item.Title}</h3></div>`);
      info.append(that._createHeaderInfoType(that, opts), that._createHeaderInfoRooms(that, opts), that._createHeaderInfoLink(that, opts));
      return info;
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the Header elements.
     */
    _renderHeader: (that, opts) => {
      that.header = $(`<header class="${CSSCLS.HEADER.BASE}"></header>`);
      const displayIndex = $(`<div class="${CSSCLS.HEADER.COUNT}">${opts.data.displayIndex}</div>`),
        img = $(`<div class="${CSSCLS.HEADER.IMG.BASE}"><img alt="${opts.data.item.HeroImage.Caption}" src="${opts.data.item.HeroImage.ImageUrl}" class="${CSSCLS.HEADER.IMG.IMG}" /></div>`),
        info = that._createHeaderInfo(that, opts);
      that.header.append(displayIndex, img, info);
      that.wrap.append(that.header);
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      const that = this;
      that.element.html('').removeClass(CSSCLS.BASE);
      that.wrap = that.header = that.content = null;
    },
    //#endregion
    //#region publics
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @description Destroys the widget.
     */
    destroy: function () {
      const that = this;
      that.options.state.initialized = false;
      that._destroy();
    }
    //#endregion
  });
  //#endregion
})(window, $);