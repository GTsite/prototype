/* eslint-disable no-underscore-dangle, no-undef */
/**
 * @classdesc: Simple class for handling subscription realtions for the VenueFinder filters.
 */
export default class VenueFilterSub {
  /**
   * Gets the subscription types available.
   * @returns {object<int>} Subsciption types as int.
   */
  static types() {
    return {
      NONE: -1,
      VENUES: 0,
      HOTELS: 1,
      REQSTARTED: 2, //I didn't intend to overdo it for that simple purpose, so SUCCED and other conditions are simply represented by REQENDED.
      REQCANCELED: 3,
      REQENDED: 4
    };
  }
  /**
   * @class: Creates a new instance of the Subsciption class.
   * @param {int} type Valid subscription type.
   * @param {function} cb Callback to notify the subscriber.
   * @param {obejct} cbRef Reference used as "this" pointer when invoking the callback.
   * @returns {Obejct<VenueFilterSub>} New instance of the VenueFilterSub class.
   */
  constructor(type, cb, cbRef) {
    const that = this;
    //private
    that._type = null;
    that._isDataSub = null;
    //public
    that.age = null;
    that.type = type;
    that.id = new Date().getTime().toString() + GTC.Utils.randomNumber(1, Number.MAX_SAFE_INTEGER || 9007199254740).toString();
    that.cb = cb;
    that.cbRef = cbRef;
  }
  /***
   * Sets the type property.
   */
  set type(value) {
    switch (value) {
      case VenueFilterSub.types().VENUES:
      case VenueFilterSub.types().HOTELS:
      case VenueFilterSub.types().REQSTARTED:
      case VenueFilterSub.types().REQCANCELED:
      case VenueFilterSub.types().REQENDED:
        this._type = value;
        break;
      default:
        this._type = VenueFilterSub.types().NONE;
    }
  }
  /**
   * @returns {int}: type property.
   */
  get type() { return this._type; }
  /**
   * Gets the isDataSub property specifiying whether or not the current element is a data or event subscription.
   * @returns {bool} Whether the current element is a data or event subscription.
   */
  get isDataSub() {
    const that = this;
    if (that._isDataSub === null) that._isDataSub = this.type === VenueFilterSub.types().VENUES || this.type === VenueFilterSub.types().HOTELS;
    return that._isDataSub;
  }

  /***
   * Sets the callback property.
   * @param {function} Callback (cb) property.
   */
  set cb(value) {
    const that = this;
    if ($.isFunction(value)) that._cb = value;
    else throw new Error('ArgumentException: The value provided is not a function: VenueFilterSub::cb::set');
  }
  /**
   * Gets the callback property.
   * @returns {function} Callback (cb) property.
   */
  get cb() { return this._cb; }
}

// TODO refactor that
window.VenueFilterSub = VenueFilterSub;