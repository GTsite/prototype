/* eslint-disable no-underscore-dangle, no-undef */
/**
 * Helper class for handling VenueFinderListUnits.
 */
export default class VenueFinderListUnit {
  constructor(type, symbol) {
    const that = this;
    that.type = type;
    that.symbol = symbol;
  }
  /**
   * The available unit types.
   * @returns {Object<int>}: Returns the static list of types available to the column rendering.
   */
  static types() {
    return {
      NONE: -1,
      SQMETER: 0,
      SQFEET: 1
    };
  }
}

// TODO refactor that
window.VenueFinderListUnit = VenueFinderListUnit;
