const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const EmbedData = require("../config/EmbedData.json");

/* Awesome bridge functions */
const { ChainData, Bridge, OptionBuilder } = require("../bridge");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("getseed")
    .setDescription("Get the seed phrase linked to your account"),
  run: async (
    client,
    /**
     * @type {import('discord.js').ChatInputCommandInteraction}
     */ interaction,
    args,
    userData
  ) => {
    try {
      const CommandAck = new EmbedBuilder()
        .setAuthor({
          name: `Seed Phrase`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`Your seed Phrase has been DMed to you`)
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: EmbedData.Footer });
      await interaction.reply({
        embeds: [CommandAck],
        ephemeral: true,
      });

      const SeedEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Seed Phrase`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`||\`\`\`${userData.mnemonic}}\`\`\`||`)
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: EmbedData.Footer });
      await interaction.user.send({
        embeds: [SeedEmbed],
      });
    } catch (err) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occured when fetching balance")
        .setColor(EmbedData.ErrorColor);
      return interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
