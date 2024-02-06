/* global App */

'use strict';

App.prototype.GoogleEvents = (function () {
  /**
   * Javascript component for tracking events in Google Analytics.
   * @class GoogleEvents
   * @category Component
   * @extends App
   * */
  class GoogleEvents extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.launch = this.run();
    }

    static getSocialMediaName($item) {
      let socialMedia;
      if ($item.hasClass('facebook')) {
        socialMedia = 'Facebook';
      } else if ($item.hasClass('twitter')) {
        socialMedia = 'Twitter';
      } else if ($item.hasClass('gplus')) {
        socialMedia = 'Google Plus';
      } else if ($item.hasClass('whatsapp')) {
        socialMedia = 'WhatsApp';
      } else if ($item.hasClass('email')) {
        socialMedia = 'Email';
      }
      return socialMedia;
    }

    /**
     * Sends google analicts event requests via the API.
     * @param {string} eventName Name of the event to be send.
     * @param {string} variableName Variable name to be send.
     * @param {string} value Variable value to be send.
     */
    sendGoogeAnalyticsRequest(eventName, variableName, value) {
      try {
        ga('send', 'event', eventName, variableName, value);
      } catch (e) {
        //silent fail google analytics errors
      }
    }

    run() {
      /* global ga */
      this.Utils.Debug(false, 'GoogleEvents: run');

      // Track share events for videos
      this.$('.gtc-block--video__share a').on('click', function () {
        const $btn = $(this);
        const socialMedia = GoogleEvents.getSocialMediaName($btn);
        const videoTitle = $btn.closest('.gtc-block--video__share').data('title');
        ga('send', 'event', 'Video', 'Share - ' + socialMedia, videoTitle);
      });

      // Track share events for quotes
      this.$('.gtc-one-quotes__share a').on('click', function () {
        const $btn = $(this);
        const socialMedia = GoogleEvents.getSocialMediaName($btn);
        const quoteId = $btn.closest('.gtc-one-quotes__lightbox').data('id');
        ga('send', 'event', 'Quote', 'Share - ' + socialMedia, quoteId);
      });

      // Track share events for quotes - copy link
      this.$('.gtc-one-quotes__copy').on('click', function () {
        const $btn = $(this);
        const quoteId = $btn.closest('.gtc-one-quotes__lightbox').data('id');
        ga('send', 'event', 'Quote', 'Share - Copy Link', quoteId);
      });

      // Track click events for link blocks
      this.$('.gtc-block--link a').on('click', function () {
        const $btn = $(this);
        const linkTitle = $btn.attr('title');
        ga('send', 'event', 'Link Block', 'Click', linkTitle, { transport: 'beacon' });
      });
    }
  }

  return new GoogleEvents();
}());
