const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const EmbedData = require("../config/embedData.json");
const Big = require("big.js");

/* Awesome bridge functions */
const { ChainData, Bridge, OptionBuilder } = require("../bridge");
const Emojis = require("../config/emojis.json");
const { getUser } = require("../helpers/getUser");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Send some coins to your own wallet")
    .addStringOption((option) =>
      option
        .setName("coin")
        .setDescription("What coin will you be withdrawing?")
        .setRequired(true)
        .addChoices(...OptionBuilder),
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of that coin to send?")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("What address do you want to send too?")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("memo")
        .setDescription("Transaction memo")
        .setRequired(false),
    ),
  run: async (
    client,
    /**
     * @type {import('discord.js').ChatInputCommandInteraction}
     */ interaction,
    args,
    sendingUserData,
  ) => {
    await interaction.deferReply({ ephemeral: true });
    try {
      const movedEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Command Moved`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `${Emojis.Warning} This command has been moved to the /transfer syntax. Please use that instead. ${Emojis.Warning}`,
        )
        .setFooter({ text: EmbedData.Footer })
        .setColor(EmbedData.ErrorColor)
        .setFooter({
          text: "This command will be removed in the future.",
        });
      return await interaction.editReply({
        embeds: [movedEmbed],
      });
    } catch (err) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occured when trying to transfer")
        .setFooter({ text: EmbedData.Footer })
        .setColor(EmbedData.ErrorColor);
      return interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
