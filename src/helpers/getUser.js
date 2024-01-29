const { createUser } = require("./createUser");

/**
 * Adds user to database
 *
 * @param {String} userId
 * @param {String} guildId
 * @returns {Promise<Object>} Returns the user data
 */
async function getUser(userId, guildId) {
  try {
    let user = global.database.users.get(userId);

    if (!user) {
      user = await createUser(userId, guildId);
    }
    return user;
  } catch (e) {
    return new Error(`An error occured trying to fetch the user ${e}`);
  }
}

module.exports = { getUser };
