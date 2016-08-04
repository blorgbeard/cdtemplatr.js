'use strict';

module.exports = function(username, ldapProfile) {
  return ldapProfile && {
    _id: username,
    username: username,
    displayName: ldapProfile.displayName,
    thumbnailPhoto: "data:image/jpeg;base64," + ldapProfile.thumbnailPhoto.toString("base64"),
    email: ldapProfile.mail,
    title: ldapProfile.title,
    cached: new Date()
  } || {
    _id: username,
    username: username,
    displayName: username,
    thumbnailPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAACJklEQVR42mL8//8/g4+HBwMyYGRiYmBiZlZiYmLKAHIl/zMwrP//9+/6/yDFSGDT1q0MAAHEwoAdJAPVTvz79y83lB/D8P//OqBYGJD9F1khQAAxgYj///8hY45///6W/P3zmxuIGeD475+gf3//lgNpBhgGAYAAArvgz18UQz0YGRg0cLgsG+iJaUD6A0wAIIDABvz78wdZkcF/BkYc+hn4gZgP2QCAAAIb8BfVBUDJ/7gM+AcM4t/IAgABBDEA1QWbgbgOaIYghnZGhiNA8jlyZAAEENiA79++MjAxMgGjj5EBGHV3GRkZlwKV5KDpfsHIyFACsuwPEMMMAQggsAE/f/xgYGZmZmBhYRH+x8QkBTQgl4GR8T1QTSVQmhmI7wE1p/3/9/8m0HvWQP7x/6AoAwKAAAJHI1ADCOsCzdz279+/o39+/7b68+t3HTDxyAKxOjCQtYBiB//9/TMBKH8EaP0SoDYukF6AAIIlJAGgiSuAztOChQOQv+7PX4ZFID8DNSQyMTJGAW2xg8pHAvE3IE4BCCBINP79mwnEWkgeFgIqTgHSSaBkAsRs/yApDilIGD1BFEAAwaJRH0e0gbzIhkMO7AWAAIJFIxMjJJqIA//B6BmICRBAYAP+//vb9Pfff3YgE+RHAQLaPwLxQSYmxhoQByCAYIF45T/Df/////7JAgMvEMjXBWJRIOYFYpDBn4H4LRBfB8bWcmB2vwdzLkCAAQBb+exjiDFFHAAAAABJRU5ErkJggg==",
    email: null,
    title: "user",
    cached: new Date()
  };
};
