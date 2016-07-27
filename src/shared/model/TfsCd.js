'use strict';

module.exports = function(location, revision) {
  return {
    id: {
      location: location,
      revision: revision        
    },
    data: null
  };
}
