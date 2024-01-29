/**
 * Add a guild to a user
 *
 * @param {String} userId
 * @param {String} guildId
 * @returns {Promise<boolean>} Returns the user data
 */
async function addGuild(userId, guildId) {
  try {
    let user = global.database.users.get(userId);

    if (user) {
      userData.guilds.push(guildId);
      await global.database.users.put(userId, userData);
      return true;
    }
  } catch (e) {
    return new Error(`An error occured trying to add guild to user ${e}`);
  }
}

module.exports = { addGuild };
