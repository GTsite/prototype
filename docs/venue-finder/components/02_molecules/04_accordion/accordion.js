/* global App */

'use strict';

App.prototype.Accordion = (function () {
  class Accordion extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.BEM = `${this.CSS_NSP}accordion`;
      this.TOGGLE = this.BEM + '__toggle';
      this.GROUP_EXCLUDE_ITEM = this.BEM + '__group-exclude-item';
      this.launch = this.run();
    }

    run() {
      this.Utils.Debug(false, 'Accordion: run');

      const accordion = new this.Toggle({ // eslint-disable-line no-unused-vars
        BEM: this.BEM,
        SEL: this.TOGGLE,
        TOGGLE_ANIM: 'slide',
        GROUP: true,
        GROUP_EXCLUDE_ITEM: this.GROUP_EXCLUDE_ITEM,
        SELF_CLOSING: true
      });
    }
  }

  return new Accordion();
}());
