const { ActivityType } = require('discord.js');
const { client } = require('../index');

client.on('ready', async () => {
	client.user.setActivity('blocks be created', {
		type: ActivityType.Watching,
	});
	console.log('Yeher bot be online');
});
