const express = require('express');
const router = express.Router();
const config = require('../../config/config');
const assetRoute = require("./asset.route");
const walletRoute = require("./wallet.route");
const healthCheckRoute = require('./healthCheck.route');
const userRoute = require('./user.route');
const webhookRoute = require("./webhook.route");

const defaultRoutes = [
  {
    path: "/asset",
    route: assetRoute,
  },
  {
    path: '/healthCheck',
    route: healthCheckRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: "/wallet",
    route: walletRoute,
  },
  {
    path: "/webhook",
    route: webhookRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env !== 'production') {
  const devRoutes = [
    // routes available only in development mode
  ];

  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
