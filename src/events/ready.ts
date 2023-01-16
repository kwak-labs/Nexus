import { client } from '../index';

client.on('ready', async () => {
  client.user.setActivity('kwak', { type: 'WATCHING' });
  console.log('Yeher bot be online');
});
