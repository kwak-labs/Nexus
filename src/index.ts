import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import * as dot from 'dotenv';

export const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.slashCommands = new Collection();
dot.config();

require('./handler/index.js')(client);

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);
