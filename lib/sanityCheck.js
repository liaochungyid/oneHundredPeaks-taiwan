// init helper object
const sanityCheck = {}

sanityCheck.number = function(data, defaultTo = false) {
  return typeof(data) === 'number' ? data : defaultTo
}

sanityCheck.object = function(data, defaultTo = {}) {
  return typeof(data) === 'object' ? data : defaultTo
}

sanityCheck.string = function(data, defaultTo = false) {
  return typeof(data) === 'string' && data.trim().length > 0 ? data.trim() : defaultTo
}

sanityCheck.boolean = function(data, defaultTo = false) {
  return typeof(data) === 'boolean' ? data : defaultTo
}

sanityCheck.notFalsy = function(data, defaultTo = false) {
  const type = typeof data
  return type !== 'undefined' && type !== 'null' && data ? data : defaultTo
}

sanityCheck.email = function(data, defaultTo = false){
  const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (!data || 
      typeof(data) !== 'string' ||
      data.length > 254
      ){
      return defaultTo
    }

    const valid = emailRegex.test(data);
    if(!valid) { return defaultTo }

    // further checking things regex can't handle
    const parts = data.split("@");
    if(parts[0].length > 64 ) { return defaultTo }

    const domainParts = parts[1].split(".");
    if(domainParts.some((part) => {
      return part.length > 63 
    })) {
      return defaultTo
    }

    return data.trim();
}

module.exports = sanityCheck