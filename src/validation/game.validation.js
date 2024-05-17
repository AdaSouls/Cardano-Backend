const MOTORVERSE_HUB = 'mv';
const TORQUE_BURNOUT = 'tb';
const TORQUE_DRIFT = 'td';
const TORQUE_DRIFT2 = 'td2';
const HIGH_VOLTAGE = 'hv';
const MOTOGP_IGNITION = 'gpi';
const MOTOGP_GURU = 'gpg';
const GEAR_CLUB_STRADALE = 'gcs';
const TORQUE_SQUAD = 'ts';
const REVV_RACING = 'rr';
const VIRTUS_70 = 'v70';
const GEAR_CLUB = 'gc';
const MOTOGP_QUEST = 'gpq';

const ALL_GAME_IDS = [
  TORQUE_BURNOUT,
  TORQUE_DRIFT,
  TORQUE_DRIFT2,
  HIGH_VOLTAGE,
  MOTOGP_IGNITION,
  MOTOGP_GURU,
  GEAR_CLUB_STRADALE,
  TORQUE_SQUAD,
  REVV_RACING,
  VIRTUS_70,
  GEAR_CLUB,
  MOTOGP_QUEST,
];

const ALL_GAME_IDS_PLUS_MV = [
  MOTORVERSE_HUB,
  TORQUE_BURNOUT,
  TORQUE_DRIFT,
  TORQUE_DRIFT2,
  HIGH_VOLTAGE,
  MOTOGP_IGNITION,
  MOTOGP_GURU,
  GEAR_CLUB_STRADALE,
  TORQUE_SQUAD,
  REVV_RACING,
  VIRTUS_70,
  GEAR_CLUB,
  MOTOGP_QUEST,
];

const gameId = (value, helpers) => {
  if (!isValidGameId(value)) {
    return helpers.message('Invalid game id');
  }
  return value;
};

const gameIdOrHub = (value, helpers) => {
  if (!isValidGameIdOrHub(value)) {
    return helpers.message('Invalid game id or hub');
  }
  return value;
};

/**
 * Check a game id (including Motorverse Hub).
 * @param {string} gameId
 * @returns {boolean}
 */
const isValidGameIdOrHub = (gameId) => {
  return gameId && ALL_GAME_IDS_PLUS_MV.indexOf(gameId) >= 0;
};

/**
 * Check a game id.
 * @param {string} gameId
 * @returns {boolean}
 */
const isValidGameId = (gameId) => {
  return gameId && ALL_GAME_IDS.indexOf(gameId) >= 0;
};


module.exports = {
  TORQUE_BURNOUT,
  TORQUE_DRIFT,
  TORQUE_DRIFT2,
  HIGH_VOLTAGE,
  MOTOGP_IGNITION,
  MOTOGP_GURU,
  GEAR_CLUB_STRADALE,
  TORQUE_SQUAD,
  REVV_RACING,
  VIRTUS_70,
  GEAR_CLUB,
  MOTOGP_QUEST,
  ALL_GAME_IDS,
  gameId,
  gameIdOrHub,
};
