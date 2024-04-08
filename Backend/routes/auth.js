"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const Game = require("../models/game");
const express = require("express");
const request = require("request");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");
const SteamAuth = require("node-steam-openid");
const { options } = require("./users");

const steamApi = '116CA03793EB7CC0450211F41D2372F1';

const steam = new SteamAuth({
  realm: "http://localhost:3001", // Site name displayed to users on logon
  returnUrl: "http://localhost:3001/auth/steam/authenticate", // Your return route
  apiKey: steamApi // Steam API key
});

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

router.get("/steam", async (req, res) => {
  const redirectUrl = await steam.getRedirectUrl();
  
  return res.json({redirectUrl});
});

router.get("/steam/authenticate", async (req, res, next) => {
  try {
    const user = await steam.authenticate(req);
    console.log(user);
    if(!user.name) user.name=user.username;
    const newUser = await User.register({ username: user.username, steam_id: user.steamid, name:user.name,
       avatar: user.avatar, max_appt: 3, isAdmin: false });

    const gamesURL = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApi}&steamid=${user.steamid}&include_appinfo=true&include_played_free_games=true`
    console.log(gamesURL);
    request(gamesURL, async (err, response, body) => {
      if(!err && req.statusCode < 400) {

        const games = JSON.parse(response.body).response.games;
        console.log("games " + response.body);
        if(games){
          games.forEach(game => {
            const img_url = `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
            game.img_url = img_url;
            const g = Game.create(game);
            Game.addOwnedGame({game_id : game.appid, username:newUser.username});
          });
        }
        
      }
    });

    return res.redirect(`http://localhost:3000/user/${newUser.username}`);    
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
