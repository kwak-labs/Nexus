const { generateSeed } = require("./generateSeed");

/**
 * Adds user to database
 *
 * @param {String} userId
 * @param {String} guildId
 * @returns {Promise<Object>} Returns the user
 */
async function createUser(userId, guildId) {
  try {
    let seed = await generateSeed(24);
    await global.database.users.put(userId, {
      uid: userId,
      mnemonic: seed,
      guilds: [guildId],
    });

    return {
      uid: userId,
      mnemonic: seed,
    };
  } catch (e) {
    return new Error(`An error occured trying to create the user ${e}`);
  }
}

module.exports = { createUser };
