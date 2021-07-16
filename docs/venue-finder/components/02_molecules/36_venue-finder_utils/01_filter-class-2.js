/* eslint-disable no-underscore-dangle, no-undef */
/**
 * @classdesc Helper class to store the Venue Finder Filter Result view types.
 */
export default class VFFilterResultViewType {
  /**
   * The available filter result view types.
   * @returns {Object<int>} Returns the static list of types available to the venue filter.
   */
  static types() {
    return {
      NONE: -1,
      LIST: 0,
      MAP: 1
    };
  }
}