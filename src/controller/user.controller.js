const catchAsync = require('../util/catchAsync');
const userService = require('../service/user.service');
const authService = require('../service/auth.service');
const codeService = require('../service/code.service');
const errorService = require('../service/error.service');

/*
|--------------------------------------------------------------------------
| User accounts.
|--------------------------------------------------------------------------
*/

/**
 * Verify.
 */
const verifyAccount = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'userVerify')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo;

  switch (req.body.source) {
    case "mv":
      authInfo = await authService.checkMvAuth(req, req.body);
      break;
    case "td2":
      //authInfo = await authService.checkB2cAuth(req);
      authInfo = await authService.checkGameAuth(req);
      break;
    default:
      console.log(`game ${req.body.source} is not supported by the motorverse`);
      errorService.unauthorized(res)
      return;
  }

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  console.log("AUTH INFO WALLET: ", authInfo.wallet);

  const user = await userService.verifyAccount(req.body, authInfo.jwt, authInfo.wallet);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(user.toSanitisedJson());
});

/*
|--------------------------------------------------------------------------
| User games.
|--------------------------------------------------------------------------
*/

/**
 * Generate OTP.
 */
const generateOtp = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'userGenerateOtp')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo = await authService.checkMvAuth(req, req.body);

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  const otp = await userService.generateOtpForGame(req.body, authInfo.jwt);

  if (!otp) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(otp.toSanitisedJson());
});

/**
 * Link game.
 */
const linkGame = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'userLinkGame')) {
    errorService.emitStashedError(res);
    return;
  }

  const user = await userService.linkGameToUser(req.body);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send({
    userId: user.userId,
    gameId: req.body.gameId,
    userAuth: req.body.userAuth,
    status: "linked"
  });
});

/**
 * Link external wallet.
 */
const linkExternalWallet = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'linkExternalWallet')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo = await authService.checkMvAuth(req, req.body);

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  const user = await userService.linkExternalWallet(req.body, authInfo.jwt);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(user.toSanitisedJson());
});

/**
 * Unlink external wallet.
 */
const unlinkExternalWallet = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'unlinkExternalWallet')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo = await authService.checkMvAuth(req, req.body);

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  const user = await userService.unlinkExternalWallet(req.body, authInfo.jwt);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(user.toSanitisedJson());
});

/**
 * Link game wallet.
 */
const linkGameWallet = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'linkGameWallet')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo = await authService.checkGameAuth(req);

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  const user = await userService.linkGameWallet(req.body, authInfo.jwt);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(user.toSanitisedJson());
});

/**
 * Unlink game wallet.
 */
const unlinkGameWallet = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'unlinkGameWallet')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo = await authService.checkGameAuth(req);

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  const user = await userService.unlinkGameWallet(req.body, authInfo.jwt);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(user.toSanitisedJson());
});

/**
 * Generate custom jwt.
 */
const generateCustomJwt = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'generateCustomJwt')) {
    errorService.emitStashedError(res);
    return;
  }

  const customJwt = await userService.generateCustomJwt(req.body);

  if (!customJwt) {
    errorService.emitStashedError(res);
    return;
  }

  res.send({
    status: "ok",
    jwt: customJwt
  });

});

/**
 * Generate Mocaverse jwt.
 */
const generateMocaverseJwt = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'generateMocaverseJwt')) {
    errorService.emitStashedError(res);
    return;
  }

  const mocaverseJwt = await userService.generateMocaverseJwt(req.body);

  if (!mocaverseJwt) {
    errorService.emitStashedError(res);
    return;
  }

  res.send({
    status: "ok",
    jwt: mocaverseJwt
  });

});

/**
 * Add points to user.
 */
const redeemUserPoints = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'redeemUserPoints')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo;

  switch (req.body.source) {
    case "mv":
      authInfo = await authService.checkMvAuth(req, req.body);
      break;
/*     case "td2":
      authInfo = await authService.checkGameAuth(req);
      break; */
    default:
      console.log(`game ${req.body.source} is not supported by the motorverse`);
      errorService.unauthorized(res)
      return;
  }

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  console.log('auth info', authInfo);

  const user = await userService.redeemUserPoints(req.body, authInfo.jwt);

  if (!user) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(user.toSanitisedJson());
});

/**
 * Get points of user.
 */
const getUserPoints = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserPoints')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo;

  switch (req.body.source) {
    case "mv":
      authInfo = await authService.checkMvAuth(req, req.body);
      break;
/*     case "td2":
      authInfo = await authService.checkGameAuth(req);
      break; */
    default:
      console.log(`game ${req.body.source} is not supported by the motorverse`);
      errorService.unauthorized(res)
      return;
  }

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  console.log('auth info', authInfo);

  const userPoints = await userService.getUserPoints(req.body, authInfo.jwt);

  if (!userPoints) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(userPoints);
});

/**
 * Get stakes of a user.
 */
const getUserStakes = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserStakes')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo;

  switch (req.body.source) {
    case "mv":
      authInfo = await authService.checkMvAuth(req, req.body);
      break;
/*     case "td2":
      authInfo = await authService.checkGameAuth(req);
      break; */
    default:
      console.log(`game ${req.body.source} is not supported by the motorverse`);
      errorService.unauthorized(res)
      return;
  }

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  console.log('auth info', authInfo);

  const stakes = await userService.getUserStakes(req.body, authInfo.jwt);

  if (!stakes) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(stakes.map((stake) => stake.toSanitisedJson()));
});

/**
 * Get the history of points from a user.
 */
const getUserPointsHistory = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserPointsHistory')) {
    errorService.emitStashedError(res);
    return;
  }

  let authInfo;

  switch (req.body.source) {
    case "mv":
      authInfo = await authService.checkMvAuth(req, req.body);
      break;
/*     case "td2":
      authInfo = await authService.checkGameAuth(req);
      break; */
    default:
      console.log(`game ${req.body.source} is not supported by the motorverse`);
      errorService.unauthorized(res)
      return;
  }

  if (!authInfo.valid) {
    errorService.unauthorized(res, authInfo.code, authInfo.reason);
    return;
  }

  console.log('auth info', authInfo);

  const userPoints = await userService.getUserPointsHistory(req.body, authInfo.jwt);

  if (!userPoints) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(userPoints.map(userPoint => userPoint.toSanitisedJson()));
});

/**
 * Get the user leaderboard.
 */
const getUserLeaderboard = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserLeaderboard')) {
    errorService.emitStashedError(res);
    return;
  }

  const userLeaderboard = await userService.getUserLeaderboard();

  if (!userLeaderboard) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(userLeaderboard);
});

module.exports = {
  verifyAccount,
  generateOtp,
  linkGame,
  linkExternalWallet,
  unlinkExternalWallet,
  linkGameWallet,
  unlinkGameWallet,
  generateCustomJwt,
  generateMocaverseJwt,
  redeemUserPoints,
  getUserPoints,
  getUserStakes,
  getUserPointsHistory,
  getUserLeaderboard,
};
