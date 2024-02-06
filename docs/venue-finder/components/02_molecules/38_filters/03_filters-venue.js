/* eslint-disable no-underscore-dangle, no-undef, no-shadow */

const VenueFinderListSort = require('../36_venue-finder_utils/00_venue-finder-list-class-1').default;
const VenueFinderListUnit = require('../36_venue-finder_utils/00_venue-finder-list-class-2').default;
const VenueFilterSub = require('../36_venue-finder_utils/01_filter-class-1').default;
const VFFilterResultViewType = require('../36_venue-finder_utils/01_filter-class-2').default;

App.prototype.VenueFilters = (function () {
  'use strict';

  //#region Props
  const utils = {
    ga: {
      typeName: 'Venue search',
      typeNameHotels: 'Hotels',
      subTypeName: 'Search filters',
      paramNameNofPMin: 'NoOfParticipantsMin',
      paramNameNofPMax: 'NoOfParticipantsMax',
      paramNameVenueType: 'VenueType'
    },
    /**
     * The general options for the filter sliders.
     */
    sliderOptions: {
      range: true,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      slide: null,
      change: null,
      values: null,
      step: 10
    },
    /**
     * Defines the base Toggle Settings for the filters.
     */
    toggleOptions: {
      BEM: null,
      SEL: null,
      GROUP: null,
      TOGGLE_ANIM: 'slide',
      SELF_CLOSING: true
    },
    elements: {
      typeFilters: null
    },
    state: {
      isShortlist: false,
      isVenueFinder: true,
      shortlistCookie: 'ShortListCookie',
      configKey: null, //The key for the configuration object of type config, since this is some kind of special case.
      sortColKey: 'SortBy',
      sortDirKey: 'SortOrder',
      pagingKey: 'Page',
      showHotelsKey: 'ShowHotels',
      valSwitcherKey: 'LargestSurface',
      valSwitcherOtherKey: 'LargestSurfacesq',
      spaceSliderId: 'gtc_filter_sldr_20',
      listViewDetailurlParam: null,
      ratingSuperiorityInd: ['s', 'sup'],
      requesting: {
        hotels: false,
        venues: false
      },
      filterChanged: false,
      filterChangedHotel: false,
      hotelsActive: false,
      pageChanged: false,
      initialRequest: true,
      initialRequestHotel: true,
      subscriptions: null,
      dataMaxAgeOnReq: 300000, //the max age of the data before a simple update request will occur
      activeUnitType: null,
      shortListFiltering: false,
      /**
       * Values defining the initial renderings default delay, should the list not be ready.
       * If the max timeout * couts is exceeded, the query will be executed nonetheless.
       */
      initialRendering: {
        maxRetryCount: 15,
        retryTimeout: 125
      },
      venueData: {
        data: null,
        age: null,
        page: null,
        take: null
      },
      hotelData: {
        data: null,
        age: null,
        page: null,
        take: null
      },
      labels: []
    }
  };
  /**
   * Static css classes to be used.
   */
  const CSSCLS = {
    VENUEBODY: 'gtc-venue-finder',
    FILTERACTIVE: 'js-gtc-filter__item-active',
    SMFILTERVISIBLE: 'gtc-filter--venue--sm-vis',
    BUTTON: 'gtc-btn',
    VIEWSWITCHERBUTTONCLASS: {
      BASE: 'gtc-btn--mia'
    },
    SLIDERGROUP: 'gtc-slider__slider',
    RADIOGROUP: 'gtc-radio-group',
    RADIOCHECKED: 'gtc-radio-checked',
    TEXTSEARCH: 'js-gtc-filter__search',
    TWEAKBUTTON: 'gtc-btn--tweak',
    SMHEADERCLOSE: 'gtc-filter--venue__col--sm-hdr-btn',
    VIEWSWITCHER: 'gtc-venue-finder-view-switcher',
    VIEWSWITCHMAPMODE: 'gtc-venue-finder-view-switcher--mm',
    VIEWSWTICHERLISTBTN: 'gtc-btn--mnu',
    VIEWSWITCHERMAPBTN: 'gtc-btn--pin',
    HOTELSWITCHCOL: 'gtc-filter--venue__col-box--htl-switch',
    BUTTONSWITCH: 'gtc-btn--switch',
    BUTTONSWITCHACTIVE: 'gtc-btn--switch--active',
    FILTERCOLBOX: 'gtc-filter--venue__col-box',
    FILTERCOLBOXDISABLED: 'gtc-filter--venue__col-box--disabled',
    SHORTLISTLINKBTN: 'gtc-section__heading-link gtc-btn[data-link]',
    COUNTBTN: 'gtc-btn--count',
    COUNTBTNCOUNT: 'gtc-btn__count',
    SHORTLISTFORM: 'gtc-shortlist-filter-form',
    FILTERROWTOGGLE: 'gtc-filter--venue__row-title',
    FILTERROWTOGGLEDISABLED: 'gtc-filter--venue__row-title--disabled',
    mapDisplayed: 'mapDisplayed'
  };
  /**
   * Stores a local refrence to the singleton instance being created.
   */
  // ReSharper disable once JoinDeclarationAndInitializerJs
  let filters;
  //#region Constants
  /**
   * Available filter types to be covered by the client.
   */
  const filterTypes = {
    NONE: 0,
    AND: 1,
    OR: 2,
    RADIO: 4,
    SLIDER: 8,
    RANGESLIDER: 16,
    SINGLE: 32,
    CONFIG: 64 //special case of default Or multi
  };
  //#endregion
  //#endregion
  //#region Privates
  /**
   * Checks whether or not a filter element is a hotel filter.
   * @param {$.object} element: Element to check.
   * @returns {bool}: Whether or not the filter element is a hotel filter element.
   */
  function filterElementIsHotelFilter(element) { return element && element.hasClass(filters.READDATASELHOTEL.replace(/\./g, '')); }
  /**
   * Called when the slider slides. Updates the slider values base on the slide event.
   * @param {$.object} e: jQuery event object.
   * @param {Object} ui: Object containing the references to the jQuery ui slider (handle: $.object, handleIndex: number, value: number)
   * @param {string} unit: A unit to be appended after the values.
   */
  function sliderUpdateValues(e, ui, unit) {
    const amount = $(e.target).prev();
    window.setTimeout(() => {
      const hasMaxDisplay = $(e.target).data('has-max-display').toLowerCase() === 'true' && ui.values[1] >= parseInt($(e.target).data('max-display-value')) ? true : false,
        max = hasMaxDisplay ? $(e.target).data('max-display-value') : ui.values[1];
      //change the values
      if (unit && unit.length) {
        amount.children().eq(0).html(ui.values[0] + ' ' + unit);
        amount.children().eq(1).html((hasMaxDisplay ? '>' + max : max) + ' ' + unit);
      } else {
        amount.children().eq(0).text(ui.values[0]);
        amount.children().eq(1).text(hasMaxDisplay ? '>' + max : max);
      }
    }, 0);
  }
  /**
   * Called when the slider changed it's value. Calling for a filter update value.
   * @param {$.object} e: jQuery event object.
   * @param {Object} ui: Object containing the references to the jQuery ui slider (handle: $.object, handleIndex: number, value: number)
   */
  function sliderChange(e, ui) {
    const hasMaxDisplay = $(e.target).data('has-max-display').toLowerCase() === 'true' && ui.values[1] >= parseInt($(e.target).data('max-display-value')) ? true : false,
      max = hasMaxDisplay ? parseInt($(e.target).data('max')) : ui.values[1],
      newValues = ui.values[0] + ';' + max, target = $(e.target);
    target.data('ajax-value', newValues).data('values', newValues);
    if (filterElementIsHotelFilter(target)) filters.filterChangedHotel(false);
    else filters.filterChanged(false);
  }
  /**
   * Attempts to threat the special cases for the filter.
   * @param {object} configToSend: Filter config to be send => Not the orignial Map!
   */
  function treatFilterSpecials(configToSend) {
    if (configToSend && configToSend[utils.state.configKey]) {
      //check if we go at least a single true value and remove all others if so.
      let selectedProp = null;
      for (const property in configToSend[utils.state.configKey]) {
        if (configToSend[utils.state.configKey].hasOwnProperty(property)) {
          if (configToSend[utils.state.configKey][property] === true) {
            selectedProp = property;
            break;
          }
        }
      }
      //set the selected property to be the only property. We use the key as value in this case!
      if (selectedProp !== null) {
        configToSend[utils.state.configKey] = selectedProp.toString();
      } else {
        let newValue = '';
        for (const property in configToSend[utils.state.configKey]) {
          if (configToSend[utils.state.configKey].hasOwnProperty(property)) {
            newValue += property.toString() + ',';
          }
        }
        if (newValue[newValue.length] === ',') newValue = newValue.substring(0, newValue.length - 1);
        if (!newValue.length) throw new Error('VenueFilter::Special threatment of the configuration value for filtering failed.!');
        else configToSend[utils.state.configKey] = newValue;
      }
    }
  }
  /**
   * Toggles the active state of the element.
   * @param {$.object} trigger: The button or object that triggered the action.
   * @param {$.object} filter: The filter element itself.
   * @parma {bool} staticSelect: (Optional) Whether or not the ajax-selected value is static (default: false).
   */
  function toggleFilter(trigger, filter, staticSelect) {
    if (trigger.data('ajax-selected') || filter.hasClass(CSSCLS.FILTERACTIVE)) {
      if (!staticSelect) trigger.data('ajax-selected', false);
      filter.removeClass(CSSCLS.FILTERACTIVE);
    } else {
      if (!staticSelect) trigger.data('ajax-selected', true);
      filter.addClass(CSSCLS.FILTERACTIVE);
    }
    //check whether we belong to a or b and send the values accordingly
    filters.setDataValue(trigger, filterElementIsHotelFilter(filter) ? filters.paramMapHotels : filters.paramMap);
  }
  /**
   * Handles the base filter click to select/deselect elements and triggers a change on the filters.
   * @param {$.event} e: jQuery event object.
   */
  function handleBaseFilterSelect(e) {
    const target = $(e.currentTarget);
    switch (parseInt(target.data('filter-type'))) {
      case filterTypes.OR:
      case filterTypes.AND:
        //multiple elements can be selected
        toggleFilter(target, target.parent());
        break;
      case filterTypes.CONFIG:
      case filterTypes.SINGLE:
      case filterTypes.NONE:
      default:
        //a single element can be selected
        if (!(target.data('ajax-selected') || target.parent().hasClass(CSSCLS.FILTERACTIVE))) {
          //check if we other selected elements and deselect them
          const otherActives = target.parent().parent().find(`.${CSSCLS.FILTERACTIVE}`);
          if (otherActives.length) {
            $.each(otherActives, function () {
              const element = $(this);
              toggleFilter(element.children(`.${CSSCLS.BUTTON}`), element);
            });
          }
        }
        toggleFilter(target, target.parent());
        break;
    }
    if (filterElementIsHotelFilter(target)) {
      filters.filterChangedHotel(false);
    } else {
      filters.filterChanged(false);
    }

  }
  /**
   * Initializes the space slider and it's values.
   * @param {bool} reset: Whether or not the element should be reset before init.
   * @param {int<VenueFinderListUnit.types()>} unit: The type to initialize the stuff with.
   * @param {$.object} element: To initialize the slider on.
   * @param {oject} filters:  The instance of the filters class that is being utilized. Neccessary since I don't want to use this right here and the method is called before the cunstructor call of VenueFilters has finished completely.
   */
  function initSpaceSlider(reset, unit, element, filters) {
    const bar = element, baseVals = bar.data('values').split(';');
    //destroy the old element.
    if (reset) bar.slider('destroy');
    //the values for min max and baseVals depend on the unit
    let min = parseInt(bar.data('min')) || utils.sliderOptions.min, max = bar.data('has-max-display').toLowerCase() === 'true' ? parseInt(bar.data('max-display-value')) || utils.sliderOptions.max : parseInt(bar.data('max')) || utils.sliderOptions.max;
    if (unit === VenueFinderListUnit.types().SQMETER) {
      if (reset) {
        baseVals[0] = min;
        baseVals[1] = max;
      } else {
        baseVals[0] = parseInt(baseVals[0]);
        baseVals[1] = parseInt(baseVals[1]);
      }
    } else {
      baseVals[0] = Math.floor(filters.Utils.numeric.squareMetersToSquareFeet(parseInt(baseVals[0])));
      baseVals[1] = Math.ceil(filters.Utils.numeric.squareMetersToSquareFeet(parseInt(baseVals[1])));
      min = Math.floor(Math.round(filters.Utils.numeric.squareMetersToSquareFeet(min)));
      max = Math.ceil(Math.round(filters.Utils.numeric.squareMetersToSquareFeet(max)));
    }
    const opts = $.extend(true, {}, utils.sliderOptions, {
      min: min,
      max: max,
      step: bar.data('steps') || utils.sliderOptions.steps,
      slide: function (e, ui) { sliderUpdateValues(e, ui, filters.labelForUnit(utils.state.activeUnitType)); },
      change: sliderChange,
      values: [baseVals[0], baseVals[1]]
    });
    //validate steps
    if (opts.max % opts.step !== 0 || opts.min % opts.step !== 0) opts.step = 1;
    bar.slider(opts);
    sliderUpdateValues({ target: bar }, { values: opts.values }, filters.labelForUnit(utils.state.activeUnitType));
    //update the values set in the parammap if we destroyed the slider.
    if (reset) {
      sliderChange({ target: bar }, { values: opts.values });
      if (filterElementIsHotelFilter(element)) filters.filterChangedHotel(false);
      else filters.filterChanged(false);
    }
  }
  /**
   * Called when the measuring unit of the filter has changed.
   * @param {int<VenueFinderListUnit.types()>} newValue: Type of the new unit.
   */
  function unitChanged(newValue) {
    filters.Utils.Debug(true, newValue);
    //trigger the class change for
    filters.VenueFinderList.toggleUnitClass(newValue);
    utils.state.activeUnitType = newValue;
    //reinit the required space range slider
    initSpaceSlider(true, newValue, $(`#${utils.state.spaceSliderId}`), filters);
  }
  /**
   * Handles the radio filter click to select/deselect elements and triggers a change on the filters.
   * Triggers the filter change asynchrounously, if one is bound to occur.
   * @param {$.event} e: jQuery event object.
   */
  function handleRadioFilterSelect(e) {
    const target = $(e.currentTarget);
    //don't handle the default input click
    if (e.target.tagName.toLowerCase() === 'input' || parseInt(target.parent().data('filter-type')) !== filterTypes.RADIO) return true;
    const input = target.children('input');
    if (!input.is(':checked')) {
      //toggle style classes
      target.parent().find('input:checked').removeAttr('checked').parent().removeClass(CSSCLS.RADIOCHECKED);
      input.trigger('click');
      input.parent().addClass(CSSCLS.RADIOCHECKED);
      window.setTimeout(() => {
        target.data('ajax-value', input.data('ajax-value'));
        //trigger unit and filter change
        unitChanged(parseInt(input.data('ajax-value')));
        if (filterElementIsHotelFilter(target)) filters.filterChangedHotel(false);
        else filters.filterChanged(false);
        input.attr('checked', true);
      }, 0);
    }
    return void (0);
  }
  /**
   * Handles the search input change events.
   * @param {$.event} e: jQuery event object.
   */
  function handleInputChange(e) {
    const target = $(e.currentTarget);
    //don't handle the default input click
    if (e.target.tagName.toLowerCase() !== 'input') return true;
    let oldData = target.data('ajax-value'), val = target.val();
    if (oldData === undefined || oldData === null) oldData = '';
    if (val === undefined || val === null) val = '';
    else val = val.trim();
    //trigger change
    if (oldData !== val.trim()) {
      target.data('ajax-value', val);
      if (filterElementIsHotelFilter(target)) filters.filterChangedHotel(false);
      else filters.filterChanged(false);
    }
    return true;
  }
  /**
   * Processes the data from the service.
   * @param {Arry<Object>} data: Service data.
   * @param {int} page: The current page number, indicating whether or not the data will have to be reset.
   * @param {bool} isHotelReq: Whether or not the request did got to the hotel endpoint.
   */
  function processData(data, page, isHotelReq) {
    const geneveLocation = filters.MapVenue.geneveLocation();
    if (!utils.state.listViewDetailurlParam) utils.state.listViewDetailurlParam = data.DetailUrlParam;

    if (data.Venues && data.Venues.length) {
      for (let i = 0, iLen = data.Venues.length; i < iLen; ++i) {
        //add the image at the first level, so we don't need custom binding code.
        if (data.Venues[i].HeroImage && data.Venues[i].HeroImage.ImageUrl && data.Venues[i].HeroImage.ImageUrl.length) {
          data.Venues[i].TitleImage = __IS_LOCAL__ ? `https://www.geneve.com/${data.Venues[i].HeroImage.ImageUrl}` : data.Venues[i].HeroImage.ImageUrl;
          data.Venues[i].TitleImageDesc = data.Venues[i].HeroImage.Caption;
          //no ImageSquare present anymore
        // } else if (data.Venues[i].ImageSquare && data.Venues[i].ImageSquare.ImageUrl && data.Venues[i].ImageSquare.ImageUrl.length) {
        //   data.Venues[i].TitleImage = __IS_LOCAL__ ? `https://www.geneve.com/${data.Venues[i].HeroImage.ImageUrl}` : data.Venues[i].ImageSquare.ImageUrl;
        //   data.Venues[i].TitleImageDesc = data.Venues[i].ImageSquare.Caption;
        } else {
          data.Venues[i].TitleImage = null;
          data.Venues[i].TitleImageDesc = null;
        }
        //value switcher
        if (data.Venues[i].hasOwnProperty(utils.state.valSwitcherKey)) {
          const baseVal = data.Venues[i][utils.state.valSwitcherKey];
          if (!GTC.Utils.numeric.isNumber(parseFloat(baseVal))) data.Venues[i][utils.state.valSwitcherKey] = 0;
          else data.Venues[i][utils.state.valSwitcherKey] = parseFloat(data.Venues[i][utils.state.valSwitcherKey]);
          data.Venues[i][utils.state.valSwitcherOtherKey] = Math.round(GTC.Utils.numeric.squareMetersToSquareFeet(data.Venues[i][utils.state.valSwitcherKey]));
        } else data.Venues[i][utils.state.valSwitcherKey] = 0;
        //longitude and latitude
        const location = data.Venues[i].GoogleLocation.split(',');
        if (filters.Utils.numeric.isNumber(parseFloat(location[0])) && filters.Utils.numeric.isNumber(parseFloat(location[1]))) {
          data.Venues[i].latitude = parseFloat(location[0]);
          data.Venues[i].longitude = parseFloat(location[1]);
        } else {
          data.Venues[i].latitude = geneveLocation.lat;
          data.Venues[i].longitude = geneveLocation.lng;
        }
        //set id abbreviation ref
        data.Venues[i].id = data.Venues[i].ItemId;
        //set hotel and venud property ==> Both should be present, since hotels may also be conference centers and (pure) conference centers may never be hotels.
        data.Venues[i].isHotel = data.Venues[i].NumberOfHotelRooms > 0 ? true : isHotelReq;
        data.Venues[i].isVenue = data.Venues[i].NumberOfMeetingRooms > 0 ? true : false;
        //hotel rating
        if (data.Venues[i].HotelRating && data.Venues[i].HotelRating.length) {
          let rating = data.Venues[i].HotelRating;
          if (rating.indexOf(utils.state.ratingSuperiorityInd[1]) > -1 || rating.indexOf(utils.state.ratingSuperiorityInd[0]) > -1) {
            data.Venues[i].IsSuperior = true;
            rating = parseFloat(rating);
            data.Venues[i].HotelRating = filters.Utils.numeric.isNumber(rating) ? rating : 0;
          } else {
            rating = parseFloat(rating);
            data.Venues[i].HotelRating = filters.Utils.numeric.isNumber(rating) ? rating : 0;
            data.Venues[i].IsSuperior = false;
          }
        } else data.Venues[i].IsSuperior = false;
      }
    }
    if (!data.Venues || !data.Venues.length) {
      if (isHotelReq) {
        utils.state.hotelData.total = 0;
        utils.state.hotelData.page = 1;
        utils.state.hotelData.data = [];
        utils.state.hotelData.take = 0;
      } else {
        utils.state.venueData.total = 0;
        utils.state.venueData.page = 1;
        utils.state.venueData.data = [];
        utils.state.venueData.take = 0;
      }
    } else {
      if (isHotelReq) {
        //set states
        if (page === 1) {
          utils.state.hotelData.page = 1;
          utils.state.hotelData.data = data.Venues.slice(0, data.length);
          utils.state.hotelData.take = data.Venues.length;
        } else {
          utils.state.hotelData.data = utils.state.hotelData.data.concat(data.Venues.slice(0, data.Venues.length));
          utils.state.hotelData.page = page;
        }
        utils.state.hotelData.total = data.TotalNumberOfResults;
        filters.Utils.Debug(true, ['Hotel Data', utils.state.hotelData]);
      } else {
        //set states
        if (page === 1) {
          utils.state.venueData.page = 1;
          utils.state.venueData.data = data.Venues.slice(0, data.length);
          utils.state.venueData.take = data.Venues.length;
        } else {
          utils.state.venueData.data = utils.state.venueData.data.concat(data.Venues.slice(0, data.Venues.length));
          utils.state.venueData.page = page;
        }
        utils.state.venueData.total = data.TotalNumberOfResults;
        filters.Utils.Debug(true, ['Venue Data', utils.state.venueData]);
      }
    }
  }
  /**
   * @returns {bool}: Whether or not the paramMap has a sorting prop set.
   */
  function hasSort() {
    if (filters.paramMap && filters.paramMap.size && filters.paramMap.has(utils.state.sortColKey)) return true;
    return false;
  }
  /**
   * @returns {bool}: Whether or not the paramMap has a sorting prop set.
   */
  function hasPage() {
    if (filters.paramMap && filters.paramMap.size && filters.paramMap.has(utils.state.pagingKey)) return true;
    return false;
  }
  /**
   * Toggles the view switcher button classes for the mobile view, since the designer didn't consider UX at all and probably though it would look fancy. Great Job!
   */
  function toggleVSwitcherBtnClass() {
    const currentViewPort = filters.Utils.viewport.current();
    if ((currentViewPort !== filters.Utils.viewport.TYPES.XS && currentViewPort !== filters.Utils.viewport.TYPES.SM)) {
      //toggle the filter sm state, in order to avoid glitches
      if (filters.form.children().eq(0).hasClass(CSSCLS.SMFILTERVISIBLE)) filters.toggleMobileVisibility($(`.${CSSCLS.TWEAKBUTTON}`));
    }
  }
  /**
   * Runs the default filter query setup and calls the rendering functionality. This method calls itself recursevely when the conditions are met.
   * @param  {int} retryCount The current retry count or 0.
   * @param {object} that: The reference to the block scope singleton instance, since it's potentially not finished initializing when this method is being called.
   */
  function _renderInitialContent(retryCount, that) {
    window.setTimeout(() => {
      //we need to make sure to have the initial filtering state ready
      if (that.VenueFinderList.isInitialized() || retryCount >= utils.state.initialRendering.maxRetryCount) that.filter();
      else window.setTimeout(() => { _renderInitialContent(++retryCount, that); }, utils.state.initialRendering.retryTimeout);
    }, 0);
  }
  /**
   * Sets the request state for venues or hotels.
   * @param {bool} venues Whether the state should be set for venues (true) or hotels(false|null|undefined).
   * @param {bool} isRequesting The state to be set.
   */
  function setRequestState(venues, isRequesting) {
    if (venues) utils.state.requesting.veenues = isRequesting ? true : false;
    else utils.state.requesting.hotels = isRequesting ? true : false;
  }

  /**
   * Sends a google analytics request for the different request types.
   * @param {string} type The type value to be used in the request.
   */
  function sendGaRequests(type) {
    if (!utils.elements.typeFilters) utils.elements.typeFilters = filters.form.find('[data-category="' + utils.ga.paramNameVenueType + '"]');
    let valueString = `${filters.paramMap.get(utils.ga.paramNameNofPMin)};${filters.paramMap.get(utils.ga.paramNameNofPMax)};`;
    //add all values.
    let venueType = filters.paramMap.get(utils.ga.paramNameVenueType);
    if (!venueType || !venueType.length) {
      venueType = [];
      for (let i = 0, iLen = utils.elements.typeFilters.length; i < iLen; ++i) venueType.push($(utils.elements.typeFilters[i]).data('ajax-value'));
    }
    for (let i = 0, iLen = 4; i < iLen; ++i) valueString += (venueType[i] ? venueType[i].trim() : '') + ';';
    filters.GoogleEvents.sendGoogeAnalyticsRequest(utils.ga.typeName === type ? utils.ga.typeName : utils.ga.typeName + ':' + type, utils.ga.subTypeName, valueString);
  }
  //#endregion
  //#region Publics
  /**
   * @class VenueFilters
   * @classdesc: Provides the filter functionality for the new venue finder page..
   * @extends App
   */
  class VenueFilters extends App {
    constructor() {
      super();
      const that = this;
      //#region Base Values
      that.CSS_NSP = that.Utils.CssNsp;
      that.JS_NSP = that.Utils.JsNsp;
      that.BEM = `${that.CSS_NSP}filter--venue`;
      //#endregion
      //#region Selectors
      that.SHORTLISTSELECTOR = `.${that.JS_NSP}${that.CSS_NSP}-shortlistSearch`;
      that.FOMRSELECTOR = '#venue-search-form';
      that.READDATASELVENUE = `.${that.JS_NSP}${that.BEM}-rd`; //read data from all elements matching this selector when submitting data.
      that.READDATASELHOTEL = `${that.READDATASELVENUE}-htl`;
      that.FILTERBTNSEL = `.${that.JS_NSP}${that.CSS_NSP}filter__srh-btn`;
      that.TOGGLESELECTOR = `${that.JS_NSP}${that.BEM}__row-title`; //dont include the loading dot for the toggle selector
      that.SLIDERSELECTOR = `.${that.CSS_NSP}slider`;
      that.resultCoutnSelector = `.${that.JS_NSP}vf-gv-c-lbl`;
      //#endregion
      //elements
      that.form = null;
      that.filterButton = null;
      that.moreFiltersToggle = null;
      that.hotelFiltersToggle = null;
      that.hotelFiltersToggleBaseEl = null;
      that.sliders = null;
      //data
      that.paramMap = null;
      that.paramMapHotels = null;
      that.filterValueStores = null;
      that.filterValueStoresHotels = null;
      //launch prop
      that.launch = that.run();
    }
    /**
     * Updates the filter and requests the next page, if possible.
     * @param {bool} noCall: Whether the filter function should NOT be called.
     * @param {bool} reset: (Optional) Whether or not the page shoud be reset (default: false).
     */
    page(noCall, reset) {
      const that = filters;
      if (!that.paramMap) that.paramMap = new Map();
      if (!that.paramMap.has(utils.state.pagingKey) || reset) that.paramMap.set(utils.state.pagingKey, 1);
      else that.paramMap.set(utils.state.pagingKey, that.paramMap.get(utils.state.pagingKey) + 1);
      utils.state.pageChanged = true;
      if (!noCall) that.filter();
    }
    /**
     * Attempts to change the sorting of the data via service request.
     * @param {int} colId: Id of the column to be filtered or -1;
     * @param {string} order: The filtering direction (ASC, DSC, NONE).
     * @param {bool} triggerSearch: Whether or not to trigger the search on change.
     */
    sort(colId, order, triggerSearch) {
      const that = filters;
      if (!that.paramMap) that.paramMap = new Map();
      if (colId !== null && colId !== undefined && (order === VenueFinderListSort.sortOrderASC() || order === VenueFinderListSort.sortOrderDSC() || order === VenueFinderListSort.sortOrderNone())) {
        let hasChanged = false;
        if (!that.paramMap.has(utils.state.sortColKey) || that.paramMap.get(utils.state.sortColKey) !== colId) {
          hasChanged = true;
          that.paramMap.set(utils.state.sortColKey, colId);
        }
        if (!that.paramMap.has(utils.state.sortDirKey) || that.paramMap.get(utils.state.sortDirKey) !== order) {
          hasChanged = true;
          that.paramMap.set(utils.state.sortDirKey, order);
        }
        //set filter state
        if (hasChanged) {
          that.filterChanged();
          if (triggerSearch) that.filter();
        }
      }
    }
    /**
     * @param {bool} forHotels: Whether or not the check should be executed for hotels instead of venues.
     * @returns{bool} Whether or not a filter update request is required.
     */
    updateRequired(forHotels) {
      if (forHotels) {
        if (utils.state.filterChangedHotel || utils.state.initialRequestHotel || (new Date().getTime() - utils.state.hotelData.age >= utils.state.dataMaxAgeOnReq)) return true;
      } else {
        if (utils.state.filterChanged || utils.state.initialRequest || utils.state.pageChanged || (new Date().getTime() - utils.state.venueData.age >= utils.state.dataMaxAgeOnReq)) return true;
      }
      return false;
    }
    /**
     * Checks whether or not we're requesting filter data.
     * @param {bool} venues Whether we should check for venue data requests (true) or hotel data requests(false|undefined|null).
     */
    isRequesting(venues) { return venues ? utils.state.requesting.venues : utils.state.requesting.hotels; }
    /**
     * Calls the corresponding filter function based on the existence of the 'data-shortlist-search' tag on the parent form
     */
    filter() {
      const that = this;
      if (utils.state.isShortlist) {
        that.Shortlist.loadShortlistCookie();
        that.filterShortlist();
      } else that.filterVenues();
    }
    /**
     * Collects the data and submits the venue filter requests to the server.
     */
    filterVenues() {
      const that = this,
        els = that.getFilterElements();
      if (that.isRequesting(true) || !that.updateRequired()) return false;
      if (!that.paramMap) that.paramMap = new Map();
      setRequestState(true, true);
      that.updateSubScribers(VenueFilterSub.types().REQSTARTED);
      //collect the data
      $.each(els, function () { that.setDataValue($(this), that.paramMap); });
      //set required properties if not already done
      if (!hasSort()) that.sort(-1, VenueFinderListSort.sortOrderNone());
      if (!hasPage()) that.page();
      that.paramMap.set('ContextItemId', that.form.data('context-item-id'));
      that.paramMap.set('SearchString', $('[data-category=SearchString]').val());
      const selectedConfiguration = $('#moreFilters .js-gtc-filter__item-active [data-category="Configuration"]');
      if (selectedConfiguration) {
        that.paramMap.set('ConfigurationActiveLabel', selectedConfiguration.text());
      }
      //clone the map (shallow)
      const parameters = that.Utils.mapToObject(that.paramMap);
      //go for special cases
      treatFilterSpecials(parameters);
      //reset filter changed values
      utils.state.filterChanged = utils.state.initialRequest = utils.state.pageChanged = false;
      //send the request
      that.Utils.request.postJSON({
        data: parameters,
        url: that.Utils.urls.venueSearch(),
        onDone: (data) => {
          that.Utils.Debug(false, '---------- Filter Venue return value ------------', data);
          GTC.HotelVenueStore.venueResults = data.Venues;
          //process the data and update the subscribers
          processData(data, parameters.Page, false);
          that.updateResultCount();
          that.updateSubScribers(VenueFilterSub.types().REQENDED);
          that.updateSubScribers(VenueFilterSub.types().VENUES);
          that.updateSubScribers(VenueFilterSub.types().HOTELS);
        },
        onFail: function (...args) {
          //TODO: Add proper failure handling, tell the user that an error occurred and he/shit/it has to reload the page.
          that.Utils.Debug(true, args);
          that.updateSubScribers(VenueFilterSub.types().REQCANCELED);
        },
        onAlways: function () {
          const { ConfigurationActiveLabel } = parameters;
          const theaterColumnLabel = $('.js-theaterCol .gtc-btn__label');
          if (ConfigurationActiveLabel && ConfigurationActiveLabel.length) {
            theaterColumnLabel.html(`${ConfigurationActiveLabel} Capacity`);
          } else {
            theaterColumnLabel.html('Theater Capacity');
          }
          setRequestState(true, false);
        }
      });
      sendGaRequests(utils.ga.typeName);
      return false;
    }
    /**
     * Gathers data and submits the Short list filter requests to the server.
     */
    filterShortlist() {
      const that = this;
      if (that.isRequesting(true) || !that.updateRequired()) return false;
      if (!that.paramMap) that.paramMap = new Map();
      setRequestState(true, true);
      that.updateSubScribers(VenueFilterSub.types().REQSTARTED);
      //set required properties if not already done
      if (!hasSort()) that.sort(-1, VenueFinderListSort.sortOrderNone());
      if (!hasPage()) that.page();
      that.paramMap.set('ContextItemId', that.form.data('context-item-id'));
      //clone the map (shallow)
      const parameters = that.Utils.mapToObject(that.paramMap);
      //reset filter changed values
      utils.state.filterChanged = utils.state.initialRequest = utils.state.pageChanged = false;
      //send the request
      that.Utils.request.postJSON({
        data: parameters,
        url: that.Utils.urls.shortListSearch(),
        onDone: (data) => {
          that.Utils.Debug(false, '---------- Filter Shortlist return value ------------', data);
          GTC.HotelVenueStore.venueResults = data.Venues;
          //process the data and update the subscribers
          processData(data, parameters.Page, false);
          that.updateResultCount();
          that.updateSubScribers(VenueFilterSub.types().REQENDED);
          that.updateSubScribers(VenueFilterSub.types().VENUES);
        },
        onFail: function (...args) {
          //TODO: Add proper failure handling, tell the user that an error occurred and he/shit/it has to reload the page.
          that.Utils.Debug(true, args);
          that.updateSubScribers(VenueFilterSub.types().REQCANCELED);
        },
        onAlways: function () {
          setRequestState(true, false);
        }
      });
      return false;
    }
    /**
     * Collects the data and submits the hotel filter requests to the server.
     */
    filterHotels() {
      const that = this,
        els = that.getFilterElements(true);
      if (that.isRequesting(false) || !that.updateRequired(true)) return false;
      if (!that.paramMapHotels) that.paramMapHotels = new Map();
      setRequestState(false, true);
      that.updateSubScribers(VenueFilterSub.types().REQSTARTED);
      //collect the data
      $.each(els, function () { that.setDataValue($(this), that.paramMapHotels); });
      //reset the keys for sort and set the page, since hotels don't page.
      that.paramMapHotels.set(utils.state.sortColKey, -1);
      that.paramMapHotels.set(utils.state.sortDirKey, null);
      that.paramMapHotels.set(utils.state.pagingKey, 1);
      that.paramMapHotels.set(utils.state.showHotelsKey, true);
      that.paramMapHotels.set('ContextItemId', that.form.data('context-item-id'));
      //clone the map (shallow)
      const parameters = that.Utils.mapToObject(that.paramMapHotels);
      //go for special cases
      treatFilterSpecials(parameters);
      //reset filter changed values
      utils.state.filterChangedHotel = utils.state.initialRequestHotel = false;
      //send the request
      that.Utils.request.postJSON({
        data: parameters,
        url: that.Utils.urls.hotelSearch(),
        onDone: (data) => {
          that.Utils.Debug(false, '------------ Filter Hotels return value ------------', data);
          GTC.HotelVenueStore.hotelResults = data.Venues;
          //process the data and update the subscribers
          processData(data, parameters.Page, true);
          that.updateSubScribers(VenueFilterSub.types().REQENDED);
          that.updateSubScribers(VenueFilterSub.types().HOTELS);
          that.updateSubScribers(VenueFilterSub.types().VENUES);
        },
        onFail: function (...args) {
          //TODO: Add proper failure handling, tell the user that an error occurred and he/shit/it has to reload the page.
          that.Utils.Debug(true, args);
          that.updateSubScribers(VenueFilterSub.types().REQCANCELED);
        },
        onAlways: function () {
          setRequestState(false, false);
        }
      });
      sendGaRequests(utils.ga.typeNameHotels);
      return false;
    }

    resetHotels() {
      this.updateSubScribers(VenueFilterSub.types().REQSTARTED);
      const data = {
        Venues: [],
        TotalNumberOfResults: 0
      };
      this.Utils.Debug(false, '------------ Reset Hotels return value ------------', data);
      GTC.HotelVenueStore.hotelResults = data.Venues;
      //process the data and update the subscribers
      processData(data, 1, true);
      this.updateSubScribers(VenueFilterSub.types().REQENDED);
      this.updateSubScribers(VenueFilterSub.types().HOTELS);
      this.updateSubScribers(VenueFilterSub.types().VENUES);
    }
    /**
     * Sets the data value for the given element to the data map.
     * @param {$.object} el: jQuery element to add the objects to.
     * @param {Object<Map>} setIn: Collection to set the values in.
     */
    setDataValue(el, setIn) {
      if (!el.length) return;
      const category = el.data('category');
      let data = el.data('ajax-value'), curVal, isNew = false, update = false, isRange = false;
      switch (parseInt(el.data('filter-type'))) {
        case filterTypes.OR:
        case filterTypes.AND:
        case filterTypes.SLIDER:
          //multi value
          if (!setIn.has(category)) {
            curVal = [];
            isNew = true;
          } else curVal = setIn.get(category);
          //set the value
          if (el.data('ajax-selected')) {
            if (curVal.indexOf(data) < 0) {
              update = true;
              curVal.push(data);
            }
          } else {
            const idx = curVal.indexOf(data);
            if (idx > -1) {
              update = true;
              curVal.splice(idx, 1);
            }
          }
          break;
        case filterTypes.RANGESLIDER:
          {
            isRange = true;
            //get the data
            data = data.split(';');
            if (data && data.length === 2) {
              data[0] = parseInt(data[0]);
              data[1] = parseInt(data[1]);
            } else throw new Error(`Filter::RangeSlider::DataFormatting exception ==> expected ajaxvalue to be "number;number - found: ${data}.`);
            //get and write the values
            const categories = category.split(';');
            if (categories && categories.length === 3) {
              categories[1] = categories[0] + categories[1]; //Min
              categories[2] = categories[0] + categories[2]; //max
            }
            //multi value
            if (!setIn.has(categories[1])) {
              curVal = '';
              isNew = true;
            } else curVal = setIn.get(categories[1]);
            //set the value
            if (curVal !== data[0]) {
              update = true;
              curVal = data[0];
            }
            if (isNew || update) setIn.set(categories[1], curVal);
            //reset
            isNew = false;
            update = false;
            //multi value
            if (!setIn.has(categories[2])) {
              curVal = '';
              isNew = true;
            } else curVal = setIn.get(categories[2]);
            //set the value
            if (curVal !== data[1]) {
              update = true;
              curVal = data[1];
            }
            if (isNew || update) setIn.set(categories[2], curVal);
          }
          break;
        case filterTypes.RADIO:
          data = el.find('input[checked]').data('ajax-value');
          //multi value
          if (!setIn.has(category)) {
            curVal = '';
            isNew = true;
          } else curVal = setIn.get(category);
          //set the value
          if (curVal !== data) {
            update = true;
            curVal = data;
          }
          break;
        case filterTypes.CONFIG:
          /**
           * @desc: Always submit all values for this type.
           */
          update = true;
          //multi value
          if (!setIn.has(category)) {
            curVal = {};
            isNew = true;
            //set the config key for special treatment before sending the data.
            if (!utils.state.configKey) utils.state.configKey = category;
          } else curVal = setIn.get(category);
          //set the value
          curVal[data] = el.data('ajax-selected');
          break;
        case filterTypes.SINGLE:
        case filterTypes.NONE:
        default:
          //multi value
          if (!setIn.has(category)) {
            curVal = '';
            isNew = true;
          } else curVal = setIn.get(category);
          //set the value
          if (el.data('ajax-selected')) {
            if (curVal !== data) {
              update = true;
              curVal = data;
            }
          } else {
            if (curVal === data) {
              update = true;
              curVal = '';
            }
          }
          break;
      }
      //Update value(s)
      if ((isNew || update) && !isRange) setIn.set(category, curVal);
    }
    /**
     * Adds the neccessary event handlers.
     */
    addEventListeners() {
      const that = this;
      that.filterButton.on('click', function () {

        that.filter();
        //if hotels are active
        if (utils.state.hotelsActive) that.filterHotels();
        //Close the search menu while in mobile view.
        const currentViewPort = filters.Utils.viewport.current();
        if (currentViewPort === filters.Utils.viewport.TYPES.XS || currentViewPort === filters.Utils.viewport.TYPES.SM) {
          $(`.${CSSCLS.SMHEADERCLOSE}`).trigger('click');
        }
      });
      //prevent form submit
      that.form.submit(function (e) { e.preventDefault(); });
      if (utils.state.isVenueFinder) {
        //filter item handlers
        const elements = $.merge(that.getFilterElements(), that.getFilterElements(true)), baseBtns = elements.filter(`:not(.${CSSCLS.SLIDERGROUP}, .${CSSCLS.RADIOGROUP})`);
        //button elements
        baseBtns.on('click', handleBaseFilterSelect);
        //radio elements
        $.each(elements.filter(`.${CSSCLS.RADIOGROUP}`),
          function () {
            $(this).find(`.${CSSCLS.RADIOCHECKED} input`).trigger('click'); //activate the checked element of each radio group, so we get around the radio issue.
            $(this).children().on('click', handleRadioFilterSelect);
          });
        //Text filter
        elements.filter(`.${CSSCLS.TEXTSEARCH}`).val('').on('input change', handleInputChange).on('keydown',
          function (e) {
            if (e.type === 'keydown' && e.keyCode === 13) {
              $(e.currentTarget).trigger('change');
              window.setTimeout(() => { if (that.updateRequired()) that.filter(); }, 50);
            }
          });
        $(`.${CSSCLS.TWEAKBUTTON}, .${CSSCLS.SMHEADERCLOSE}`).on('click', that.toggleMobileVisibility.bind(that));
      }
      //view switcher
      const switcherBtns = $(`.${CSSCLS.VIEWSWITCHER}`).find(`.${CSSCLS.BUTTON}`);
      switcherBtns.filter(`.${CSSCLS.VIEWSWITCHERMAPBTN}`).on('click', function () { that.switchViewTypeTo(VFFilterResultViewType.types().MAP); });
      switcherBtns.filter(`.${CSSCLS.VIEWSWTICHERLISTBTN}`).on('click', function () { that.switchViewTypeTo(VFFilterResultViewType.types().LIST); });
      //hotel toggle
      //add the handler for the hotel toggle and the specifics for the rest bla bla
      $(`.${CSSCLS.HOTELSWITCHCOL}`).find(`.${CSSCLS.BUTTONSWITCH}`).on('click', that.toggleHotels.bind(that));
      //resize evenmt for the button class toggle
      $(window).on('changeViewport', that.Utils.debounce(toggleVSwitcherBtnClass, 125, that.Utils));

      //avoid any kind of mousedown and click on disabeld toggles
      $(`.${CSSCLS.FILTERROWTOGGLE}`).on('mousedown mouseup click', (e) => {
        if ($(e.target).hasClass(CSSCLS.FILTERROWTOGGLEDISABLED) || $(e.currentTarget).hasClass(CSSCLS.FILTERROWTOGGLEDISABLED)) {
          e.preventDefault();
          return false;
        }
        return true;
      });
    }
    /**
     * Delivers all elements to read filter data from.
     * @param {bool} forHotels: Whether or not the check should be executed for hotels.
     * @returns {$.object}: Array of jquery objects.
     */
    getFilterElements(forHotels) {
      const that = this;
      if (forHotels) {
        if (!that.filterValueStoresHotels) that.filterValueStoresHotels = that.form.find(that.READDATASELHOTEL);
        return that.filterValueStoresHotels;
      } else {
        if (!that.filterValueStores) that.filterValueStores = that.form.find(that.READDATASELVENUE);
        return that.filterValueStores;
      }
    }
    /**
     * Runs the default filter query setup and calls the rendering functionality.
     */
    renderInitialContent() {
      _renderInitialContent(0, this);
    }
    /**
     * Updates the venueSearch result count on the ui.
     */
    updateResultCount() {
      const that = this;
      $(that.resultCoutnSelector).text(utils.state.venueData.total || 0);
    }
    /**
     * Attempts to switch the view type to the given type and handles the neccessary initialization.
     * @param {int<VFFilterResultViewType.types()>} type
     */
    switchViewTypeTo(type) {
      if (utils.state.filterResultViewType !== type) {
        const that = this, switchBtns = $(`.${CSSCLS.VIEWSWITCHER}`).find(`.${CSSCLS.BUTTON}`);
        if (type === VFFilterResultViewType.types().NONE) {
          if (!that.VenueFinderList.isHidden()) that.VenueFinderList.hide();
          if (!that.MapVenue.isHidden()) that.MapVenue.hide();
          //buttons
          switchBtns.filter(`.${CSSCLS.VIEWSWTICHERLISTBTN}`).parent().removeClass('gtc-lst__itm--active');
          switchBtns.filter(`.${CSSCLS.VIEWSWITCHERMAPBTN}`).parent().removeClass('gtc-lst__itm--active').parent().removeClass(CSSCLS.VIEWSWITCHMAPMODE);
          //toggle the hotels element
          //that.hotelFiltersToggleBaseEl.attr('aria-hidden', true);
          if ($(`#${that.hotelFiltersToggleBaseEl.data('target')}`).attr('aria-hidden') !== 'true') {
            $(that.hotelFiltersToggleBaseEl).trigger('click');
            that.hotelFiltersToggleBaseEl.addClass(CSSCLS.FILTERROWTOGGLEDISABLED);
          } else {
            that.hotelFiltersToggleBaseEl.addClass(CSSCLS.FILTERROWTOGGLEDISABLED);
          }
        } else if (type === VFFilterResultViewType.types().LIST) {
          // Reset mapsDesplayed class
          $('body').removeClass(CSSCLS.mapDisplayed);
          if (that.VenueFinderList.isHidden()) that.VenueFinderList.show();
          if (!that.MapVenue.isHidden()) that.MapVenue.hide();
          //buttons
          switchBtns.filter(`.${CSSCLS.VIEWSWTICHERLISTBTN}`).parent().addClass('gtc-lst__itm--active');
          switchBtns.filter(`.${CSSCLS.VIEWSWITCHERMAPBTN}`).parent().removeClass('gtc-lst__itm--active').parent().removeClass(CSSCLS.VIEWSWITCHMAPMODE);
          //toggle the hotels element
          //that.hotelFiltersToggleBaseEl.attr('aria-hidden', true);
          if ($(`#${that.hotelFiltersToggleBaseEl.data('target')}`).attr('aria-hidden') !== 'true') {
            $(that.hotelFiltersToggleBaseEl).trigger('click');
            that.hotelFiltersToggleBaseEl.addClass(CSSCLS.FILTERROWTOGGLEDISABLED);
            utils.state.hotelsActive = false;
            that.MapVenue.toggleHotels(false);
            filters.resetHotels();
            $(`.${CSSCLS.HOTELSWITCHCOL}`).find(`.${CSSCLS.BUTTONSWITCH}`).removeClass(CSSCLS.BUTTONSWITCHACTIVE);
            $(`.${CSSCLS.HOTELSWITCHCOL}`).removeClass(CSSCLS.FILTERACTIVE);
          } else {
            that.hotelFiltersToggleBaseEl.addClass(CSSCLS.FILTERROWTOGGLEDISABLED);
            $(`.${CSSCLS.HOTELSWITCHCOL}`).find(`.${CSSCLS.BUTTONSWITCH}`).removeClass(CSSCLS.BUTTONSWITCHACTIVE);
            $(`.${CSSCLS.HOTELSWITCHCOL}`).removeClass(CSSCLS.FILTERACTIVE);
            utils.state.hotelsActive = false;
            that.MapVenue.toggleHotels(false);
            filters.resetHotels();
          }
        } else if (type === VFFilterResultViewType.types().MAP) {
          $('body').addClass(CSSCLS.mapDisplayed);
          if (!that.VenueFinderList.isHidden()) that.VenueFinderList.hide();
          //that.hotelFiltersToggleBaseEl.removeClass(CSSCLS.FILTERROWTOGGLEDISABLED);
          //render the map
          if (that.MapVenue.isHidden()) {
            that.MapVenue.show();
            that.MapVenue.renderData(true);
            that.MapVenue.center();
          }
          //buttons
          switchBtns.filter(`.${CSSCLS.VIEWSWITCHERMAPBTN}`).parent().addClass('gtc-lst__itm--active');
          switchBtns.filter(`.${CSSCLS.VIEWSWTICHERLISTBTN}`).parent().removeClass('gtc-lst__itm--active').parent().addClass(CSSCLS.VIEWSWITCHMAPMODE);
          //toggle the hotels element
          that.hotelFiltersToggleBaseEl.attr('aria-hidden', false);
          $('.gtc-btn--mnu').on('click', function () {
            if (!$('body').hasClass('gtc-shortlist')) {
              that.VenueFilters.filterVenues();
            }
          });
        }
        utils.state.filterResultViewType = type;
      }
    }
    /**
     * Toggles the clases for mobile visibility on the filter element.
     */
    toggleMobileVisibility(e) {
      //Fix: This thing is being triggered when you press enter on the search text stuff. So some element triggers a click on this element and it's not supposed to do that.
      const that = this, el = that.form.children().eq(0), target = $(e.currentTarget);
      if (target.is(':hidden')) return true;
      if (el.hasClass(CSSCLS.SMFILTERVISIBLE)) {
        //remove body loading
        $('body').removeClass(that.Utils.CSSCLS.BODYLOADING);
        el.removeClass(CSSCLS.SMFILTERVISIBLE);
      } else {
        //add body loading
        $('body').addClass(that.Utils.CSSCLS.BODYLOADING);
        el.addClass(CSSCLS.SMFILTERVISIBLE);
      }
      return true;
    }
    /**
     * Toggles the hotel button for the filters and with it the hotel rendering for the map view.
     * @param {$.object} e: jQuery event object.
     */
    toggleHotels(e) {
      const that = this, target = $(e.currentTarget);
      if (target.hasClass(CSSCLS.BUTTONSWITCHACTIVE)) {
        utils.state.hotelsActive = false;
        that.MapVenue.toggleHotels(false);
        target.removeClass(CSSCLS.BUTTONSWITCHACTIVE);
        that.hotelFiltersToggleBaseEl.parent().next().find(`.${CSSCLS.FILTERCOLBOX}`).addClass(CSSCLS.FILTERCOLBOXDISABLED);
        filters.resetHotels();
        if (VFFilterResultViewType.types().MAP) {
          if ($(that.hotelFiltersToggleBaseEl).attr('aria-expanded') === 'true') {
            that.hotelFiltersToggleBaseEl.trigger('click');
          }
          $(that.hotelFiltersToggleBaseEl).addClass(CSSCLS.FILTERROWTOGGLEDISABLED);
        }
        $(`.${CSSCLS.HOTELSWITCHCOL}`).find(`.${CSSCLS.BUTTONSWITCH}`).blur();
      } else {
        utils.state.hotelsActive = true;
        that.MapVenue.toggleHotels(true);
        target.addClass(CSSCLS.BUTTONSWITCHACTIVE);
        that.hotelFiltersToggleBaseEl.parent().next().find(`.${CSSCLS.FILTERCOLBOX}`).removeClass(CSSCLS.FILTERCOLBOXDISABLED);
        //enable the hotels on the map
        filters.filterHotels();
        that.switchViewTypeTo(VFFilterResultViewType.types().MAP);
        $(that.hotelFiltersToggleBaseEl).removeClass(CSSCLS.FILTERROWTOGGLEDISABLED);
        $(`.${CSSCLS.VIEWSWITCHER}`).find('.gtc-filter__srh-btn').blur();
      }
    }
    /**
     * Initilizes the toggle controls.
     */
    initToggles() {
      const that = this;
      utils.toggleOptions.BEM = that.BEM;
      utils.toggleOptions.GROUP = that;
      //initiliaze the toggle controls.
      utils.toggleOptions.SEL = that.TOGGLESELECTOR + ':first';
      that.moreFiltersToggle = new that.Toggle(utils.toggleOptions);
      utils.toggleOptions.SEL = that.TOGGLESELECTOR + ':last';
      that.hotelFiltersToggleBaseEl = $(`.${utils.toggleOptions.SEL}`);
      that.hotelFiltersToggle = new that.Toggle(utils.toggleOptions);
    }
    /**
     * Initializes the filter sliders, so they are ready for events to be added.
     */
    initSliders() {
      const that = this;
      that.sliders = that.form.find(that.SLIDERSELECTOR);
      if (that.sliders.length) {
        for (let i = 0, iLen = that.sliders.length; i < iLen; ++i) {
          //the slider that supports both square ft. and square meters
          if ($(that.sliders[i]).children().last().prop('id') === utils.state.spaceSliderId) {
            initSpaceSlider(false, VenueFinderListUnit.types().SQMETER, $(that.sliders[i]).children().last(), that);
            continue;
          }
          //all other sliders
          const bar = $(that.sliders[i]).children().last(), baseVals = bar.data('values').split(';'),
            opts = $.extend(true, {}, utils.sliderOptions, {
              min: parseInt(bar.data('min')) || utils.sliderOptions.min,
              max: bar.data('has-max-display').toLowerCase() === 'true' ? parseInt(bar.data('max-display-value')) || utils.sliderOptions.max : parseInt(bar.data('max')) || utils.sliderOptions.max,
              step: bar.data('steps') || utils.sliderOptions.steps,
              slide: sliderUpdateValues,
              change: sliderChange,
              values: [parseInt(baseVals[0]), parseInt(baseVals[1])]
            });
          //validate steps
          if (opts.max % opts.step !== 0 || opts.min % opts.step !== 0) opts.step = 1;
          bar.slider(opts);
          sliderUpdateValues({ target: bar }, { values: opts.values });
        }
      }
    }
    /**
     * @returns {int<VenueFinderListUnit.types()>}: The currently active unit type.
     */
    currentUnitType() { return utils.state.activeUnitType; }
    /**
     * Sets the filter change state.
     * @param {bool} reset: (Optional) Whether or not the filter changed value should be reset.
     * @param {bool} setPage. (Optional) Whether or not the page should be set (default: true).
     */
    filterChanged(reset, setPage) {
      const that = this;
      if (reset === true) utils.state.filterChanged = false;
      else utils.state.filterChanged = true;
      if (setPage !== false && reset !== true) that.page(true, true);
    }
    /**
     * Sets the hotel filter change state.
     * @param {bool} reset: (Optional) Whether or not the filter changed value should be reset.
     */
    filterChangedHotel(reset) {
      if (reset === true) utils.state.filterChangedHotel = false;
      else utils.state.filterChangedHotel = true;
    }
    /**
     * Attempts to find the label for the given unit type.
     * @param {int<VenueFinderListUnit.types()>} unitType: Unit Type to get the label for.
     * @returns {string}: The label or "";
     */
    labelForUnit(unitType) {
      switch (unitType) {
        case VenueFinderListUnit.types().SQFEET:
        case VenueFinderListUnit.types().SQMETER:
          return utils.state.labels[unitType] && utils.state.labels[unitType].length ? utils.state.labels[unitType] : '';
        default:
          return '';
      }
    }
    /**
     * Returns the detail url parameter.
     * @returns {string}: The detail url parameter set to be appended to list requests values.
     */
    detailUrlParam() { return utils.state.listViewDetailurlParam; }
    /**
     * Returns the Hotel superiority indicator.
     * @returns {string}: The hotel item superiority indicator for the star display.
     */
    superiorityIndicator() { return utils.state.ratingSuperiorityInd[0]; }
    /**
     * Updates the shortlist item count in the header with the currently selected items.
     * @param {string} [id=null] of the shortlist to update the count for. If none is given, the default cookie id will be used.
     */
    updateShortlistItemCount(id = null) {
      const that = this;
      let shortlistId;
      if (id === null) {
        shortlistId = that.Utils.cookie.getCookie(utils.state.shortlistCookie);
        if (!shortlistId) return;
        else shortlistId = shortlistId[0].split(';')[0];
        shortlistId = shortlistId.substring(shortlistId.indexOf('=') + 1, shortlistId.indexOf('&'));
      } else shortlistId = id;
      //check if we are a count type button at all and update if so
      if (!that.shortListLinkBtn.hasClass(CSSCLS.COUNTBTN) && utils.state.isVenueFinder) {
        that.shortListLinkBtn.addClass(CSSCLS.COUNTBTN);
        that.shortListLinkBtn.append('<span class="' + CSSCLS.COUNTBTNCOUNT + '">(0)</span>');
      }
      that.Utils.request.postJSON({
        data: { shortlistId: shortlistId },
        url: that.Utils.urls.queryShortListItemCount(),
        onDone: (data) => { if (utils.state.isVenueFinder) that.shortListLinkBtn.children().last().text(`(${data.itemCount})`); },
        onFail: () => {
          if (utils.state.isVenueFinder && that.shortListLinkBtn.children().last().text() === '(1)') that.shortListLinkBtn.children().last().text('(0)');
        }
      });
    }
    /**
     * Removes the data item from the list and updates the subscribers.To be used on the shortlist page only.
     * @param {string} id Item id.
     */
    removeShortlistItemWith(id) {
      const that = this;
      if (!id || typeof id !== 'string' || !id.length || !that.Shortlist.isInit()) return;
      if (utils.state.venueData.data && utils.state.venueData.data.length) for (let i = utils.state.venueData.data.length - 1; i > -1; --i) {
        if (utils.state.venueData.data[i].ItemId === id && !utils.state.venueData.data[i].isShortListed) {
          utils.state.venueData.data.splice(i, 1);
          utils.state.venueData.total -= 1;

          break;
        }
      }
      if (utils.state.hotelData.data && utils.state.hotelData.data.length) for (let i = utils.state.hotelData.data.length - 1; i > -1; --i) {
        if (utils.state.hotelData.data[i].ItemId === id && !utils.state.hotelData.data[i].isShortListed) {
          utils.state.hotelData.data.splice(i, 1);
          utils.state.hotelData.total -= 1;
          break;
        }
      }
      that.updateSubScribers(VenueFilterSub.types().REQSTARTED);
      that.updateSubScribers(VenueFilterSub.types().REQENDED);
      that.updateSubScribers(VenueFilterSub.types().VENUES);
      that.updateSubScribers(VenueFilterSub.types().HOTELS);

      that.updateResultCount();
    }
    /**
     * Attemsps to return the item with the given id or null.
     * @param {string} id Item id.
     * @returns {object} data item or null.
     */
    getDataItemWith(id) {
      const that = this;
      if (!id || typeof id !== 'string' || !id.length) return null;
      if (utils.state.venueData.data && utils.state.venueData.data.length) for (let i = utils.state.venueData.data.length - 1; i > -1; --i) {
        if (utils.state.venueData.data[i].ItemId === id) return utils.state.venueData.data[i];
      }
      if (utils.state.hotelData.data && utils.state.hotelData.data.length) for (let i = utils.state.hotelData.data.length - 1; i > -1; --i) {
        if (utils.state.hotelData.data[i].ItemId === id) return utils.state.hotelData.data[i];
      }
      return null;
    }
    /**
     * Updates the items shortlist state in the list and updates all subscribers accordingly.
     * @param {string} id Item id.
     * @param {bool} newState Shortlisted state of the item.
     */
    updateShortlistStateForItemWith(id, newState) {
      const that = this;
      if (utils.state.venueData.data && utils.state.venueData.data.length) for (let i = utils.state.venueData.data.length - 1; i > -1; --i) {
        if (utils.state.venueData.data[i].ItemId === id) {
          utils.state.venueData.data[i].IsShortListed = newState === true ? true : false;
          break;
        }
      }
      if (utils.state.hotelData.data && utils.state.hotelData.data.length) for (let i = utils.state.hotelData.data.length - 1; i > -1; --i) {
        if (utils.state.hotelData.data[i].ItemId === id) {
          utils.state.hotelData.data[i].IsShortListed = newState === true ? true : false;
          break;
        }
      }
    }
    /**
     * Udpdates all active subscribers of the given type.
     * @param {int<VenueFilterSub.types()>} type The type of subscriptions to update.
     * @param {string} [id=null] Limit the update to a single subscription id.
     */
    updateSubScribers(type, id) {
      if (utils.state.subscriptions && utils.state.subscriptions.size) {
        const it = utils.state.subscriptions.values(),
          data = type === VenueFilterSub.types().HOTELS ? utils.state.hotelData : utils.state.venueData,
          age = type === VenueFilterSub.types().HOTELS ? utils.state.hotelData.age : utils.state.venueData.age;
        let val;
        if (id && id.length) {
          if (utils.state.subscriptions.has(id)) {
            val = utils.state.subscriptions.get(id);
            //Update the data only of the subscriber isn't up to date already
            if (val.type === type) {
              if (!val.isDataSub) val.cb.apply(val.cbRef);
              else if ((val.age == null || age > val.age)) {
                val.cb.apply(val.cbRef, [data]);
                val.age = age;
              }
            }
          }
        } else {
          while ((val = it.next().value) && val) {
            if (val.type !== type) continue;
            //Update the data only of the subscriber isn't up to date already
            if (!val.isDataSub) val.cb.apply(val.cbRef);
            else if (val.age == null || age > val.age) {
              val.cb.apply(val.cbRef, [data]);
              val.age = age;
            }
          }
        }
      }
    }
    /**
     * Subscribes to the filter service for returning the data, once and update occurs.
     * @param {int<VenueFilterSub.types()>} to: The type of the filter to subscribe to.
     * @param {function} cb: Callback to be called.
     * @param {obejct} cbbRef: Reference used as "this" pointer when invoking the callback.
     * @param {bool} directUpdate: Whether or not the subscriber should be updated directly after creation. Applies for data subscriptions only.
     * @returns {string}: The Pseudo-Unique Subscription id.
     */
    subscribe(to, cb, cbRef, directUpdate) {
      var that = this;
      if (!utils.state.subscriptions || !utils.state.subscriptions.size) utils.state.subscriptions = new Map();
      const nSub = new VenueFilterSub(to, cb, cbRef);
      if (!utils.state.subscriptions.has(nSub.id)) utils.state.subscriptions.set(nSub.id, nSub);
      else throw new Error('Subscription already present or random number generator failed.');
      //Update directly
      if (directUpdate && nSub.isDataSub) that.updateSubScribers(nSub.type, nSub.id);
      return nSub.id;
    }
    /**
     * Unsubscribe from the filter service.
     * @param {string} id: The Pseudo-Unique Subscription id.
     * @returns {bool} Whether or not unsubscribing was successful.
     */
    unsubscribe(id) {
      if (id && id.length && utils.state.subscriptions && utils.state.subscriptions.size && utils.state.subscriptions.has(id)) {
        utils.state.subscriptions.delete(id);
        return true;
      }
      return false;
    }
    //#region Initialization
    /**
     * Adds a venue finder specific body class.
     */
    addBodyClass() {
      $('body').addClass(CSSCLS.VENUEBODY);
    }
    /**
     * Initializes the filters base functionality.
     */
    init() {
      const that = this;
      that.Utils.Debug(false, 'VenueFilters: init');
      //set state
      utils.state.isVenueFinder = !that.form.hasClass(CSSCLS.SHORTLISTFORM);
      utils.state.isShortlist = !utils.state.isVenueFinder;
      utils.state.filterChanged = utils.state.filterChangedHotel = true;
      utils.state.initialRequest = utils.state.initialRequestHotel = true;
      utils.state.filterResultViewType = null;
      utils.state.hotelsActive = false;
      utils.state.activeUnitType = VenueFinderListUnit.types().SQMETER;
      //init unit labels
      utils.state.labels[VenueFinderListUnit.types().SQMETER] = that.form.data('label-unit-sqm');
      utils.state.labels[VenueFinderListUnit.types().SQFEET] = that.form.data('label-unit-sqft');
      //initialize the elements
      that.updateResultCount();
      that.filterButton = $(that.FILTERBTNSEL);
      that.shortListLinkBtn = $(`.${CSSCLS.SHORTLISTLINKBTN.replace(' ', ' .')}`);
      that.filterChanged(true);
      that.initToggles();
      if (utils.state.isVenueFinder) {
        that.initSliders();
      }
      //initialize the event handlers
      that.addEventListeners();
      that.renderInitialContent();
      //wait until we are ready
      $(window).on(`${that.Utils.NS}::VenueFilters::ready`, () => {
        that.switchViewTypeTo(VFFilterResultViewType.types().LIST);
      });
    }
    run() {
      const that = this;
      that.Utils.Debug(false, 'VenueFilters: run');
      //initialize only if we are in need of it
      that.form = $(that.FOMRSELECTOR);
      if (that.form.length) {
        that.addBodyClass();
        that.init();
      }
    }
  }
  //#endregion
  //#endregion
  //#region init
  filters = new VenueFilters();
  return filters;
  //#endregion
}());
