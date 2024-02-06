/* global App */

'use strict';

App.prototype.ScrollToForm = (function () {
  /**
   * Javascript component to make browser scroll to form being filled.
   * @class ScrollToForm
   * @category Component
   * @extends App
   * */
  class ScrollToForm extends App {
    constructor() {
      super();
      this.FORM_SELECTOR = '#gtcForms';
      this.launch = this.run();
    }

    run() {
      this.Utils.Debug(false, 'ScrollToForm: run');

      const $form = this.$(this.FORM_SELECTOR + ' form');
      $form.attr('action', $form.attr('action') + this.FORM_SELECTOR);
    }
  }

  return new ScrollToForm();
})();
