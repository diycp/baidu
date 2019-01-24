const pageOptions = require('../../index/_index.js');
pageOptions.getTabParams2 = function () {
  let extConfig = swan.getExtConfigSync ? swan.getExtConfigSync() : {};
  if (extConfig != {}) {
    if (extConfig.tabs['tab_2']) {
      this.setData({
        options: extConfig.tabs['tab_2'].pageParams
      })
    }

  }
}
Page(pageOptions);