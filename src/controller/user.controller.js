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

module.exports = {
  userLogin,
};
