import { client } from '../index';
import { ApplicationCommandOptionType, Interaction } from 'discord.js';
import accounts from '../Models/accounts';

client.on('interactionCreate', async (interaction: Interaction) => {
  let data = await accounts.findOne({
    uid: interaction.user.id,
  });
  if (data) {
    let usersGuilds: string[] = await data.guilds;

    if (!usersGuilds.includes(interaction.guild!.id)) {
      data.guilds = [...usersGuilds, interaction.guild!.id];
      data.save();
    }
  }
  // Slash Command Handling
  if (interaction.isCommand()) {
    // await interaction.deferReply({ ephemeral: false }).catch(() => {});

    const cmd: any = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.followUp({ content: 'An error has occured ' });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === ApplicationCommandOptionType.Subcommand) {
        if (option.name) args.push(option.name);
        option.options?.forEach((x: any) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    // @ts-ignore
    interaction.member = interaction.guild.members.cache.get(interaction.user.id);

    cmd.run(client, interaction, args);
  }

  // Context Menu Handling
  if (interaction.isContextMenuCommand()) {
    await interaction.deferReply({ ephemeral: false });
    const command: any = client.slashCommands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }
});
