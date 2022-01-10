// init helper object
const sanityCheck = {}

sanityCheck.number = function(data, defaultTo = false) {
  return typeof(data) === 'number' ? data : defaultTo
}

sanityCheck.object = function(data, defaultTo = {}) {
  return typeof(data) === 'object' ? data : defaultTo
}


module.exports = sanityCheck