let inited = false;
let redisClient;
let redisConnected = false;


/*
|--------------------------------------------------------------------------
| Predeclare exports (to mitigate circular dependencies).
|--------------------------------------------------------------------------
*/

module.exports = {
  redisIsConnected,
  redisClient,
  get,
  getJSON,
  set,
  setJSON,
  del,
  flushDb,
  flushAllDb,
};



const redis = require("redis");
const config = require("../config/config");

/**
 * Initialise our redis connection, if we have one.
 */
function init() {
  console.log("REDIS init...");
  if (inited) {
    console.log("...already done");
    return;
  }

  inited = true;

  if (!config.redis.endpoint) {
    console.log("...no endpoint");
    return;
  }

  connectRedis();
}

/**
 * Connect to redis.
 */
function connectRedis() {
  if (config.redis.source === "aws") {
    console.log("REDIS...connecting aws");

    redisClient = redis.createCluster({
      rootNodes: [
        {
          url: config.redis.endpoint,
        },
      ],
    });
  } else if (config.redis.source === "heroku") {
    console.log("REDIS...connecting heroku");

    redisClient = redis.createClient({
      url: config.redis.endpoint,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
      pingInterval: 1000,
    });
  } else if (config.redis.source === "localhost") {
    console.log("REDIS...connecting localhost");

    // special connection for localhost as the socket option was giving error in dev
    redisClient = redis.createClient({
      url: config.redis.endpoint,
    });
  } else {
    return;
  }

  redisClient.on("error", (error) => console.error(`REDIS Error : ${error}`));

  redisClient.on("ready", () => {
    console.log("REDIS READY");
    redisConnected = true;
  });

  try {
    console.log(`REDIS CONNECTING TO: ${config.redis.endpoint}`);
    redisClient.connect();
  } catch (e) {
    console.log("...error connecting to redis");
  }
}

/**
 * Determine if redis is connected yet.
 */
function redisIsConnected() {
  return redisConnected;
}

/**
 * Get a value.
 */
async function get(key) {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:get - not connected");
    return null;
  }

  try {
    const val = await redisClient.get(key);
    return val;
  } catch (e) {
    return null;
  }
}

/**
 * Get a JSON value.
 */
async function getJSON(key) {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:get - not connected");
    return null;
  }

  try {
    const val = await redisClient.get(key);
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

/**
 * Set a value.
 */
async function set(key, val, ttl = true) {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:set - not connected");
    return;
  }

  try {
    await redisClient.set(key, val);
    if (ttl === true) {
      redisClient.expire(key, config.redis.ttl);
    }
    console.log("Svc:Redis:set: all good");
  } catch (e) {
    console.log(e);
  }
}

/**
 * Set a JSON value.
 */
async function setJSON(key, val, ttl = true) {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:set - not connected");
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(val));
    if (ttl === true) {
      redisClient.expire(key, config.redis.ttl);
    }
    console.log("Svc:Redis:setJSON: all good", key, JSON.stringify(val));
  } catch (e) {
    console.log(e);
  }
}

/**
 * Delete a value.
 */
async function del(key) {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:get - not connected");
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Flush (empty) the redis db.
 */
async function flushDb() {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:flush - not connected");
    return null;
  }

  try {
    await redisClient.FLUSHDB();
  } catch (e) {
    console.log(e);
  }
}

/**
 * Flush (empty) all redis databases.
 */
async function flushAllDb() {
  if (!redisIsConnected()) {
    console.log("Svc:Redis:flush - not connected");
    return null;
  }

  try {
    await redisClient.FLUSHALL();
  } catch (e) {
    console.log(e);
  }
}


/**
 * Module initialisation.
 */
//init();
