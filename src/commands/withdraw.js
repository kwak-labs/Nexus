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
        .addChoices(...OptionBuilder)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of that coin to send?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("What address do you want to send too?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("memo")
        .setDescription("Transaction memo")
        .setRequired(false)
    ),
  run: async (
    client,
    /**
     * @type {import('discord.js').ChatInputCommandInteraction}
     */ interaction,
    args,
    sendingUserData
  ) => {
    await interaction.deferReply({ ephemeral: true });
    try {
      let coin = interaction.options.getString("coin");
      let memo = interaction.options.getString("memo");
      let amount = interaction.options.getNumber("amount");
      let address = interaction.options.getString("address"); // Address recieving

      const bridge = await new Bridge(
        ChainData[coin],
        sendingUserData.mnemonic
      )._initialize();
      let balance = await bridge.getBalance();

      const amountToSend = bridge.assetToBase(amount.toString());
      if (Big(balance.base).lt(amountToSend)) {
        const failedEmbed = new EmbedBuilder()
          .setAuthor({
            name: `Failed withdraw`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription("You're trying to withdraw more than you have!")
          .setColor(EmbedData.ErrorColor);
        return await interaction.followUp({
          embeds: [failedEmbed],
        });
      }

      const tipAmountUsd = await bridge.getUsdByAsset(amount);

      const processingTipEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Sending ${coin}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `${Emojis.Jump_load} Please wait while your TX is processed on the new block ${Emojis.Jump_load}`
        )
        .setFooter({ text: EmbedData.Footer })
        .setColor(EmbedData.SuccessColor);
      await interaction.editReply({
        embeds: [processingTipEmbed],
      });

      await bridge
        .tip(amountToSend.toString(), address, memo)
        .then(async (response) => {
          if (response.error) {
            const errorEmbed = new EmbedBuilder()
              .setAuthor({
                name: `Transaction Failed`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(
                `Transaction failed with: \`\`\`${response.message}\`\`\``
              )
              .setColor(EmbedData.ErrorColor);
            return await interaction.editReply({
              embeds: [errorEmbed],
            });
          }

          const successEmbed = new EmbedBuilder()
            .setAuthor({
              name: `Withdrew ${coin}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(
              `${amount} ${coin} (*$${tipAmountUsd.toFixed(
                3
              )}*) has been sent to \`\`\`${address}\`\`\`\n`
            )
            .setFooter({ text: EmbedData.Footer })
            .setColor(EmbedData.SuccessColor)
            .setFooter({
              text: `TX Hash: ${response}`,
            });
          return await interaction.editReply({
            embeds: [successEmbed],
          });
        });
    } catch (err) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occured when trying to tip")
        .setFooter({ text: EmbedData.Footer })
        .setColor(EmbedData.ErrorColor);
      return interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
