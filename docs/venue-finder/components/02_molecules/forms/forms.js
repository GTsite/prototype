/* eslint-disable no-empty*/

App.prototype.WebForms = (function () {
  'use strict';

  //#region Props
  const CSSCLS = {
    SUBMITBUTTON: 'gtc-form-submit'
  };
  // ReSharper disable once JoinDeclarationAndInitializerJs
  let webforms;
  //#endregion
  //#region Private
  /**
   * Handles the general form submit for the WFFM webforms at this point.
   * @param {$.event} e jQuery event object.
   */
  function handleFormSubmit(e) {
    const target = $(e.target),
      form = target.parents('form').first();
    if (target.length) {
      //if we are the shortlist form, call the related method otherwist just trigger submit on the form
      if (webforms.Shortlist.isShortlist(form)) webforms.Shortlist.triggerSubmit(form, target);
      else form.submit();
    }
  }
  /**
   * Sets the transform:scale values for the given element based on this elements child width in relation to this element.
   * @param {$.object} element ReCaptcha wrap to scale.
   * @param {object} that Context reference.
   */
  function scaleRecaptCha(element, that) {
    const child = element.children().eq(0);
    child.css('transform', '');
    if (element.width() < child.width()) {
      child.addClass(that.RECAPCSSSCALING);
      const scaleString = `scale(${(element.width() / child.width()).toFixed(2)})`;
      child.css('transform', scaleString);
    } else child.removeClass(that.RECAPCSSSCALING);
  }
  //#endregion
  //#region Publics
  /**
   * @class  : Provides additonal functionality for the WebForm forms.
   * @extends App
   */
  class WebForms extends App {
    constructor() {
      super();
      this.RECAPCSS = '.g-recaptcha--plch';
      this.RECAPCSSSCALING = 'g-recaptcha__scale';
      this.expression = 'recaptcha';
      this.launch = this.run();
      this.captchas = null;
    }
    /**
     * Returns the props for the random number generator used for the reCaptcha ids.
     */
    random() {
      return {
        min: 1,
        max: 1024
      };
    }
    /**
     * Adds the neccessary event handlers for the forms.
     */
    addEventHandler() {
      const submits = $(`.${CSSCLS.SUBMITBUTTON}`);
      if (submits.length) submits.on('click touchstart', handleFormSubmit);
    }
    /**
     * Adds the present captchas to the internal list and assigns a pseudo-unique Id to them.
     */
    manipulateCaptchas() {
      const that = this, captchas = $(that.RECAPCSS);
      if (captchas.length) {
        for (let i = 0, iLen = captchas.length; i < iLen; ++i) captchas.eq(i).prop('id', new Date().getTime() + '_' + (Math.random() * ((that.random().max - that.random().min) + that.random().min)));
        that.captchas = captchas;
      } else that.captchas = null;
    }
    /**
     * Initializes the previously discovered reCaptcha instances based on the options present.
     * If the language is not defined, the first browser language will be used.
     */
    initializeCaptchas() {
      const that = this, grecaptcha = window.grecaptcha || null;
      that.manipulateCaptchas();
      if (that.captchas && that.captchas.length && grecaptcha) {
        $.each(that.captchas, function () {
          const curCap = $(this);
          let lang = curCap.parent().data('req-lang');
          if (!lang || !lang.length) lang = navigator.languages ? navigator.languages[0] : navigator.language;
          grecaptcha.render(curCap.prop('id'), {
            sitekey: curCap.parent().data('sitekey'),
            theme: curCap.parent().data('theme'),
            type: curCap.parent().data('type'),
            hl: lang
          });
          scaleRecaptCha(curCap, that);
        });
        //scale handler for window resize
        $(window).resize(() => { $.each(that.captchas, function () { scaleRecaptCha($(this), that); }); });
      } else if (!grecaptcha) that.Utils.Debug(false, 'Google Scripts not loaded.');
    }
    /**
     * Functions executed on document.ready.
     */
    run() {
      var that = this;
      that.Utils.Debug(false, 'WebForms: run');
      that.addEventHandler();
    }
  }
  //#endregion
  //#region init
  webforms = new WebForms();
  return webforms;
  //#endregion
}());

/**
 * Calls the initializer of the Captcha elements, once the google script finished loading.
 */
function onloadCallback(context) {  // eslint-disable-line
  const gtc = window.GTC || {};
  if (!gtc.Utils || !gtc.WebForms) window.setTimeout(onloadCallback, 250);
  else {
    try {
      gtc.Utils.Debug(false, 'WebForms: init call from google');
      gtc.WebForms.initializeCaptchas(context);
    } catch (e) { }
  }
}