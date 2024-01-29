const { client } = require("../index");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

const { createUser } = require("../helpers/createUser");
const { addGuild } = require("../helpers/addGuild");
const EmbedData = require("../config/embedData.json");

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    // Slash Command Handling
    // await interaction.deferReply({ ephemeral: false }).catch(() => {});
    let userData = global.database.users.get(interaction.user.id);

    if (!userData) {
      userData = await createUser(
        interaction.user.id,
        interaction.guild.id
      ).catch(async () => {
        const embed = new EmbedBuilder()
          .setTitle("Error")
          .setDescription("An error occured when creating your Nexus account")
          .setFooter({ text: EmbedData.Footer })
          .setColor(EmbedData.ErrorColor);
        return interaction.editReply({
          embeds: [embed],
        });
      });
    }

    if (
      interaction.guild?.id &&
      !userData.guilds.includes(interaction.guild.id)
    ) {
      await addGuild(interaction.user.id, interaction.guild.id);
    }

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.followUp({ content: "An error has occured " });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === ApplicationCommandOptionType.Subcommand) {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    if (interaction.guild) {
      interaction.member = interaction.guild.members.cache.get(
        interaction.user.id
      );
    }

    cmd.run(client, interaction, args, userData);
  }

  // Context Menu Handling
  if (interaction.isContextMenuCommand()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.slashCommands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }
});
