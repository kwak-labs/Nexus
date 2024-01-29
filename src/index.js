const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const lmdb = require("lmdb");
const dot = require("dotenv");

/**
 * @type {import('discord.js').Client}
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.slashCommands = new Collection();
dot.config();

require("./handler/index.js")(client);

global.database = {
  users: lmdb.open("./db/users"),
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

module.exports = { client };

client.login(process.env.TOKEN);
