const express = require("express");
const router = express.Router();
const Joi = require("joi");
const usersStore = require("../store/users");
const validateWith = require("../middleware/validation");

const schema = {
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(5),
  type: Joi.string().required(),
};

router.post("/", validateWith(schema), (req, res) => {
  const { name, email, password, type } = req.body;
  if (usersStore.getUserByEmail(email))
    return res
      .status(400)
      .send({ error: "Es existiert bereits ein User mit dieser E-Mail" });

  const user = { name, email, password, type };
  usersStore.addUser(user);

  res.status(201).send(user);
});

router.get("/", (req, res) => {
  res.send(usersStore.getUsers());
});

module.exports = router;
