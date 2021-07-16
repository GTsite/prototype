'use strict';

/**
 * How to:
 * Every Component pushes an init function to the GTC.launch Attribute.
 * If a component does not need to be initialized, it can ignore this task.
 */
const GTC = new App();
window.GTC = GTC;
document.addEventListener('DOMContentLoaded', function () { GTC.initializeInstance(); });