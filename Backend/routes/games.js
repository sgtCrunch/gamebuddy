"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Game = require("../models/game");

const gameNewSchema = require("../schemas/gameNew.json");
const gameUpdateSchema = require("../schemas/gameUpdate.json");
const gameSearchSchema = require("../schemas/gameSearch.json");

const router = new express.Router();


/** POST / { game } =>  { game }
 *
 * game should be { title, icon }
 *
 * Returns { game_id, title, icon }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, gameNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const game = await Game.create(req.body);
    return res.status(201).json({ game });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { games: [ { game_id, title, icon }, ...] }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;

  try {
    const validator = jsonschema.validate(q, gameSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const games = await Game.findAll(q);
    return res.json({ games });
  } catch (err) {
    return next(err);
  }
});

/** GET /[game_id]  =>  { game }
 *
 *  Game is { game_id, title, icon, users }
 *   where users is [{ username, steam_id, name, avatar }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const game = await Game.get(req.params.id);
    return res.json({ game });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[game_id] { fld1, fld2, ... } => { game }
 *
 * Patches game data.
 *
 * fields can be: { title, icon }
 *
 * Returns { game_id, title, icon }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, gameUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const game = await Game.update(req.params.handle, req.body);
    return res.json({ game });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[game_id]  =>  { deleted: game_id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Game.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
