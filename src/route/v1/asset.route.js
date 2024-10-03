const express = require("express");
const validate = require("../../middleware/validate");
const assetController = require("../../controller/asset.controller");
const assetValidation = require("../../validation/asset.validation");

const router = express.Router();

router.route("/nft/getAll").get(assetController.getAllNftAssets);
router.route("/nft/get/:address").get(validate(assetValidation.getNftAssetByAddress), assetController.getNftAssetByAddress);
router.route("/nft/sync").post(validate(assetValidation.syncNftAsset), assetController.syncNftAsset);
router.route("/nft/delete/:address").delete(validate(assetValidation.deleteNftAsset), assetController.deleteNftAsset);
router.route("/flushCache").post(assetController.flushCaches);
router.route("/getPinataImage/:ipfsUri").post(validate(assetValidation.getPinataImage), assetController.getPinataImage);

module.exports = router;
