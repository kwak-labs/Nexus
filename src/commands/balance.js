const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const EmbedData = require("../config/embedData.json");

/* Awesome bridge functions */
const { ChainData, Bridge, OptionBuilder } = require("../bridge");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Get your balance")
    .addStringOption((option) =>
      option
        .setName("coin")
        .setDescription("What balance do you want to get?")
        .setRequired(true)
        .addChoices(...OptionBuilder)
    ),
  run: async (
    client,
    /**
     * @type {import('discord.js').ChatInputCommandInteraction}
     */ interaction,
    args,
    userData
  ) => {
    await interaction.deferReply({ ephemeral: true });

    try {
      const coin = interaction.options.getString("coin");
      let bridge = await new Bridge(
        ChainData[coin],
        userData.mnemonic
      )._initialize();

      let address = await bridge.getAddress();
      let balance = await bridge.getBalance(address);
      let USD = await bridge.getUsdByAsset(balance.asset);

      const BalanceEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${coin} Balance`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(
          {
            name: `${coin}`,
            value: `${balance.asset}`,
            inline: true,
          },
          {
            name: "USD Value",
            value: `$${USD.toFixed(3)}`,
            inline: true,
          }
        )
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: EmbedData.Footer });
      await interaction.editReply({
        embeds: [BalanceEmbed],
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
