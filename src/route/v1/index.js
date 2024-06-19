const express = require('express');
const router = express.Router();
const config = require('../../config/config');
const assetRoute = require("./asset.route");
const adminRoute = require("./admin.route");
const collectionRoute = require("./collection.route");
const walletRoute = require("./wallet.route");
const healthCheckRoute = require('./healthCheck.route');
const userRoute = require('./user.route');
const spoRoute = require('./spo.route');
const soulboundRoute = require('./soulbound.route');
const webhookRoute = require("./webhook.route");

const defaultRoutes = [
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/asset",
    route: assetRoute,
  },
  {
    path: "/collections",
    route: collectionRoute,
  },
  {
    path: "/soulbound",
    route: soulboundRoute,
  },
  {
    path: '/healthCheck',
    route: healthCheckRoute,
  },
  {
    path: '/spo',
    route: spoRoute,
  },
  {
    path: '/user',
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
