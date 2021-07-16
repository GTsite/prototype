/* global App */

'use strict';

App.prototype.Rooms = (function () {
  /**
   * Javascript component for Rooms elements.
   * @class Rooms
   * @category Component
   * @extends App
   * */
  class Rooms extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}rooms`;
      this.GALLERY_TRIGGER = `${this.JS_NSP}${this.BEM}-gallery`;
      this.LIGHTBOX_ITEM = `${this.BEM}__lightbox`;
      this.launch = this.run();
    }

    openLightbox(ev) {
      this.Utils.Debug(false, 'Rooms: openLightbox');
      ev.preventDefault();
      const trigger = ev.currentTarget;
      this.Utils.Target = window.jQuery(trigger);
      const target = document.getElementById(this.Utils.Target);
      this.Utils.Debug(false, $(target).find(`.${this.LIGHTBOX_ITEM}`).first());
      window.jQuery(target).find(`.${this.LIGHTBOX_ITEM}`).first().trigger('click');
    }

    addEventListeners() {
      window.jQuery(document).on('click', '.' + this.GALLERY_TRIGGER, this.openLightbox.bind(this));
    }

    run() {
      this.Utils.Debug(false, 'Rooms: run');
      this.addEventListeners();
    }
  }

  return new Rooms();
}());
