/* global App */

'use strict';

App.prototype.Toggle = (function () {
  /**
 * Plugin handler for toggle-elements.
 * @class FloatTheads
 * @category Utils
 * @extends App
 * */
  class Toggle extends App {
    constructor(options = {}) {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.BEM = options.BEM || `${this.CSS_NSP}toggle`;
      this.SEL = options.SEL || this.BEM + '__toggle';
      this.CLOSER = options.CLOSER || this.BEM + '__closer';
      this.GROUP = options.GROUP || false;
      this.GROUP_CONTAINER = options.GROUP_CONTAINER || this.BEM + '__group';
      this.GROUP_EXCLUDE_ITEM = options.GROUP_EXCLUDE_ITEM || this.BEM + '__group-exclude-item';
      this.TOOGLE_TYPE = options.TOOGLE_TYPE || 'menu';
      this.TOGGLE_ANIM = options.TOGGLE_ANIM || false;
      this.PARENT_ANIM = options.PARENT_ANIM || false;
      this.PARENT = options.PARENT || this.BEM;
      this.GROUP_TRIGGER_WRAP = options.GROUP_TRIGGER_WRAP || false;
      this.TRIGGER_TOGGLE_STATE = options.TRIGGER_TOGGLE_STATE || false;
      this.SELF_CLOSING = options.SELF_CLOSING || false;
      this.ARIA_TRIGGER_ATTRIBUTE = this.Utils.AriaTriggerMenuAttribute;
      this.$SEL = this.$('.' + this.SEL);
      this.$CLOSER = this.$('.' + this.CLOSER);
      this.$PARENT = this.$('.' + this.PARENT);
      this.$GRTRWR = this.$('.' + this.GROUP_TRIGGER_WRAP);
      this.launch = this.run();
      this.$SCROLLEDEL = this.$('html,body');

      this.$SLID = `${this.CSS_NSP}slider`;
      this.SELECTOR = `${this.Utils.JsNsp}${this.$SLID}`;
      this.SLIDER_ARROW = `${this.$SLID}__arrow`;
      this.SLIDER_PREV = `${this.$SLID}__prev`;
      this.SLIDER_NEXT = `${this.$SLID}__next`;
      this.SLIDER_DOTS = `${this.$SLID}__dots slick-dots`;
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

    switchToggle(ev) {
      this.Utils.Debug(false, 'Toggle: switchToggle');
      ev.preventDefault();
      const trigger = ev.currentTarget;
      this.Utils.Target = this.$(trigger);
      const target = document.getElementById(this.Utils.Target);
      if (target) {
        const hidden = target.getAttribute('aria-hidden');
        if (hidden === 'true') {
          this.openToggle(trigger, target);
        } else if (hidden === 'false' && this.SELF_CLOSING) {
          this.closeToggle(trigger, target);
        }
      }
      return false;
    }

    resizeBoxDetail($boxDetails) {
      this.wItemH = $($boxDetails).parent('.smallBox').find('.full_height > .smallBox-detail').outerWidth();
      $($boxDetails).parent('.smallBox').find('.full_height > .smallBox-detail').css({ 'max-height': this.wItemH });
    }

    scrollToTheTarget($boxDetails) {
      const $scrolledEl = this.$SCROLLEDEL;
      const that = this;
      // we must close other opened blocks
      var $openedBlocks = $($boxDetails).parent().parent().parent()
        .parent()
        .find('article.open');
      var slideUp = $($openedBlocks).children('.gtc-block__detail').slideUp();
      var $aricle = $($boxDetails).parent().parent();
      $.when(slideUp).done(function () {
        $openedBlocks.removeClass('open');
        $openedBlocks.find('.gtc-block__detail').removeClass('open');

        $($boxDetails).slideDown(500);
        setTimeout(function () {
          $($scrolledEl).animate({ scrollTop: $($boxDetails).offset().top - 70 }, 500);
          that.resizeBoxDetail($boxDetails);
        }, 500);
      });

      $($aricle).addClass('open');
      $($aricle).find('.gtc-block__detail').eq(0).addClass('open');

      var $openLen = $('.open');
      if ($openLen.length >= 1) {
        $openedBlocks.children('.box_details').hide();
      }
    }

    scrollToTheTrigger($boxDetails) {
      const $scrolledEl = this.$SCROLLEDEL;
      const offsetTop = $($boxDetails).parent().offset().top - 70;
      if ($($boxDetails).length > 0) {
        $($boxDetails).parent().parent().removeClass('open');
        $($boxDetails).parent().find('.gtc-block__detail').removeClass('open');
        setTimeout(function () {
          $($scrolledEl).animate({ scrollTop: offsetTop }, 500);
        });
      }
      return $($boxDetails).slideUp();
    }

    openToggle(trigger, target) {
      this.$slider = this.$('.js-gtc-slider');
      this.Utils.Debug(false, 'Toggle: openToggle');
      const targetID = this.$(target).attr('id');
      const isBlockLink = $('.gtc-main').find(trigger).parent().find('*[data-ajax-action]').length > 0;
      const isMenuLink = $(trigger).hasClass('gtc-navigation-main__link');
      const $slider = $('.gtc-main').find(trigger).parent().find(this.$(`.${this.SELECTOR}`));
      const $sliderItems = $($slider).find('.gtc-gallery__item').length;
      if (this.GROUP) {
        this.closeOtherToggles(trigger);
      }

      if (this.PARENT_ANIM) {
        let toggleHeight = 0;
        if (this.GROUP_TRIGGER_WRAP) {
          toggleHeight = this.$GRTRWR.outerHeight(true) + this.$(target).outerHeight(true);
        } else {
          toggleHeight = this.$(trigger).outerHeight(true) + this.$(target).outerHeight(true);
        }

        this.animateParent(toggleHeight);
      }

      this.Utils.setAriaAttributeValue(trigger, this.ARIA_TRIGGER_ATTRIBUTE, 'true');

      if (this.TRIGGER_TOGGLE_STATE) {
        $(document).trigger(`toggleOpen.${targetID}`);
      }

      if (this.TOGGLE_ANIM === 'slide') {
        this.$(target)
          .stop()
          .slideDown({
            complete: () => {
              this.Utils.setAriaAttributeValue(target, 'aria-hidden', 'false');
              this.$(target).removeAttr('style');

              if (this.TRIGGER_TOGGLE_STATE) {
                $(document).trigger(`toggleOpend.${targetID}`);
              }
            }
          });
      } else if (this.TOGGLE_ANIM === 'fade') {
        this.$(target)
          .stop()
          .fadeIn({
            complete: () => {
              this.Utils.setAriaAttributeValue(target, 'aria-hidden', 'false');
              this.$(target).removeAttr('style');

              if (this.TRIGGER_TOGGLE_STATE) {
                $(document).trigger(`toggleOpend.${targetID}`);
              }
            }
          });
      } else {
        this.Utils.setAriaAttributeValue(target, 'aria-hidden', 'false');
      }

      if (isBlockLink) {
        if ($(trigger).parent().find('section.gtc-block__detail').length !== 0) {
          if (!$(trigger).hasClass('open')) {
            this.scrollToTheTarget(target);
          }
        }
      }
      if (isMenuLink) {
        this.scrollToTheTarget(target);
      }
      //We only ever wanna do this once!
      if ($slider.length > 0 && $sliderItems > 1 && !$slider.hasClass('slick-initialized')) this.initSlider($slider);
    }

    closeToggle(trigger, target) {
      this.Utils.Debug(false, 'Toggle: closeToggle');
      const targetID = this.$(target).attr('id');
      const isBlockLink = $('.gtc-main').find(trigger).parent().find('*[data-ajax-action]').length > 0;
      const isMenuLink = $(trigger).hasClass('gtc-navigation-main__link');

      if (this.PARENT_ANIM) {
        let toggleHeight = 0;

        if (this.GROUP_TRIGGER_WRAP) {
          toggleHeight = this.$GRTRWR.outerHeight(true);
        } else {
          toggleHeight = this.$(trigger).outerHeight(true);
        }

        this.Utils.Debug(false, toggleHeight);
        this.animateParent(toggleHeight);
      }

      this.Utils.setAriaAttributeValue(trigger, this.ARIA_TRIGGER_ATTRIBUTE, 'false');

      if (this.TRIGGER_TOGGLE_STATE) {
        $(document).trigger(`toggleClose.${targetID}`);
      }

      if (this.TOGGLE_ANIM === 'slide') {
        this.$(target)
          .stop()
          .slideUp({
            complete: () => {
              this.Utils.setAriaAttributeValue(target, 'aria-hidden', 'true');
              this.$(target).removeAttr('style');

              if (this.TRIGGER_TOGGLE_STATE) {
                $(document).trigger(`toggleClosed.${targetID}`);
              }
            }
          });
      } else if (this.TOGGLE_ANIM === 'fade') {
        this.Utils.setAriaAttributeValue(target, 'aria-hidden', 'true');

        if (this.TRIGGER_TOGGLE_STATE) {
          $(document).trigger(`toggleClosed.${targetID}`);
        }
      } else {
        this.Utils.setAriaAttributeValue(target, 'aria-hidden', 'true');
      }

      if (isBlockLink || isMenuLink) {
        if ($(trigger).parent().find('section.gtc-block__detail').length !== 0) {
          if ($(trigger).hasClass('open')) {
            this.scrollToTheTrigger(target);
          }
        }
      }
      if (isMenuLink) {
        this.scrollToTheTrigger(target);
      }
    }

    closeToggleByCloser(ev) {
      this.Utils.Debug(false, 'Toggle: closeToggleByCloser');
      ev.preventDefault();
      const closeTrigger = ev.currentTarget;
      this.Utils.Target = this.$(closeTrigger);
      const targetID = this.Utils.Target;
      const trigger = $('[aria-controls="' + targetID + '"]')[0] || this.$('[data-target="' + targetID + '"]')[0];
      const target = document.getElementById(targetID);
      this.closeToggle(trigger, target);
    }

    closeOtherToggles(trigger) {
      this.Utils.Debug(false, 'Toggle: closeOtherToggles');
      const $thisGroupContainer = $(trigger).closest('.' + this.GROUP_CONTAINER).eq(0);
      const $toggles = $thisGroupContainer.find('.' + this.SEL);
      const openToggles = $toggles.filter(`[${this.ARIA_TRIGGER_ATTRIBUTE} = "true"]`);
      this.Utils.Debug(false, trigger);
      this.Utils.Debug(false, this.GROUP_CONTAINER);
      this.Utils.Debug(false, $thisGroupContainer);
      this.Utils.Debug(false, $toggles);

      if (openToggles !== undefined) {
        this.Utils.Debug(false, openToggles);
        $.each(this.$(openToggles), (i) => {
          const $thisItem = this.$(this.$(openToggles)[i]);
          if (!$thisItem.hasClass(this.GROUP_EXCLUDE_ITEM)) {
            this.Utils.Target = $thisItem;
            const targetID = this.Utils.Target;
            const target = document.getElementById(targetID);
            this.closeToggle($thisItem[0], target);
          }
        });
      }
    }

    animateParent(toggleHeight) {
      this.Utils.Debug(false, 'Toggle: animateParent');
      this.$PARENT
        .stop()
        .animate({
          height: toggleHeight
        });
    }

    setAriaAttributes() {
      this.Utils.Debug(false, 'Toggle: setAriaAttributes');
      if (this.TOOGLE_TYPE === 'tab') {
        this.ARIA_TRIGGER_ATTRIBUTE = this.Utils.AriaTriggerTabAttribute;
      }
    }

    addEventListeners() {
      this.$(document).on('click.toggle', '.' + this.SEL, this.switchToggle.bind(this));
      if (this.$CLOSER !== '') {
        this.$(document).on('click.toggle', '.' + this.CLOSER, this.closeToggleByCloser.bind(this));
      }
    }

    run() {
      this.Utils.Debug(false, 'Toggle: run');
      this.setAriaAttributes();
      this.addEventListeners();
    }
  }

  return Toggle;
}());
