/* eslint-disable no-underscore-dangle, no-undef, eqeqeq */

//#region Shortlist
App.prototype.Shortlist = (function () {
  'use strict';

  //#region Props
  const utils = {
    elements: {
      exportBtn: {
        btn: null,
        spinner: null
      },
      form: null
    },
    state: {
      pdfHasHotels: true,
      pdfHasVenues: true,
      init: false,
      shortlistUrlParam: 'savedcookie',
      shortlistEditableCookie: 'edit',
      exportPdfCookieName: 'pdfExportCall',
      shortlistCookieName: 'ShortListCookie',
      contextItemId: null,
      pdfViewActive: false,
      dataSubId: null,
      dataRef: null
    }
  };
  const CSSCLS = {
    SHORTLISTBODY: 'gtc-shortlist',
    HIDDEN: 'gtc-shortlist-hidden hidden',
    SHORTLISTSECTION: 'gtc-section--shortlist',
    SHORTLISTLINK: 'gtc-section__heading-link',
    SHORTLISTPDFEXPORTEL: 'gtc-pdfExpBtn',
    SHORTLISTPDFEXPORTBTN: 'gtc-pdfExpBtn__btn',
    SHORTLISTPDFEXPORTBTNLOADING: 'gtc-pdfExpBtn__loading-wrap',
    PDFHIDDENCLASSLIST: 'gtc-header gtc-main gtc-footer pace gtc-grid-overlay__btn pdfvbtn gmnoprint gm-bundled-control gm-style-mtc gm-control-active gm-svpc gtc-cookie-consent o-header o-footer cookiefirst-root gtc-main',
    PDFBODY: 'gtc-pdf-body',
    PDFDOC: 'gtc-pdf-doc',
    PDFVENUELIST: 'gtc-pdf-doc__sec-cnt-lst',
    PDFMAPVIEW: 'gtc-pdf-doc__map',
    PDFSECTIONVENUES: 'gtc-pdf-doc__sec--venues',
    PDFSECTIONHOTELS: 'gtc-pdf-doc__sec--hotels',
    PDFCONTENT: 'gtc-pdf-doc__sec-cnt',
    MAPWRAP: 'gtc-wrap gtc-wrap--map',
    PDFMAPWRAP: 'gtc-pdf-doc__map',
    MAPELEMENT: 'gtc-ven-map__el',
    VENUECONTAINER: 'gtc-container--venue',
    PDFHEADERUPPER: 'gtc-pdf-doc__header-upper',
    SHORTLISTFORM: 'gtc-shortlist-form',
    FORMSUBMITBTN: 'gtc-form-submit',
    FORMHASERROR: 'has-error'
  };
  // ReSharper disable once JoinDeclarationAndInitializerJs
  let shortlist;
  //#endregion
  //#region Privates
  /**
   * Initializes the base element references.
   */
  function initElements() {
    utils.elements.form = $(`.${CSSCLS.SHORTLISTFORM}`);
    utils.elements.exportBtn.btn = $(`.${CSSCLS.SHORTLISTLINK}`).length ? $(`.${CSSCLS.SHORTLISTLINK}`).find(`.${CSSCLS.SHORTLISTPDFEXPORTBTN}`) : null;
    if (utils.elements.exportBtn.btn.length) utils.elements.exportBtn.spinner = utils.elements.exportBtn.btn.next();
    else {
      utils.elements.exportBtn.btn = null;
      utils.elements.exportBtn.spinner = null;
    }
  }
  //#region PDF Stuff
  /**
   * Builds the selector for the elements to hide in the pdf export view.
   * @returns {string} Selector string or emtpy string.
   */
  function buildPdfSelector() {
    let selector = '';
    const selList = CSSCLS.PDFHIDDENCLASSLIST.split(' ');
    if (selList && selList.length) for (let i = 0, iLen = selList.length; i < iLen; ++i) {
      selector += selector.length ? ', .' : '.';
      selector += selList[i];
    }
    return selector;
  }
  /**
   * Processes the existing venue data for the pdf exporter view.
   * @returns {object<venues, hotels>} An Object cosisting of a venues and a hotels array.
   */
  function processPdfData() {
    const dataRef = { venues: [], hotels: [], all: [], uniqueIds: new Map() };
    utils.state.pdfHasVenues = true;
    utils.state.pdfHasHotels = true;
    if (utils.state.dataRef && utils.state.dataRef.data.length) {
      for (let i = utils.state.dataRef.data.length - 1; i > -1; --i) {
        const currentItem = utils.state.dataRef.data[i];
        //the hotel type check does not apply here for a reason
        if (currentItem.isVenue) dataRef.venues.push(currentItem);
        if (currentItem.isHotel) dataRef.hotels.push(currentItem);
        dataRef.all.push(currentItem);
        dataRef.uniqueIds.set(currentItem.ItemId, {
          id: currentItem.ItemId,
          position: shortlist.MapVenue.getPixelPositionForMarkerWith(currentItem.ItemId), //pixel position of the marker
          index: dataRef.all.length - 1, //index in there referring array => After rendering we will find the item position there
          isVenue: currentItem.isVenue //we need to know this in order to know where (venues or hotels) to lookup the item position.
        });
      }
      //we need to sort the hotels
      if (dataRef.hotels && dataRef.hotels.length) {
        dataRef.hotels.sort((a, b) => {
          // first sort by star rating (descending)
          if (a.HotelRating > b.HotelRating) {
            return 1;
          }
          if (a.HotelRating < b.HotelRating) {
            return -1;
          }
          // then if the hotel has superior status
          if (a.IsSuperior === true && b.IsSuperior === false) {
            return 1;
          }
          if (a.IsSuperior === false && b.IsSuperior === true) {
            return -1;
          }
          // then by number of hotel rooms (descending)
          return a.NumberOfHotelRooms - b.NumberOfHotelRooms;
        });
      }
    }
    return dataRef;
  }
  /**
   * Subscribes shortlist to filter-data provider.
   * @param {object} shortlist Reference to the shortlist.
   */
  function subscribeToData(shortlist) {
    utils.state.dataSubId = shortlist.VenueFilters.subscribe(VenueFilterSub.types().VENUES, function (data) { utils.state.dataRef = data; }, shortlist, true);
  }
  /**
   * Toggles the map view.
   * @param {bool} show Whether or not the view should be displayed or hidden.
   * @param {bool} [autoResize = false] Whether or not to autoresize the map. Only applies when showing the map.
   */
  function toggleMap(show, autoResize = false) {
    if (show) {
      if (shortlist.MapVenue.isHidden()) {
        shortlist.MapVenue.show();
        shortlist.MapVenue.renderData(true);
        if (!autoResize) shortlist.MapVenue.resizeTo('1024px', '139mm');
        shortlist.MapVenue.center();
      }
    } else {
      if (!shortlist.MapVenue.isHidden()) shortlist.MapVenue.hide();
    }
  }
  /**
   * Generates and renders the PDF link markers for the map.
   * @param {object} pdfData Data Generated by the processPdfData function in.
   */
  function renderPdfLinkMarkers(pdfData) {
    if (!pdfData || !pdfData.uniqueIds || !pdfData.uniqueIds.size) return;
    const it = pdfData.uniqueIds.values(),
      appendEls = [];
    let val;
    while ((val = it.next().value) && val) {
      const div = $('<div></div>').gtcPdfVenueLinkMarker({
        data: {
          number: pdfData.all[val.index].displayIndex || NaN,
          isVenue: val.isVenue,
          position: val.position,
          linkId: val.id
        }
      });
      appendEls.push(div);
    }
    $(`.${CSSCLS.PDFMAPWRAP}`).find(`.${CSSCLS.MAPELEMENT}`).append(appendEls);
  }
  /**
   * Enables the PDF-Export view.
   */
  function activatePdfView() {
    try {
      $('body').addClass(CSSCLS.PDFBODY);
      //switch to map view in order to load the map properly
      window.setTimeout(() => { toggleMap(true); }, 0);
      window.setTimeout(() => {
        //move the view
        const pdfDoc = $(`.${CSSCLS.PDFDOC}`);
        $('body').append(pdfDoc);
        pdfDoc.removeClass(CSSCLS.HIDDEN);

        //copy the map view
        $(`.${CSSCLS.MAPWRAP.replace(' ', '.')}`).appendTo($(`.${CSSCLS.PDFMAPWRAP}`));
        shortlist.MapVenue.resizeTo('1024px', '139mm');
        //hide default html
        $(buildPdfSelector()).addClass(CSSCLS.HIDDEN).hide();
        window.setTimeout(() => {
          const pdfData = processPdfData();
          if (pdfData) {
            if (pdfData.venues && pdfData.venues.length) {
              const listWidget = $('<ul></ul>').gtcPdfExportView({
                data: {
                  list: pdfData.venues
                },
                typeVenues: true,
                typeHotels: false
              });
              listWidget.appendTo(pdfDoc.find(`.${CSSCLS.PDFSECTIONVENUES} .${CSSCLS.PDFCONTENT}`));
            } else {
              pdfDoc.find(`.${CSSCLS.PDFSECTIONVENUES}`).remove();
              utils.state.pdfHasVenues = false;
            }
            if (pdfData.hotels && pdfData.hotels.length) {
              const listWidget = $('<ul></ul>').gtcPdfExportView({
                data: {
                  list: pdfData.hotels,
                  displayIndexStartValue: pdfData.venues.length + 1,
                  compareItemsTo: pdfData.venues
                },
                typeVenues: false,
                typeHotels: true
              });
              listWidget.appendTo(pdfDoc.find(`.${CSSCLS.PDFSECTIONHOTELS} .${CSSCLS.PDFCONTENT}`));
            } else {
              pdfDoc.find(`.${CSSCLS.PDFSECTIONHOTELS}`).remove();
              utils.state.pdfHasHotels = false;
            }
            //render the map pin links ==> Round element containing links to the item id href="${ItemId}" //offset the rendering by x: 14
            renderPdfLinkMarkers(pdfData);
            $(buildPdfSelector()).addClass(CSSCLS.HIDDEN).hide();
          }
        }, 200);
      }, shortlist.Utils.BFS * 100);
    } catch (e) {
      if (shortlist.isInExportMode()) $('body').append(e.messsage);
      shortlist.Utils.Debug(true, e);
    }
  }
  /**
   * Disables the PDF-Export view.
   */
  function deactivatePdfView() {
    const pdfDoc = $(`.${CSSCLS.PDFDOC}`);
    pdfDoc.addClass(CSSCLS.HIDDEN);
    $('body').removeClass(CSSCLS.PDFBODY);
    //Clear pdf doc list
    $(`.${CSSCLS.PDFVENUELIST}`).each(() => { $(this).html(''); });
    $(`.${CSSCLS.PDFMAPVIEW}`).children().remove();
    $(`.${CSSCLS.SHORTLISTSECTION}`).append(pdfDoc);
    $(buildPdfSelector()).removeClass(CSSCLS.HIDDEN).show();
  }
  /**
   * Toggles the PDF Export loading icon.
   * @param {bool} on Whether or not the loading icon should be toggle on.
   */
  function toggleLoading(on) {
    if (utils.elements.exportBtn.spinner) {
      if (on) utils.elements.exportBtn.spinner.removeClass(CSSCLS.HIDDEN);
      else utils.elements.exportBtn.spinner.addClass(CSSCLS.HIDDEN);
    }
  }
  /**
   * Handles the pre pdf-epxort preliminarities.
   */
  function beforeExport() {
    if (utils.elements.exportBtn.btn) utils.elements.exportBtn.btn.attr('disabled', '');
    GTC.Utils.cookie.setCookie(utils.state.exportPdfCookieName, 'true');
    toggleLoading(true);
  }
  /**
   * Handles the post export work.
   */
  function afterExport() {
    if (utils.elements.exportBtn.btn) utils.elements.exportBtn.btn.removeAttr('disabled');
    GTC.Utils.cookie.setCookie(utils.state.exportPdfCookieName, 'false', 0);
    toggleLoading(false);
  }
  /**
   * Attempts to initiate the export view toggle, once the neccessary script and inits have been executed (google, Maps feature) and the export conditionas are met. Calls itself recursively, as long as they are not.
   */
  function initiateViewToggleOnExport() {
    if (shortlist.isInExportMode()) window.setTimeout(() => {
      subscribeToData(shortlist);
      if (shortlist.MapVenue.initialized()) shortlist.togglePDFView();
      else window.setTimeout(() => initiateViewToggleOnExport(), shortlist.Utils.BFS);
    }, shortlist.Utils.BFS * 7.5);
  }
  //#endregion
  /**
   * Displays the Forms PDF loading screen.
   */
  function showFormLoadingScreen() { shortlist.Utils.showLoading($(`.${CSSCLS.SHORTLISTFORM}`), true); }
  /**
   * Adds the event handlers related to the shortlist.
   * @param {object} shortlist Reference to the shortlist.
   */
  function addEventListeners(shortlist) {
    if (utils.elements.exportBtn.btn) utils.elements.exportBtn.btn.on('click', (e) => {
      $(e.currentTarget).blur();
      beforeExport();
      shortlist.exportShortlist();
    });
  }
  /**
   * Sets the cookie expiration date for the shortlist cookie, if on is set.
   */
  function setCookieExpiration() {
    const cookie = shortlist.Utils.cookie.getCookie(utils.state.shortlistCookieName);
    if (utils.state.init && cookie && cookie[0] && cookie[0].length) shortlist.Utils.cookie.setCookie(utils.state.shortlistCookieName, cookie[0], 365);
  }
  /**
   * Setst the given shortlist cookie values to a new or existing cookie.
   * @param {Array<string>} values
   */
  function setCookieValues(id, values) {
    let cookieValue = `ID=${id.toLowerCase()}&savedItems=`;
    for (let i = 0, iLen = values.length; i < iLen; ++i) cookieValue += values[i].ItemId.substring(1, values[i].ItemId.length - 1).toLowerCase() + (i < iLen - 1 ? '|' : '');
    shortlist.Utils.cookie.setCookie(utils.state.shortlistCookieName, cookieValue, 365);
  }
  //#endregion
  //#region Publics
  /**
   * Provides functionality for the shortlist page.
   */
  class Shortlist extends App {
    constructor() {
      super();
      const that = this;
      //launch prop
      that.launch = that.run();
    }
    /**
     * Attempts to export the shortlist to PDF with the required.
     */
    exportShortlist() {
      const that = this;
      const options = new that.PdfOptions(utils.state.contextItemId);
      options.viewWidth = 1024;
      options.pageNumberStartingIdx = 0;
      options.addCookiesToRq = [utils.state.shortlistCookieName, utils.state.exportPdfCookieName];
      options.pageBreakAvoidSelectors = [`.${CSSCLS.PDFHEADERUPPER}`, `.${CSSCLS.PDFMAPVIEW}`];
      options.pageBreakAfterSelectors = [`.${CSSCLS.PDFMAPVIEW}`, `.${CSSCLS.PDFSECTIONVENUES}`];
      options.footerHeight = 20;
      options.topSpacing = 4;
      options.bottomSpacing = 2;
      options.footer = '<div style="font-family:Arial;font-size:15px;color:#6a6a6a;text-align:center;line-height:18px;">-  &p;  -</div>';
      options.marginLeft = 40;
      options.marginRight = 40;
      options.marginTop = 25;
      options.marginBottom = 5;
      options.waitBeforeExport = 12;
      const shortlistCookie = that.Utils.cookie.getCookie(utils.state.shortlistCookieName);
      if (shortlistCookie && shortlistCookie[0]) {
        options.md5DataHash = md5(shortlistCookie[0]);
        options.cache = true;
      }
      that.PdfExporter.exportPdf(utils.state.contextItemId, options, () => {
        that.Utils.Debug(true, 'PDf export via exportShortlist failed.');
        afterExport();
      }, () => {
        that.Utils.Debug(true, 'PDf export via exportShortlist succeeded.');
        afterExport();
      });
    }
    /**
     * Checks whether or not the page is in export mode.
     * @returns {bool} whether or not the page is in export mode.
     */
    isInExportMode() {
      const pdfCookie = shortlist.Utils.cookie.getCookie(utils.state.exportPdfCookieName);
      return pdfCookie && pdfCookie.length && (pdfCookie[0] === true || pdfCookie[0] === 'true') ? true : false;
    }
    /**
     * Attempts to toggle the shortlisted state of the given item id.
     * @param {string} itemId Id of the item to be toggled.
     * @param {bool} newState Whether or the element should be shortlisted.
     * @param {function} [success = null] Success callback.
     * @param {function} [error  = null] Error callback.
     */
    toogleShortlistItem(itemId, newState, success, error) {
      const that = this;
      //run toggle in controller
      that.Utils.request.postJSON({
        url: GTC.Utils.urls.toggleShortListItem(),
        data: {
          toggledItemId: itemId,
          isShortListed: newState
        },
        onDone: function () {
          that.VenueFilters.updateShortlistItemCount();
          if (newState === false && that.isInit()) that.VenueFilters.removeShortlistItemWith(itemId);
          else that.VenueFilters.updateShortlistStateForItemWith(itemId, newState);
          if (success && $.isFunction(success)) success();
        },
        onError: function () {
          GTC.Utils.Debug(true, 'Toggling Shortlist item failed!', arguments);
          if (error && $.isFunction(error)) error();
        }
      });
    }
    /**
     * Loads the given shortlistcookie and populates the lokal cookie with the given values.
     */
    loadShortlistCookie() {
      const that = this,
        shortlistId = that.Utils.urls.getParameterbyName(utils.state.shortlistUrlParam),
        shortlistEditable = that.Utils.urls.getParameterbyName(utils.state.shortlistEditableCookie);

      if (shortlistId && shortlistId.value) that.Utils.request.postJSON({
        url: that.Utils.urls.getShortlist(),
        data: {
          shortlistId: decodeURIComponent(shortlistId.value),
          edit: shortlistEditable && (shortlistEditable.value === 'true' || shortlistEditable.value === true) ? true : false
        },
        onDone: function (data) {
          if (data) {
            if (data.redirectUrl && data.redirectUrl.length) window.location.href = data.redirectUrl;
            else if (data.Venues && data.Venues.length) setCookieValues(decodeURIComponent(shortlistId.value), data.Venues);
          }
        },
        onError: function () { GTC.Utils.Debug(true, 'Getting the shortlistitems failed', arguments); }
      });
    }
    /**
     * Checks if the given element is the shortlist form element.
     * @param {$.object} form Form to check.
     */
    isShortlist(form) {
      if (form && form[0].nodeName.toLowerCase() === 'form') return form.hasClass(CSSCLS.SHORTLISTFORM);
      return false;
    }
    /**
     * Triggers the form submit for the shortlist form and takes care of a loading screen and other neccessities.
     * @param {$.element} form Form to submit.
     * @param {$.element} button Triggering button.
     */
    triggerSubmit(form, button) {
      const that = this;
      if (!that.isInit() || !that.isShortlist(form) || !button || !button.length) return;
      //make sure we validate correctly and render some loading icon.
    }
    //#region PDF View
    /**
     * Toggles the PDF view for the Shorlist page.
     */
    togglePDFView() {
      if (!utils.state.pdfViewActive) {
        window.setTimeout(() => { activatePdfView(); }, 1000);
        utils.state.pdfViewActive = true;
      } else {
        deactivatePdfView();
        utils.state.pdfViewActive = false;
      }
    }
    //#endregion
    //#region Init
    /**
     * Adds a venue finder specific body class.
     */
    addBodyClass() {
      $('body').addClass(CSSCLS.SHORTLISTBODY);
    }
    /**
     * Checks whether or not the shortlist is initilized.
     * @returns {bool} Whether or not the shortlist page [code] is initialized.
     */
    isInit() { return utils.state.init; }
    /**
     * Initializes the base features of this component.
     */
    init() {
      const that = this;
      utils.state.contextItemId = that.VenueFilters.form.data('context-item-id');
      initElements();
      addEventListeners(that);
      utils.state.init = true;
      initiateViewToggleOnExport();
      setCookieExpiration();
    }

    run() {
      const that = this;
      that.Utils.Debug(false, 'Shortlist: run');
      //check if we are one the shortlist page and init if so
      if (!$(`.${CSSCLS.SHORTLISTSECTION}`).length) return;
      that.addBodyClass();
      $(window).on(`${that.Utils.NS}::VenueFilters::ready`, () => {
        that.init();
      });
    }
    //#endregion
  }
  //#region init
  shortlist = new Shortlist();
  return shortlist;
  //#endregion
})();
//#endregion
//#endregion
window.requestAnimationFrame = window.requestAnimationFrame || function () { return true; };
