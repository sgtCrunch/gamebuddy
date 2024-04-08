"use strict";

/** Routes for appointments. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Appt = require("../models/appt");
const apptNewSchema = require("../schemas/apptNew.json");
const apptSearchSchema = require("../schemas/apptSearch.json");

const router = express.Router({ mergeParams: true });


/** POST / { appt } => { appt }
 *
 * appt should be { player_1, player_2, start_time }
 *
 * Returns { appt_id, player_1, Player_2, start_time, complete, rating }
 *
 * Authorization required: admin or user
 */

router.post("/", async function (req, res, next) {
  try {
    const appt = await Appt.create(req.body);
    return res.status(201).json({ appt });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[appt_id] { fld1, fld2, ... } => { appt }
 *
 * Patches appt data.
 *
 * fields can be: { complete, cancelled }
 *
 * Returns { appt_id, player_1, player_2, start_time, complete, cancelled, rating }
 *
 */

router.patch("/:id", async function (req, res, next) {
  try {
    const appt = await Appt.update(req.params.id, req.body);
    return res.json({ appt });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *   { appts: [ { appt_id, player_1, Player_2, start_time, complete, rating }, ...] }
 *
 * Can provide search filter in query:
 * - completed
 * - username
 * 
 * Authorization required: admin
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  q.completed = q.completed === "true";

  try {
    const appts = await Appt.findAll(q);
    return res.json({ appts });
  } catch (err) {
    return next(err);
  }
});


/** GET /[appt_id] => { appt }
 *
 * Returns { appt_id, player_1, Player_2, start_time, complete, rating}
 *
 * Authorization required: admin or user
 */

router.get("/:id", async function (req, res, next) {
  try {
    const appt = await Appt.get(req.params.id);
    return res.json({ appt });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[appt_id]  =>  { deleted: id }
 *
 * Authorization required: admin or user
 */

router.delete("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await Appt.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
