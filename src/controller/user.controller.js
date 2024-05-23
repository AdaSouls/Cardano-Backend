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
 * Login.
 */
const userLogin = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'userLogin')) {
    errorService.emitStashedError(res);
    return;
  }

  const user = await userService.userLogin(req.body.sigData, req.body.email, req.body.username);

  if (user === false) {
    errorService.emitStashedError(res);
    return;
  }

  if (user.token === "signature failed") {
    return res.status(401).send({
      message: "The Cardano wallet authentication failed"
    });
  }

  if (user.token === "jwt generation failed") {
    return res.status(500).send({
      message: "The JWT generation failed"
    });
  }

  req.session.token = user.token;

  return res.status(200).send(user.user.toSanitisedJson());

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

module.exports = {
  userLogin,
  generateOtp,
  linkGame,
  linkExternalWallet,
  unlinkExternalWallet,
  linkGameWallet,
  unlinkGameWallet,
  generateCustomJwt,
  redeemUserPoints,
};
