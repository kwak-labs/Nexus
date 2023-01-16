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

// setInterval(() => {
//   const memoryData = process.memoryUsage();

//   const memoryUsage = {
//     rss: `${formatMemoryUsage(
//       memoryData.rss,
//     )} -> Resident Set Size - total memory allocated for the process execution`,
//     heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
//     heapUsed: `${formatMemoryUsage(
//       memoryData.heapUsed,
//     )} -> actual memory used during the execution`,
//     external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
//   };

//   console.log(memoryUsage);
// }, 60000);

const formatMemoryUsage = (data: any) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
