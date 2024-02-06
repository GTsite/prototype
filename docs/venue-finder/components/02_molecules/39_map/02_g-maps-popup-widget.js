/* eslint-disable no-underscore-dangle, no-useless-escape, no-shadow, arrow-body-style, no-undef */
(function (window, $) {
  'use strict';

  /**
   * @class PopImg
   * @classdesc: Helper class for storing information for the images on the page.
   */
  class PopImg {
    /**
     * Creates a new instance of the PopImg class.
     * @param {Array<string>} url: A string or array of string with three urls [0] small, [1] medium [2] big.
     * @param {string} title: Title of the image to be added to the alt attribute and used as popup info.
     * @param {int} id: uqniue id of the image.
     */
    constructor(url, title, id) {
      this.p_urls = [null, null, null];
      this.urls = url;
      this.title = title;
      this.id = id;
    }
    /***
     * Sets the urls for the image.
     * @param {Array<string>(3)}: Array of urls with three elements [0] small, [1] medium [2] big or null.
     */
    set urls(val) {
      if (val && val.length) {
        for (let i = 2; i > -1; --i) {
          if (val[i] && val[i].length) this.p_urls[i] = val[i];
        }
      } else this.p_urls = [];
    }
    /**
     * Gets the urls for the image.
     * @returns {Array<string>}: The urls for the image.
     */
    get urls() {
      return this.p_urls;
    }
  }

  //#region global
  const ns = 'gtc.',
    name = 'gtcMapPopup',
    CSSCLS = {
      BASE: 'gtc-ven-map__popup',
      ARTICLE: {
        BASE: 'gtc-ven-map__popup-art',
        HEADER: {
          BASE: 'gtc-ven-map__popup-hdr',
          WRAP: 'gtc-ven-map__popup-hdr-wrap',
          LINK: 'gtc-ven-map__popup-hdr-link',
          TYPE: 'gtc-ven-map__popup-hdr-type',
          NAME: 'gtc-ven-map__popup-hdr-name',
          RATING: 'gtc-ven-map__popup-hdr-rting',
          RATINGSUB: 'gtc-ven-map__popup-hdr-rting-sub'
        },
        HEADERTXT: 'gtc-ven-map__popup-lnk gtc-link',
        CNT: {
          BASE: 'gtc-ven-map__popup-cnt',
          WRAP: 'gtc-ven-map__popup-cnt-wrap',
          TXTLINE: {
            BASE: 'gtc-ven-map__popup-cnt__lot',
            SQUAREFEET: 'gtc-ven-map__popup-cnt__lot--sqft',
            SQUAREMETER: 'gtc-ven-map__popup-cnt__lot--sqm',
            NAME: 'gtc-ven-map__popup-cnt__name',
            LINE: 'gtc-ven-map__popup-cnt__line',
            VALUE: 'gtc-ven-map__popup-cnt__val',
            UNIT: 'gtc-ven-map__popup-cnt__u'
          }
        }
      },
      SLIDER: {
        BASE: 'gtc-ven-map__popup-slider',
        LOADING: 'gtc-ven-map__popup-slider-loading',
        LOADINGVIS: 'gtc-ven-map__popup-slider-loading--visible',
        LOADINGBASE: 'js-gtc-loading__overlay',
        LOADINGSPIN: 'js-gtc-loading__spin',
        WRAP: 'gtc-wrap gtc-ven-map__popup-sld-wrap',
        BUTTON: 'gtc-btn gtc-btn--juna gtc-ven-map__popup-btn',
        SLIDE: 'gtc-ven-map__popup-slide',
        PIC: {
          BASE: 'gtc-ven-map__popup-pic gtc-picture',
          IMG: 'gtc-image gtc-ven-map__popup-img'
        }
      },
      CHECKBOX: {
        BASE: 'gtc-ven-map__popup-cnt-check',
        WRAP: 'gtc-ven-map__popup-cnt-check__wrap',
        BOX: {
          BASE: 'gtc-checkbox gtc-checkbox--nyla gtc-checkbox--venue',
          ACTIVE: 'gtc-checkbox--checked',
          CHECKINP: 'gtc-checkbox__inp',
          CHECKVIS: 'gtc-checkbox__vis',
          CHECKLBL: 'gtc-checkbox__lbl'
        }
      }
    };
  //#endregion
  /**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.mapPopup
   * @desc: A custom google maps popup for hotels and venues.
   */
  $.widget(ns + name, {
    //#region props
    /**
     * @namespace gtc.mapPopup
     * @description Widget options and state.
     */
    options: {
      starIconSvgId: null,
      data: null,
      //values taken from data
      title: null,
      link: null,
      desc: null,
      type: null,
      images: null,
      checkMarkIconId: null,
      //#region Optional Body values
      meetingRooms: {
        val: null,
        title: null
      },
      largestRoomsmq: {
        val: null,
        title: null,
        unit: null,
        unitId: null
      },
      largestRoomsq: {
        val: null,
        title: null,
        unit: null,
        unitId: null
      },
      theatherCapacity: {
        val: null,
        title: null
      },
      numberOfRooms: {
        val: null,
        title: null
      },
      addToShortList: {
        title: null,
        cb: null
      },
      //#endregion
      parent: null,
      slickLoadingTimeout: 150,
      slickOptions: {
        mobileFirst: true,
        autoplay: true,
        autoplaySpeed: 3000,
        infinite: true,
        lazyLoad: 'ondemand',
        arrows: true
      },
      state: {
        height: null,
        displayed: false
      }
    },
    article: null,
    sliderBtn: null,
    slider: null,
    loading: null,
    hdrLink: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @returns {object} A new instance of the MapPopup.
     * @description Inherited default create function.
     */
    _create: function () {
      const that = this, opts = that.options;
      if (!that._initData(that, opts)) return that;
      that._initOptions(that, opts);
      that._createElements(that, opts);
      that._setupEvents(that, opts);
      return that;
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the popup options.
     */
    _initData: (that, opts) => {
      if (!opts.data) return false;
      opts = $.extend(opts, GTC.MapVenue.popupLabels());
      opts.data = GTC.VenueFilters.getDataItemWith(opts.data.ItemId);
      //put the data together
      //title, links, images, lang based
      opts.title = opts.data.Title && opts.data.Title.length ? opts.data.Title : '';
      opts.type = opts.data.ItemType && opts.data.ItemType.length ? opts.data.ItemType : '';
      opts.link = opts.data.DetailUrl && opts.data.DetailUrl.length ? opts.data.DetailUrl : null;
      opts.meetingRooms.val = opts.data.NumberOfMeetingRooms;
      opts.largestRoomsmq.unitId = VenueFinderListUnit.types().SQMETER;
      opts.largestRoomsmq.val = opts.data.LargestSurface;
      opts.largestRoomsq.unitId = VenueFinderListUnit.types().SQFEET;
      opts.largestRoomsq.val = opts.data.LargestSurfacesq;
      opts.theatherCapacity.val = opts.data.TheaterCapacity;
      opts.numberOfRooms.val = opts.data.NumberOfHotelRooms;

      //init description
      opts.desc = opts.data.Description && opts.data.Description.length ? opts.data.Description : '';
      that._collectImages(that, opts);
      //state
      opts.state.displayed = false;
      //assign back, since we extended the object
      that.options = opts;
      return true;
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Collects the images from the hotel and conference rooms and stores them with the required data.
     */
    _collectImages: (that, opts) => {
      opts.images = new Map();
      //If multiple images are ever required ==> Add something similar to the base implementation within the proto.
      if (opts.data.HeroImage && opts.data.HeroImage.ImageUrl && opts.data.HeroImage.ImageUrl.length) {
        const id = opts.data.itemId + '_i0';
        const imageUrl = __IS_LOCAL__ ? 'https://www.geneve.com' + opts.data.HeroImage.ImageUrl : opts.data.HeroImage.ImageUrl;
        opts.images.set(id, new PopImg([imageUrl], opts.data.HeroImage.caption, id));
      }
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the popup options.
     */
    _initOptions: (/*that, opts*/) => { /*that._super(that, opts);*/ },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the popups html elements.
     */
    _createElements: (that, opts) => {
      that.element.addClass(CSSCLS.BASE);
      that.article = $(`<article class="${CSSCLS.ARTICLE.BASE}"></article>`);
      that._createSlider(that, opts);
      that._createHeader(that, opts);
      that._createContent(that, opts);
      that.element.append(that.article);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the slider elements.
     */
    _createSlider: (that, opts) => {
      const wrap = $(`<div class="${CSSCLS.SLIDER.WRAP}"></div>`);
      that.sliderBtn = $(`<button class="${CSSCLS.SLIDER.BUTTON}"></button>`);
      that.slider = $(`<div class="${CSSCLS.SLIDER.BASE}"></div>`);
      that.loading = $(`<div class="${CSSCLS.SLIDER.LOADING} ${CSSCLS.SLIDER.LOADINGBASE} ${CSSCLS.SLIDER.LOADINGVIS}"><div class="${CSSCLS.SLIDER.LOADINGSPIN}"></div></div>`);
      wrap.append([that.sliderBtn, that.slider, that.loading]);
      //create the slides
      that._createSlides(that, opts);
      //append all of it
      that.article.append(wrap);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the slides based on the existing data.
     */
    _createSlides: (that, opts) => {
      const slides = [], it = opts.images.values();
      let val;
      while ((val = it.next().value) && val) {
        if (!val.urls || !val.urls.length || !val.urls[0] || !val.urls[0].length) continue;
        const html = `<div class="${CSSCLS.SLIDER.SLIDE}"><picture class='${CSSCLS.SLIDER.PIC.BASE}'><img class="${CSSCLS.SLIDER.PIC.IMG}" alt="${val.title}" src="${val.urls[0]}" /></picture></div>`;
        slides.push($(html));
      }
      if (slides.length) that.slider.append(slides);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the content element and populates it.
     */
    _createContent: (that, opts) => {
      const cnt = $(`<div class="${CSSCLS.ARTICLE.CNT.BASE}"></div>`),
        cntWrap = $(`<div class="${CSSCLS.ARTICLE.CNT.WRAP}"></div>`);
      let baseString = '';

      if (opts.meetingRooms.val && GTC.Utils.numeric.isNumber(opts.meetingRooms.val)) baseString += that._createContentTextLine(opts.meetingRooms.title, opts.meetingRooms.val);
      if (opts.largestRoomsmq.val && GTC.Utils.numeric.isNumber(opts.largestRoomsmq.val)) baseString += that._createContentTextLine(opts.largestRoomsmq.title, opts.largestRoomsmq.val, opts.largestRoomsmq.unit, CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREMETER);
      if (opts.largestRoomsq.val && GTC.Utils.numeric.isNumber(opts.largestRoomsq.val)) baseString += that._createContentTextLine(opts.largestRoomsmq.title, opts.largestRoomsq.val, opts.largestRoomsq.unit, CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREFEET);
      if (opts.theatherCapacity.val && GTC.Utils.numeric.isNumber(opts.theatherCapacity.val)) baseString += that._createContentTextLine(opts.theatherCapacity.title, opts.theatherCapacity.val);
      if (opts.numberOfRooms.val && GTC.Utils.numeric.isNumber(opts.numberOfRooms.val)) baseString += that._createContentTextLine(opts.numberOfRooms.title, opts.numberOfRooms.val);

      cntWrap.append($(baseString), $(that._renderShortListToggle(that, opts)));
      cnt.append(cntWrap);
      that.article.append(cnt);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @returns {string} Html string for the short list toggle checkbox.
     * @description Renders the short list toggle item.
     */
    _renderShortListToggle: (that, opts) => {
      const svgIcon = $('#' + opts.checkMarkIconId), id = new Date().getTime().toString() + '_' + GTC.Utils.randomNumber(0, Number.MAX_SAFE_INTEGER || 9999999).toString();
      let html = svgIcon.html();
      if (html === undefined) {
        html = new XMLSerializer().serializeToString(svgIcon[0]);
        html = html.substring(html.indexOf('<title>') - 4, html.indexOf('</symbol>'));
      }
      return `<div class="${CSSCLS.CHECKBOX.BASE}"><div class="${CSSCLS.CHECKBOX.WRAP}"><div class="${CSSCLS.CHECKBOX.BOX.BASE} ${opts.data.IsShortListed === true ? ' ' + CSSCLS.CHECKBOX.BOX.ACTIVE : ''}"><input class="${CSSCLS.CHECKBOX.BOX.CHECKINP}" type="checkbox" ${opts.addToShortList.val === true ? 'checked="checked"' : ''} id='${id}' /><div class="${CSSCLS.CHECKBOX.BOX.CHECKVIS}"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${svgIcon.attr('viewBox')}">${html}</svg></div><label class="${CSSCLS.CHECKBOX.BOX.CHECKLBL}" for='${id}'>${opts.addToShortList.title}</label></div></div></div>`;
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {string} txt The left side value.
     * @param {string} val The right side value.
     * @param {string} unit (Optional) The unit value or null (default: null).
     * @param {string} cssClass (Optional) Custom css class to add (default: null)
     * @returns {string}: The html string for the given element.
     * @description Creates a Text line.
     */
    _createContentTextLine: (txt, val, unit, cssClass) => {
      return `<div class="${CSSCLS.ARTICLE.CNT.TXTLINE.BASE + (CSSCLS.ARTICLE.CNT.TXTLINE.BASE && CSSCLS.ARTICLE.CNT.TXTLINE.BASE.length ? ' ' + cssClass : '')}"><span class="${CSSCLS.ARTICLE.CNT.TXTLINE.NAME}">${txt}</span><span class="${CSSCLS.ARTICLE.CNT.TXTLINE.LINE}"></span><span class="${CSSCLS.ARTICLE.CNT.TXTLINE.VALUE}">${val}${unit && unit.length ? `<span class="${CSSCLS.ARTICLE.CNT.TXTLINE.UNIT}">${GTC.Utils.htmlDecode(unit)}</span>` : ''}</span></div>`;
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
      const svgIcon = $('#' + opts.starIconSvgId);
      let html = svgIcon.html();
      if (html === undefined) {
        html = new XMLSerializer().serializeToString(svgIcon[0]);
        html = html.substring(html.indexOf('<title>') - 4, html.indexOf('</symbol>'));
      }
      //append the stars
      if (opts.data.isHotel && opts.data.HotelRating > 0) {
        let stars = '';
        for (let i = 0, iLen = opts.data.HotelRating; i < iLen; ++i) stars += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${svgIcon.attr('viewBox')}">${html}</svg>`;
        return `<span class='${CSSCLS.ARTICLE.HEADER.RATING}'>${stars}${opts.data.IsSuperior ? '<span class="' + CSSCLS.ARTICLE.HEADER.RATINGSUB + '">' + GTC.VenueFilters.superiorityIndicator() + '</span>' : ''}</span>`;
      }
      return '';
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the header element and populates it.
     */
    _createHeader: (that, opts) => {
      const hdr = $(`<header class="${CSSCLS.ARTICLE.HEADER.BASE}"></header>`);
      that.hdrLink = $(`<a class="${CSSCLS.ARTICLE.HEADER.WRAP} ${CSSCLS.ARTICLE.HEADER.LINK}" title="${opts.desc}" target="_blank" href="${opts.link.substring(0, opts.link.lastIndexOf('?vview'))}"><span class="${CSSCLS.ARTICLE.HEADER.TYPE}">${opts.type}</span> ${that._createRatingHtml(that, opts)} <h4 class="${CSSCLS.ARTICLE.HEADER.NAME}">${opts.title}</h4></a>`);
      hdr.append(that.hdrLink);
      that.article.append(hdr);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the slick slider for the element.
     */
    _initSlick: (that, opts) => { that.slickRef = that.slider.slick(opts.slickOptions); },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @description Refreshes the popup rendering without updating the options.
     */
    _refresh: (that) => {
      //update checkbox rendering
      const checkbox = that.element.find(`.${CSSCLS.CHECKBOX.BOX.BASE.replace(/ /g, '.')}`);
      if (that.options.data.IsShortListed && !checkbox.hasClass(CSSCLS.CHECKBOX.BOX.ACTIVE)) checkbox.addClass(CSSCLS.CHECKBOX.BOX.ACTIVE);
      else if (!that.options.data.IsShortListed && checkbox.hasClass(CSSCLS.CHECKBOX.BOX.ACTIVE)) checkbox.removeClass(CSSCLS.CHECKBOX.BOX.ACTIVE);
      //update other stuff
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Refreshes the popup updating the options in the process.
     */
    _update: (that, opts) => {
      that._initData(that, opts);
      that._initOptions(that, opts);
      that._refresh(that);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @description Destroys the widget.
     */
    _destroy: (that) => {
      const opts = that.options;
      that._super();
      if (that.uiRef) that.uiRef.destroy();
      that.element.removeClass(CSSCLS.BASE);
      that.article = that.sliderBtn = that.slider = that.hdrLink = opts.data = opts.title = opts.link = opts.desc = opts.images = that.loading = null;
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Adds the neccessary event handlers for the widget,
     */
    _setupEvents: (that, opts) => {
      that._initSlick(that, opts);
      const elementClick =
        function (e) {
          if (e.target && (e.target.tagName.toLowerCase() === 'a' || $(e.target).parent()[0].tagName.toLowerCase() === 'a' || $(e.target).parents(`.${CSSCLS.CHECKBOX.BASE}`).length)) return true;
          //prevent closing the box when clicking the element.
          if ($.isFunction(e.stopPropagation)) e.stopPropagation();
          if ($.isFunction(e.stopImmediatePropagation)) e.stopImmediatePropagation();
          return false;
        }, checkBoxClick = function (e) {
          that._toggleItemShortListing(that, opts, $(e.currentTarget));
          return false;
        };
      that._on(that.element, {
        click: elementClick,
        touchstart: elementClick
      });
      //checkbox stuff
      that._on(that.element.find(`.${CSSCLS.CHECKBOX.BOX.BASE.replace(/ /g, '.')}`), {
        click: checkBoxClick,
        touchstart: checkBoxClick
      });
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {$.object} target Reference to the checkbox button.
     * @description Add currently selected Item to shortlist
     */
    _toggleItemShortListing: (that, opts, target) => {
      const newState = !opts.data.IsShortListed;
      //request
      GTC.Shortlist.toogleShortlistItem(opts.data.ItemId, newState, () => {
        opts.data.IsShortListed = newState;
        //check or uncheck checkbox button
        if (target.hasClass(CSSCLS.CHECKBOX.BOX.ACTIVE)) {
          target.removeClass(CSSCLS.CHECKBOX.BOX.ACTIVE);
          if (GTC.Shortlist.isInit()) {
            opts.parent.hideInfo();
            that.destroy();
          }
        } else target.addClass(CSSCLS.CHECKBOX.BOX.ACTIVE);
      });
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @description Shows the slider sloading element.
     */
    _showLoading: (that) => { if (that.loading) that.loading.addClass(CSSCLS.SLIDER.LOADINGVIS); },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @param {object} that Reference to self.
     * @description Hides the slider sloading element.
     */
    _hideLoading: (that) => { if (that.loading) that.loading.removeClass(CSSCLS.SLIDER.LOADINGVIS); },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @private
     * @description Sets and updates the unit class.
     */
    _setUnit: () => {
      const activeUnit = GTC.VenueFilters.currentUnitType();
      if (activeUnit === VenueFinderListUnit.types().SQMETER) {
        $(`.${CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREMETER.replace(/ /g, '.')}`).show();
        $(`.${CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREFEET.replace(/ /g, '.')}`).hide();
      } else if (activeUnit === VenueFinderListUnit.types().SQFEET) {
        $(`.${CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREMETER.replace(/ /g, '.')}`).hide();
        $(`.${CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREFEET.replace(/ /g, '.')}`).show();
      } else {
        $(`.${CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREMETER.replace(/ /g, '.')}`).hide();
        $(`.${CSSCLS.ARTICLE.CNT.TXTLINE.SQUAREFEET.replace(/ /g, '.')}`).hide();
      }
    },
    //#endregion
    //#region publics
    /**
     * @namespace gtc.mapPopup
     * @function
     * @param {object} opts Reference to self.options,
     * @description Refreshes the popup updating the options in the process.
     */
    update: function (opts) {
      const that = this, nOpts = $.extend(that.options, opts, true);
      that._update(that, nOpts);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @param {object} opts Reference to self.options,
     * @description Refreshes the popup without updating the options.
     */
    refresh: function () {
      const that = this;
      that._refresh(that, that.options);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @description Destroys the widget.
     */
    destroy: function () {
      const that = this;
      that.options.state.displayed = false;
      that._destroy(that, that.options);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @description To be called when the popup was hidden.
     */
    popupHidden: function () {
      const that = this;
      that._showLoading(that);
      that.options.state.displayed = false;
      if (that.slick) that.slick.slick('slickSetoption', { autoplay: false });
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @description To be called when the popup was displayed.
     */
    popupDisplayed: function () {
      const that = this;
      if (!that.element.is(':visible')) { //make sure we get no render issues
        if (that.slick) that.slick.slick('slickSetoption', { autoplay: true });
        window.setTimeout(() => {
          that.popupDisplayed();
          that._setUnit(that);
        }, that.options.slickLoadingTimeout);
        return;
      }
      that.options.state.displayed = true;
      if (that.slickRef) that.slickRef.slick('resize');
      window.setTimeout(() => { that._hideLoading(that); }, that.options.slickLoadingTimeout);
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @description Determines the height of the widget after it's being created but not yet displayed.
     */
    getHeight: function () {
      const that = this;
      if (that.options.state.height !== null) return that.options.state.height;
      else if (that.element.is(':visible')) return that.element.outerHeight(true);
      else {
        const parent = that.element.parent();
        that.element.appendTo($('body'));
        that.options.state.height = that.element.outerHeight(true);
        that.element.appendTo(parent);
        return that.options.state.height;
      }
    },
    /**
     * @namespace gtc.mapPopup
     * @function
     * @returns {bool} Whether or not the current element is being displayed.
     * @description Determines the height of the widget after it's being created but not yet displayed.
     */
    isDisplayed: function () { return this.options.state.displayed; }
    //#endregion
  });
})(window, $);