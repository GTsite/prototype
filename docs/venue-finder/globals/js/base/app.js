'use strict';

export default class App { // eslint-disable-line no-unused-vars
  constructor(packageversion = 'not assigned, pls check instantiation') {
    this.ver = packageversion;
    this.launchers = [];
    this.$ = $;
  }

  get version() {
    return this.ver;
  }

  set version(v) {
    this.ver = v;
  }

  get launch() {
    return this.launchers;
  }

  set launch(app) {
    this.launchers.push(app);
  }
  initializeInstance() {
    const that = this;
    if (that instanceof App) {
      let curApp;
      if ($.isArray(that.launch) && that.launch.length > 0) {
        for (let i = 0; i < that.launch.length; i += 1) {
          curApp = that.launch[i];
          if (typeof curApp === 'function') curApp();
        }
      }

      // Update version attribute on all modules:
      const modules = Object.keys(that.__proto__); // eslint-disable-line
      modules.forEach((item) => {
        that[item].version = that.version;
        that.Utils.fireReadyEvent = item;
      });

      // Log current GTC Prototype version
      that.Utils.Debug(false, that.version);

      that.Utils.initViewport();
    } else {
      // ReSharper disable once ExperimentalFeature
      throw Error('This method is sealed and the Error thrown because JS is shitty and  we all want a little reliability from time to time!');
    }
  }
}

// /* global $ */
// /**
//  * Super-Klasse für alle Javascript Komponenten.
//  * @author André Petrakow <andre.petrakow@init.de>
//  * @class App
//  * @property launch
//  * @property version
//  * @param {string} packageversion - Aktuelle Version des Prototyp-Pakets
//  * @example
//  * */
// class App { // eslint-disable-line no-unused-vars
//   constructor(packageversion = null) {
//     this.VERSION = packageversion;
//     this.LAUNCHERS = [];
//     this.$ = $;
//     if (this.VERSION !== null) {
//       this.launch = this.updateVersions;
//     }
//   }
//
//   /**
//    * Gibt die aktuelle Versionsnummer des Pakets aus.
//    * @returns {string}
//    * @example
//    *  GTC.version;
//    *  'YEAR.S.P'
//    *  // YEAR: Release Year | S: Sprint Counter | P: Patch Release
//    */
//   get version() {
//     return this.VERSION;
//   }
//
//   /**
//    * Setzt eine Versionsnummer.
//    * @param ver {string}
//    * @example
//    *   GTC.version = 'YEAR.S.P';
//    */
//   set version(ver) {
//     this.VERSION = ver;
//   }
//
//   /**
//    * Gibt die aktuelle Versionsnummer des Pakets aus.
//    * @deprecated
//    * @returns {string}
//    */
//   get ver() {
//     const { warn } = console;
//     warn('Property .ver is deprecated. Use .version instead.');
//     return this.version;
//   }
//
//   /**
//    * Setzt eine Versionsnummer.
//    * @param v {string}
//    * @deprecated
//    */
//   set ver(v) {
//     const { warn } = console;
//     warn('Property .ver is deprecated. Use .version instead.');
//     this.version = v;
//   }
//
//   /**
//    * Globales Array, das die Initialisierung auf dem document.ready Event übernimmt.
//    * @example
//    *  this.launch = this.functionName;
//    */
//   get launch() {
//     return this.LAUNCHERS;
//   }
//
//   set launch(func) {
//     this.LAUNCHERS.push(func);
//     this.$(document).ready(() => {
//       func.bind(this)();
//     });
//   }
//
//   /* todo: fix this method, it should update every component version, but doesn't do it...
//    * Aktualisiert die Version für alle eingebundenen Komponenten.
//    * @memberOf App
//    */
//   updateVersions() {
//     const components = Object.entries(Object.getPrototypeOf(this));
//     components.forEach((component) => {
//       const comp = component;
//       comp.version = this.VERSION;
//     });
//   }
//
//   static handsup(str = '') {
//     return `${str.length ? str + ', ' : str}¯\\_(ツ)_/¯`;
//   }
// }
