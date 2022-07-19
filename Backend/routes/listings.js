const express = require("express");
const router = express.Router();
const Joi = require("joi");
const multer = require("multer");

const store = require("../store/listings");
const categoriesStore = require("../store/categories");
const validateWith = require("../middleware/validation");
const auth = require("../middleware/auth");
const imageResize = require("../middleware/imageResize");
const delay = require("../middleware/delay");
const listingMapper = require("../mappers/listings");
const config = require("config");

const upload = multer({
  dest: "uploads/",
  limits: { fieldSize: 25 * 1024 * 1024 },
});

const schema = {
  title: Joi.string().required(),
  description: Joi.string().allow("").required(),
  village: Joi.string().required(),
  categoryId: Joi.number().required().min(1),
  date: Joi.string().allow(""),
  intervall: Joi.string().allow(""),
  userId: Joi.number().required(),
};

const validateCategoryId = (req, res, next) => {
  if (!categoriesStore.getCategory(parseInt(req.body.categoryId)))
    return res.status(400).send({ error: "Invalid categoryId." });

  next();
};

router.get("/", (req, res) => {
  const listings = store.getListings();
  const resources = listings.map(listingMapper);
  res.send(resources);
});

router.delete("/:listingid", (req, res) => {
  const { listingid } = req.params;
  store.deleteListing(parseInt(listingid));
  console.log(req.params);
  res.status(200).end();
});

router.post(
  "/",
  [
    upload.array("images", config.get("maxImageCount")),
    validateWith(schema),
    validateCategoryId,
    imageResize,
  ],

  async (req, res) => {
    const listing = {
      title: req.body.title,
      village: req.body.village,
      categoryId: parseInt(req.body.categoryId),
      description: req.body.description,
      date: req.body.date,
      intervall: req.body.intervall,
      userId: parseInt(req.body.userId),
    };
    listing.images = req.images.map((fileName) => ({ fileName: fileName }));
    store.addListing(listing);

    res.status(201).send(listing);
  }
);

module.exports = router;
