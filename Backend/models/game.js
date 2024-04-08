"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for games. */

class Game {
  /** Create a game (from data), update db, return new game data.
   *
   * data should be { game_id, name, img_url }
   *
   * Returns { name, img_url  }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ appid, name, img_url }) {

    const duplicateCheck = await db.query(
          `SELECT game_id
           FROM games
           WHERE game_id = $1`,
        [appid]);

    if (duplicateCheck.rows[0])
      return {name, img_url};

    const result = await db.query(
          `INSERT INTO games
           (game_id, name, img_url)
           VALUES ($1, $2, $3)
           RETURNING name, img_url`,
        [
          appid,
          name,
          img_url
        ]
    );
    const game = result.rows[0];

    return game;
  }

  /** Create a game and user relationship, update db.
   *
   * data should be { game_id, username }
   *
   * */

  static async addOwnedGame({ game_id, username }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM owned
           WHERE username = $1`,
        [username]);

    if (duplicateCheck.rows[0]) return;

    const result = await db.query(
          `INSERT INTO owned
           (game_id, username)
           VALUES ($1, $2)`,
        [
          game_id,
          username
        ]
    );

  }

  /** Find all games.
   *
   * Returns [{ game_id, name, img_url}, ...]
   * */

  static async findAll() {
    let query = `SELECT game_id, name, img_url
                 FROM games`;
    const gamesRes = await db.query(query);
    return gamesRes.rows;
  }

  /** Given a game id, return data about the game.
   *
   * Returns { game_id, name, img_url, users }
   *   where users is [{ username, steam_id, name, avatar }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(game_id) {
    const gameRes = await db.query(
          `SELECT game_id, name, img_url
           FROM games
           WHERE game_id = $1`,
        [game_id]);

    const game = gameRes.rows[0];

    if (!game) throw new NotFoundError(`No game: ${game_id}`);

    const usersRes = await db.query(
          `SELECT username, steam_id, name, avatar
           FROM owned
           WHERE game_id = $1
           ORDER BY username`,
        [game_id],
    );

    game.users = usersRes.rows;

    return game;
  }

  /** Update game data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {img_url}
   *
   * Returns {game_id, name, img_url}
   *
   * Throws NotFoundError if not found.
   */

  static async update(game_id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);
    const gameIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE games 
                      SET ${setCols} 
                      WHERE game_id = ${gameIdVarIdx} 
                      RETURNING game_id, name, img_url`;
    const result = await db.query(querySql, [...values, game_id]);
    const game = result.rows[0];

    if (!game) throw new NotFoundError(`No game: ${game_id}`);

    return game;
  }

  /** Delete given game_id from database; returns undefined.
   *
   * Throws NotFoundError if game not found.
   **/

  static async remove(game_id) {
    const result = await db.query(
          `DELETE
           FROM games
           WHERE game_id = $1
           RETURNING game_id`,
        [game_id]);
    const game = result.rows[0];

    if (!company) throw new NotFoundError(`No game: ${game_id}`);
  }
}


module.exports = Game;
