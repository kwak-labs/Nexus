import { ActivityType } from 'discord.js';
import { client } from '../index';

client.on('ready', async () => {
  client.user!.setActivity('blocks be created', {
    type: ActivityType.Watching,
  });
  console.log('Yeher bot be online');
});
