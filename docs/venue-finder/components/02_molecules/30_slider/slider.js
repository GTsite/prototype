/* global App */

'use strict';

App.prototype.Slider = (function () {
  /**
 * Javascript component for Slider elements.
 * @class Slider
 * @category Component
 * @extends App
 * */
  class Slider extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}slider`;
      this.SELECTOR = `${this.Utils.JsNsp}${this.BEM}`;
      this.SLIDER_ARROW = `${this.BEM}__arrow`;
      this.SLIDER_PREV = `${this.BEM}__prev`;
      this.SLIDER_NEXT = `${this.BEM}__next`;
      this.SLIDER_DOTS = `${this.BEM}__dots slick-dots`;
      this.SLICK_OPTIONS = {
        autoplay: false,
        slidesToScroll: 1,
        slidesToShow: 1,
        dots: true,
        dotsClass: this.SLIDER_DOTS,
        prevArrow: `<button class="gtc-btn ${this.SLIDER_ARROW} ${this.SLIDER_PREV}" aria-label="Previous" type="button">
                      <span class="gtc-btn__icon ${this.SLIDER_ARROW}-icon">
                        <svg viewBox="0 0 18 18" class="gtc-icon" width="18" height="18">
                          <use xlink:href="#icon-arrow-left"></use>
                        </svg>
                      </span>
                      <span class="gtc-sr-only">Previous</span>
                    </button>`,
        nextArrow: `<button class="gtc-btn ${this.SLIDER_ARROW} ${this.SLIDER_NEXT}" aria-label="Next" type="button">
                      <span class="gtc-btn__icon ${this.SLIDER_ARROW}-icon">
                        <svg viewBox="0 0 18 18" class="gtc-icon" width="18" height="18">
                          <use xlink:href="#icon-arrow-right"></use>
                        </svg>
                      </span>
                      <span class="gtc-sr-only">Next</span>
                    </button>`
      };
      this.launch = this.run();
    }

    get Opts() {
      return this.SLICK_OPTIONS;
    }

    set Opts(options) {
      this.SLICK_OPTIONS = options;
    }

    initSlider($el, setup = this.SLICK_OPTIONS) {
      this.Utils.Debug(false, 'Slider: initSlider');
      this.Opts = setup;
      $.each($el, (i, item) => {
        const $slider = this.$(item);
        $slider.slick(this.Opts);
      });
    }

    run() {
      this.Utils.Debug(false, 'Slider: run');
      const $slider = this.$(`.${this.SELECTOR}`);
      if ($slider.length > 0) {
        this.initSlider($slider);
      }
    }
  }

  return new Slider();
}());
