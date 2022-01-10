// init environment obkect
const env = {}

env.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
}

env.production = {
  'httpPort': 80,
  'httpsPort': 443,
  'envName': 'production'
}

// determine which environment to use
const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// check if NODE_ENV setting is one of environment key, if not, default to staging
const envToExport = typeof(env[currentEnv]) === 'object' ? env[currentEnv] : env.staging

// export the module
module.exports = envToExport