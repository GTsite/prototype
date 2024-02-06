'use strict';

App.prototype.MapBase = (function () {
  /**
   * JavasScript component for handling the basic Access map views.
   * @class Map
   * @category Component
   * @extends App
   */
  class MapBase extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}map`;
      this.SELECTOR = `${this.Utils.JsNsp}${this.BEM}-canvas`;
      this.$CONTEXT = this.$(`.${this.CSS_NSP}main`);
    }

    /**
     * Initializes the maps present in the given context or the default content .gtc-main.
     * @param {$.object} context: (Optional) The context in which too look for map elements to be initialized (default: this.CONTEXT).
     */
    initMap(context = this.CONTEXT) {
      this.Utils.Debug(false, 'Map: initMap');
      const $el = this.$(`.${this.SELECTOR}`);
      this.CONTEXT = context;
      const google = window.google || {};

      $.each($(this.$CONTEXT).find($el), (i, item) => {
        const $map = this.$(item);

        if (!$map.hasClass('loaded')) {
          const lat = $map.attr('data-lat');
          const lng = $map.attr('data-lng');
          // this.Utils.Debug(lat);

          if (lat || lng) {
            const myLatlng = new google.maps.LatLng(lat, lng);
            const mapOptions = {
              zoom: 16,
              center: myLatlng
            };

            const map = new google.maps.Map($map.get(0), mapOptions);

            let mapInfo = '';
            if ($map.attr('data-src')) {
              mapInfo += '<img src=' + $map.attr('data-src') + ' alt=""/>';
              mapInfo += '<div class="mpaInfo"><h2>' + $map.attr('data-title') + '</h2>';
            }

            if ($map.attr('data-description')) {
              mapInfo += '<p>' + $map.attr('data-description') + '</p>';
            }

            if ($map.attr('data-href')) {
              mapInfo += '<a target="_blank" href=' + $map.attr('data-href') + '> + </a></div>';
            }

            const contentstring = mapInfo || $map.html();
            const infowindow = new google.maps.InfoWindow({
              content: contentstring,
              maxWidth: 300
            });

            const marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              title: $map.attr('data-title')
            });

            google.maps.event.addListener(marker, 'click', function () {
              infowindow.open(map, marker);
            });

            $map.addClass('loaded');
          }
        }
      });
    }
    run() {
      this.initMap();
    }
  }

  return new MapBase();
}());