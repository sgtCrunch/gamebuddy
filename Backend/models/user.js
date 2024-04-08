"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const {hoursDic, dayDic, hours, matToDic, dicToMat} = require("../helpers/availInfo");


const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with steam_id.
   *
   * Returns { username, steam_id, name, avatar, max_appt }
   *
   * Throws UnauthorizedError is user not found.
   **/

  static async authenticate(steam_id) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  steam_id,
                  name,
                  avatar,
                  max_appt
           FROM users
           WHERE steam_id = $1`,
        [steam_id],
    );

    const user = result.rows[0];

    if (user) return user;

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, steam_id, name, avatar, max_appt, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, steam_id, name, avatar, max_appt, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT steam_id
           FROM users
           WHERE steam_id = $1`,
        [steam_id],
    );

    if (duplicateCheck.rows[0]) {
      return {username, steam_id, name, avatar, max_appt, isAdmin };
    }

    //const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            steam_id,
            name,
            avatar,
            max_appt,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, steam_id, name, avatar, max_appt, is_admin AS "isAdmin"`,
        [
          username,
          steam_id,
          name,
          avatar,
          max_appt,
          isAdmin
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  steam_id,
                  name,
                  avatar,
                  max_appt
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns {username, steam_id, name, avatar, max_appt, games }
   *   where games is [{ game_id, title, icon }, ... ]
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT username,
                  steam_id,
                  name,
                  avatar,
                  max_appt
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userGamesRes = await db.query(
          `SELECT o.game_id, g.name, g.img_url
           FROM owned AS o
           JOIN games AS g ON (g.game_id = o.game_id)
           WHERE o.username = $1`, [username]);

    user.games = userGamesRes.rows;
    return user;
  }

  /** 
   * 
   * Return a users current availability in a matrix (hours x days)
   * 
   * */

  static async getAvailMat(username) {
    let query = `SELECT day, time
                  FROM availability 
                  WHERE username = $1`;
    
    const userAvailRes = await db.query(query, [username]);

    console.log(userAvailRes.rows);
    let availMat = dicToMat(userAvailRes.rows);
    console.log(availMat);

    return availMat;
  }

  /** Update user data with `data`.
   *
   * Data can include:
   *   { max_appt, availMat }
   *
   * Returns { username,steam_id,name,avatar,max_appt }
   *
   * Throws NotFoundError if not found.
   *
   */

  static async update(username, data) {

    const querySql = `UPDATE users 
                      SET max_appt = $1
                      WHERE username = $2
                      RETURNING username, 
                                steam_id,
                                name,
                                avatar,
                                max_appt`;
    const result = await db.query(querySql, [data.max_appt, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const avail = matToDic(data.availMat);

    await db.query(`DELETE FROM availability WHERE username = $1`, [username]);

    avail.forEach(async (dayHour, idx) => {
      const querySql = `INSERT INTO availability
                        (username, day, time)
                        VALUES ($1, $2, $3)`;
      await db.query(querySql, [username, dayHour[0], dayHour[1]]);
    });

    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** 
   * 
   * retrieve availability of username passed
   *    Returns [{username, day, time},..]
   * 
   **/

  static async getAvail(username) {
    const userRes = await db.query(
      `SELECT username,
              steam_id,
              name,
              avatar,
              max_appt
       FROM users
       WHERE username = $1`,
    [username]);

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userAvailRes = await db.query(
          `SELECT users.username, a.day, a.time
          FROM users
          JOIN availability as a ON (a.username == users.username)
          WHERE a.username = $1`, [username]);

    return userAvailRes;
  }

}


module.exports = User;
