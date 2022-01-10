// init environment obkect
const env = {}

env.staging = {
  'port': 3000,
  'envName': 'staging'
}

env.production = {
  'port': 3001,
  'envName': 'production'
}

// determine which environment to use
const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : ''

// check if NODE_ENV setting is one of environment key, if not, default to staging
const envToExport = typeof(env[currentEnv]) === 'object' ? env[currentEnv] : env.staging

// export the module
module.exports = envToExport