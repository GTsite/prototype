/* eslint-disable newline-per-chained-call */

function ajaxFormSubmit(form) {
  var $form = $(form);
  var options = {
    url: $form.attr('action'),
    type: $form.attr('method'),
    data: $form.serialize()
  };
  jQuery(function ($) {
    var $resultContainer = $($form.attr('data-form-target'));
    $.ajax(options).done(function () {
      $resultContainer.empty();
    });
  });
  return false;
}

App.prototype.Filters = (function () {
  'use strict';

  /**
   * @class Filters
   * @classdesc: Provides filter functionality for the Event, Attraction and  (old) venue finder page.
   * @extends App
   */
  class Filters extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}filter`;
      //CSS Selector and class stuff
      this.AJAXFILTERS = `${this.JS_NSP}${this.BEM}__ajax`;
      this.FILTERCATEGORYSTORE = this.JS_NSP + this.BEM + '__filter-cat-store';
      this.FILTERITEMACTIVE = `${this.JS_NSP}${this.BEM}__item-active`;
      this.JSBUTTONS = `${this.JS_NSP}${this.CSS_NSP}btn`;
      this.JSDATEPICKER = `${this.JS_NSP}${this.CSS_NSP}datepicker`;
      this.JSFILTERITEMSELECTOR = `${this.JS_NSP}${this.BEM}__item`;
      this.MOREFILTERSSELECTOR = `${this.JS_NSP}${this.BEM}__item-link-toggle`;
      this.SEARCHSELECTOR = `${this.JS_NSP}${this.BEM}__srh-btn .${this.BEM}__srh-btn`;
      this.SELECTOR = this.BEM + '__item-link';
      this.TEXTSEARCH = `${this.JS_NSP}${this.BEM}__search`;
      this.TOGGLE = `${this.JS_NSP}${this.SELECTOR}-toggle`;
      //Other props
      this.formSelector = '#autogrid-form';
      this.pageInputSel = 'input#Page';
      this.dateSelector = '#filter-date-{0}';
      this.resultContainerSel = 'article[class^="gtc-block gtc-block--"]';
      this.dateFrom = null;
      this.dateTo = null;
      //launch prop
      this.launch = this.run();
    }

    filters(ev) {
      const that = this;
      const evtTarget = that.$(ev.currentTarget);
      const currentValue = evtTarget.data('ajax-value');
      //Items that also contain the value manipulated here
      const itemsWithValue = $(`[data-ajax-value='${currentValue}']`);
      //if there is no current value, we got the toggle element.
      // get the current listItem
      const $listItem = evtTarget.closest('li');
      // gets all links within the current section
      const $sectionLinks = evtTarget.closest('div').find('li');
      // initialize category fields
      const sectionCategories = [];
      const today = 'section.content.today';
      // reset page to 1
      that.$form.find(that.pageInputSel).val('1');

      if ($listItem.length) {
        //modify the selected value(s)
        if ($listItem.hasClass(that.FILTERITEMACTIVE)) {
          itemsWithValue.each(function () {
            const item = $(this);
            that.storeData(item, 'ajax-selected', false);
            item.closest('li').removeClass(that.FILTERITEMACTIVE);
          });
        } else {
          itemsWithValue.each(function () {
            const item = $(this);
            that.storeData(item, 'ajax-selected', true);
            item.closest('li').addClass(that.FILTERITEMACTIVE);
          });
        }

        if ($(evtTarget).attr('data-part') === today) {
          // check if today filter was clicked
          if ($listItem.hasClass(that.FILTERITEMACTIVE)) {
            that.dateFrom.val($(evtTarget).attr('data-ajax-value'));
            that.dateTo.val($(evtTarget).attr('data-ajax-value'));
          } else {
            that.dateFrom.val('');
            that.dateTo.val('');
          }
          that.submitForm();
          return;
        } else if ($(evtTarget).attr('data-ajax-value') === 'clear') {
          // check if clear button was pushed and clear ALL selected links if so
          // removes values for all selected links
          that.$allLinks.each(function () {
            const item = $(this);
            that.storeData(item, 'ajax-selected', false);
            item.closest('li').removeClass(that.FILTERITEMACTIVE);
          });
          // remove value from input field
          const textInput = that.$form.find(`.${that.TEXTSEARCH}`).val('');
          that.updateTextFilterValue(textInput);
          // remove value from datepicker fields
          that.$form.find(that.JSDATEPICKER).val('');
          // remove stored values from category input fields
          that.$form.find(`.${that.FILTERCATEGORYSTORE}`).val('');
          $(evtTarget).closest('li').removeClass(that.FILTERITEMACTIVE);
        } else {
          $sectionLinks.each(function () {
            const link = $(this).find(`.${that.JSFILTERITEMSELECTOR}`).first();
            if (link.data('ajax-selected') && link.data('part') !== today) sectionCategories.push(link.attr('data-ajax-value'));
          });
        }
      } else if (that.hasTextFilterChanged(ev)) {
        that.storeData(evtTarget, 'ajax-selected', true);
        that.updateTextFilterValue(evtTarget);
      } else {
        GTC.Utils.Debug(true, 'GTC::Filters.filter: Filtering was trigged but no filter was recognized');
        return;
      }
      //find the corresponding input field(s) and set selected values
      if (!itemsWithValue.length) {
        evtTarget.closest('div').find(`.${that.FILTERCATEGORYSTORE}`).first().val(sectionCategories);
      } else {
        itemsWithValue.each(function () {
          $(this).closest('div').find(`.${that.FILTERCATEGORYSTORE}`).first().val(sectionCategories);
        });
      }
      that.submitForm();
      ev.preventDefault();
      ev.stopPropagation();
    }
    /**
     * Submits the form.
     */
    submitForm() {
      const that = this;
      const form = that.$form;
      var $resultContainer = $(that.resultContainerSel).parent();
      $.ajax({
        url: form.attr('action'),
        type: form.attr('method'),
        data: form.serialize(),
        success: function (data) {
          const $html = $(data);
          $resultContainer.empty();
          const hasResults = $html.filter('article').length >= 1;
          if (hasResults) {
            $resultContainer = $(form).parent().parent().find('.gtc-section__blocks')
              .first();
            $resultContainer.append($html);
            if (!$('div.alert.alert-success').hasClass('hidden')) {
              $('div.alert.alert-success').addClass('hidden');
            }
          } else {
            $('div.alert.alert-success').removeClass('hidden');
          }
        },
        error: function (e) { GTC.Utils.Debug(true, 'Error when filtering stuff.', e); }
      });
      return false;
    }
    /**
     * Sets the given data as data element and attribute value.
     * @param {$.object} $element: jQuery object,
     * @param {string} key: key to store data for.
     * @param {string|int|float|bool} value: Value to store.
     */
    storeData($element, key, value) {
      $element.data(key, value);
      $element.attr(`data-${key}`, value);
    }
    /**
     * Validates if the text filter changed since the last filter call.
     * @param {$.event} ev: jQuery Event object.
     * @return {bool}: Whether or not the filter changed.
     */
    hasTextFilterChanged(ev) {
      const ct = $(ev.currentTarget);
      if (ev && ct[0].tagName.toLowerCase() === 'input') {
        let val = ct.val();
        if (val) val = val.trim();
        if (ct.data('last-filter-value') !== val) return true;
      }
      return false;
    }
    /**
     * Updates the text filters last-filter-value with the new value based on it's content.
     * @param {$.element} input: jQuery element referenzing the text search box.
     */
    updateTextFilterValue(input) {
      const textSearch = input && input.length ? input : $(`.${this.TEXTSEARCH}`); //text search keydown
      let inputVal = textSearch.val();
      if (inputVal && inputVal.length) inputVal = inputVal.trim();
      textSearch.data('last-filter-value', inputVal);
    }
    /**
     * Handles the keydown events for the filter input element.
     * @param {$.event} ev: jQuery Event object.
     */
    filterOnKey(ev) {
      if (ev.type === 'keydown' && ev.keyCode === 13 && this.hasTextFilterChanged(ev)) this.filters(ev); //enter
    }
    /**
     * Adds the events for date filters.
     */
    addDatePickerEvents() {
      const that = this;
      that.dateFrom = $(that.dateSelector.replace('{0}', 'from'));
      that.dateTo = $(that.dateSelector.replace('{0}', 'to'));
      let bothThere = 0;
      /**
       * Binds the startDate datepicker eventhandlers.
       */
      const bindEvents = () => {
        that.dateFrom.datepicker('option', 'onSelect', function (dateText) {
          // reset 'today' option
          const $todayButton = $(`.${that.JSBUTTONS}[data-part="section.content.today"]`);
          if ($todayButton.closest('li').hasClass(that.FILTERITEMACTIVE)) {
            that.storeData($todayButton, 'ajax-selected', false);
            // remove 'active' class attribute
            $todayButton.closest('li').removeClass(that.FILTERITEMACTIVE);
          }

          that.dateFrom.val(dateText);
          const format = that.dateFrom.datepicker('option', 'dateFormat') || 'dd.mm.y';
          const currentDate = $.datepicker.parseDate(format, dateText);
          var nextDate = null;
          if (that.dateTo.val()) nextDate = $.datepicker.parseDate(that.dateTo.datepicker('option', 'dateFormat') || 'dd.mm.y', that.dateTo.val());
          if (nextDate !== null && nextDate < currentDate) {
            nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            that.dateTo.val($.datepicker.formatDate(format, nextDate));
          }
          setTimeout(() => { that.submitForm(); }, 100);
        });
        that.dateTo.datepicker('option', 'onSelect', function (dateText) {
          that.dateTo.val(dateText);
          const format = that.dateTo.datepicker('option', 'dateFormat') || 'dd.mm.y';
          const currentDate = $.datepicker.parseDate(format, dateText);
          var previousDate = null;
          if (that.dateFrom.val()) previousDate = $.datepicker.parseDate(that.dateFrom.datepicker('option', 'dateFormat') || 'dd.mm.y', that.dateFrom.val());
          if (previousDate == null || previousDate > currentDate) {
            previousDate = new Date();
            that.dateFrom.val($.datepicker.formatDate(format, previousDate));
          }
          setTimeout(function () { that.submitForm(); }, 100);
        });
      };
      /**
       * Checks whether or not both elements are loaded.
       */
      const checkEventLoading = () => { if (bothThere >= 2) bindEvents(); };
      //bind events
      if (that.dateFrom.length && that.dateTo.length) {
        if (that.dateFrom.data('datepicker')) {
          bothThere += 1;
          bindEvents();
          checkEventLoading();
        } else {
          that.dateFrom.on('gtc::datepickerbound', () => {
            bothThere += 1;
            checkEventLoading();
          });
        }
        //bind events
        if (that.dateTo.data('datepicker')) {
          bothThere += 1;
          bindEvents();
          checkEventLoading();
        } else {
          that.dateTo.on('gtc::datepickerbound', () => {
            bothThere += 1;
            checkEventLoading();
          });
        }
      }
    }
    addEventListeners() {
      var that = this;
      $(`.${that.SELECTOR}:not(.${that.MOREFILTERSSELECTOR})`).on('click', that.filters.bind(that));
      //Toggle more styling
      $(`.${that.TOGGLE}`).on('click', function () {
        window.setTimeout(() => {
          if ($(this).attr('aria-expanded') === 'true') $(this).parent().addClass(that.FILTERITEMACTIVE);
          else $(this).parent().removeClass(that.FILTERITEMACTIVE);
        }, 250);
      });
      //The search box is not supposed to trigger anything on its own.
      $(`.${that.SEARCHSELECTOR}`).on('click', function () {
        const e = $.Event('keydown');
        e.which = 13;
        e.keyCode = 13;
        $(`.${that.TEXTSEARCH}`).trigger(e);
      });
      $(`.${that.TEXTSEARCH}`).on('keydown', that.filterOnKey.bind(that)); //text search keydown
      window.setTimeout(() => {
        that.addDatePickerEvents();
      }, 2000);
    }
    /**
     * Initializes the filters base functionality.
     */
    init() {
      const that = this;
      that.Utils.Debug(false, 'Filters: init');
      that.$filters = $(`.${that.AJAXFILTERS}`);
      that.$allLinks = this.$filters.find(`.${that.JSFILTERITEMSELECTOR}`);
      //initialize form attributes
      ajaxFormSubmit(that.$form);
      //initialize the event handlers
      that.addEventListeners();
      //Initialize the more filters toggle
      const toggle = new that.Toggle({ // eslint-disable-line no-unused-vars
        BEM: that.BEM,
        SEL: that.TOGGLE,
        TOGGLE_ANIM: 'slide',
        PARENT: that.TOGGLE_PARENT,
        GROUP: that,
        SELF_CLOSING: true
      });
    }
    run() {
      const that = this;
      that.Utils.Debug(false, 'Filters: run');
      //initialize only if we are in need of it
      that.$form = $(that.formSelector);
      if (that.$form.length) that.init();
    }
  }

  return new Filters();
}());