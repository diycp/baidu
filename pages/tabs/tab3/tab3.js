const pageOptions = require('../../index/_index.js');
pageOptions.getTabParams3 = function () {
  let extConfig = swan.getExtConfigSync ? swan.getExtConfigSync() : {};
  if (extConfig != {}) {
    if (extConfig.tabs['tab_3']) {
      this.setData({
        options: extConfig.tabs['tab_3'].pageParams
      })
    }

  }
}
Page(pageOptions);