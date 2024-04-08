"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

const _ = require("lodash");

/** Related functions for companies. */

class Appt {
  /** Create a Appt (from data), update db, return new appt data.
   *
   * data should be { player_1, player_2, current_time }
   *
   * Returns { appt_id, player_1, player_2, start_time, complete, ratings }
   **/

  static async create(data) {
    
    const player_1 = await this.checkUser(data.player_1);
    let player_2 = {};
    
    if(!data.player_2){
      const players = await this.getPartner(data.player_1);
      if(players.length < 1) return {msg:"No Available Appointments"};
      data["player_2"] = _.sample(players).username;
    }
      
    player_2 = await this.checkUser(data.player_2);

    try{
      console.log("STARTDFLDFJLSDFJ");
      await this.checkMax(player_1);
      await this.checkMax(player_2);
    }
    catch{
      console.log("HELLLODFLDFJLSDFJ");
      return {msg:"Max Appointments Reached"};
    }
    

    const common_games = await this.commonGames(player_1, player_2);
    const common_times = await this.commonTimes(player_1, player_2);

    const apptDayTime = _.sample(common_times);

    const start_time = this.getNextDayOfTheWeek(apptDayTime.day);
    start_time.setUTCHours(apptDayTime.time);

    const result = await db.query(
          `INSERT INTO appts (player_1,
                             player_2,
                             start_time)
           VALUES ($1, $2, $3)
           RETURNING appt_id, player_1, player_2, start_time, complete, rating`,
        [player_1.username, player_2.username, start_time]);
    let appt = result.rows[0];

    return {...appt, player1_img : player_1.avatar, player2_img: player_2.avatar};
  }

  static async addMessage(data) {

    const result = await db.query(
      `INSERT INTO messages (room_id,
                         message,
                         sender,
                         send_time)
       VALUES ($1, $2, $3, $4)
       RETURNING message, sender, sender, send_time`,
    [data.room, data.message, data.sender, data.send_time]);
    let message = result.rows[0];

    return message;
  }

  static async getMessages(room) {
    const res = await db.query(
      `SELECT *
       FROM messages
       WHERE room_id = $1`,
    [room]);

    const messages = res.rows;

    return messages;
  }



  static getNextDayOfTheWeek(dayOfWeek, excludeToday = true, refDate = new Date()) {
    if (dayOfWeek < 0) return;
    refDate.setUTCHours(0,0,0,0);
    refDate.setDate(refDate.getDate() + +!!excludeToday + 
                    (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
    return refDate;
  }

  /*
  * Find partner for appointment
  */
  static async getPartner(player_1){

    const partners = await db.query(
      `WITH 
        playerGames AS (
        SELECT game_id
        FROM owned
        WHERE owned.username = $1),

        sameGames AS (
        SELECT DISTINCT (o.username)
        FROM owned AS o
        JOIN games AS g ON o.game_id = g.game_id
        WHERE o.game_id IN (SELECT game_id FROM playerGames) AND o.username != $1),

        player_avail AS (
          SELECT day, time
          FROM availability
          WHERE username = $1)

      
      SELECT DISTINCT (username)
      FROM availability AS avail
      JOIN player_avail AS pa ON (pa.day = avail.day AND pa.time = avail.time)
      WHERE avail.username IN (SELECT username FROM sameGames)`,
    [player_1]);

    return partners.rows;

  }

  /* *
  * Check if username exists
  * */

  static async checkUser(username) {
    
    const checkPlayer = await db.query(
      `SELECT username, max_appt, avatar
       FROM users
       WHERE username = $1`,
    [username]);

    const player = checkPlayer.rows[0];

    if (!player) throw new NotFoundError(`No user: ${username}`);

    return player;

  }

  /**
   * Check if player has less appointments than their max
   * Input: {username, max_appt}
   * return available days and times
   */
  static async checkMax(player) {
    
    const checkPlayerMax = await db.query(
      `SELECT a.appt_id
       FROM appts as a
       WHERE (a.player_1 = $1 OR a.player_2 = $1) AND a.complete = false`,
    [player.username]);

    const playerMax = checkPlayerMax.rows.length;

    if (playerMax >= player.max_appt) throw new BadRequestError(`Max Appointments Reached`);

    return player;


  }

  static async commonGames(player_1, player_2) {

    const common_games = await db.query(
      `
      WITH playerGames AS (
        SELECT game_id
        FROM owned
        WHERE owned.username = $1)

      SELECT o.username, g.name, g.img_url
      FROM owned AS o
      JOIN games AS g ON o.game_id = g.game_id
      WHERE o.game_id IN (SELECT game_id FROM playerGames) AND o.username = $2`,
    [player_1.username, player_2.username]);

    return common_games.rows;

  }

  static async commonTimes(player_1, player_2) {
    const common_times = await db.query(
      `WITH 
        player1_avail AS (
          SELECT day, time
          FROM availability
          WHERE username = $1),

        player2_avail AS (
          SELECT day, time
          FROM availability
          WHERE username = $2)

      SELECT pa1.day, pa2.time
      FROM player1_avail AS pa1
      JOIN player2_avail AS pa2 ON (pa1.day = pa2.day AND pa1.time = pa2.time)`,
    [player_1.username, player_2.username]);


    return common_times.rows;
  }

  /** Find all appointments (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * -completed (true or false)
   * -username
   *
   * Returns [{ appt_id, player_1, player_2, start_time, complete, rating }, ...]
   * 
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT appt_id, player_1, player_2, start_time, complete, cancelled, rating
                 FROM appts`;
    let whereExpressions = [];
    let queryValues = [];

    const { completed, username } = searchFilters;

    if (completed !== undefined) {
      queryValues.push(completed);
      whereExpressions.push(`complete = $${queryValues.length}`);
    }

    if (username) {
      queryValues.push(username);
      whereExpressions.push(`(player_1 = $${queryValues.length} OR player_2 = $${queryValues.length})`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY start_time";
    const apptsRes = await db.query(query, queryValues);
    return apptsRes.rows;
  }


  /** Given an appt id, return data about an appt.
   *
   * Returns { appt_id, player_1, player_2, start_time, complete, rating }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const apptRes = await db.query(
          `SELECT appt_id,
                  player_1, 
                  player_2, 
                  start_time, 
                  complete, 
                  rating
           FROM appts
           WHERE appt_id = $1`, [id]);

    const appt = apptRes.rows[0];

    const commonGame = await this.commonGames({username:appt.player_1}, {username:appt.player_2});
    appt.games = commonGame;

    if (!appt) throw new NotFoundError(`No appt: ${id}`);

    return appt;
  }

  /** Update appt data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { complete, cancelled }
   *
   * Returns { appt_id, player_1, player_2, start_time, complete, cancelled }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE appts 
                      SET ${setCols} 
                      WHERE appt_id = ${idVarIdx} 
                      RETURNING appt_id, player_1, player_2, start_time, complete, cancelled, rating`;
    const result = await db.query(querySql, [...values, id]);
    const appt = result.rows[0];

    if (!appt) throw new NotFoundError(`No appt: ${id}`);

    return appt;
  }

  /** Delete given appt from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM appts
           WHERE id = $1
           RETURNING id`, [id]);
    const appt = result.rows[0];

    if (!appt) throw new NotFoundError(`No appt: ${id}`);
  }
}

module.exports = Appt;
