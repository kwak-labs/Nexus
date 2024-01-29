const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const EmbedData = require("../config/EmbedData.json");
const Big = require("big.js");

const { ChainData, Bridge, OptionBuilder } = require("../bridge");
const Emojis = require("../config/emojis.json");
const { getUser } = require("../helpers/getUser");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("tip")
    .setDescription("Tip someone some of your goop")
    .addStringOption((option) =>
      option
        .setName("coin")
        .setDescription("What coin will you be sending?")
        .setRequired(true)
        .addChoices(...OptionBuilder)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of that coin to send?")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to tip?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("memo")
        .setDescription("Transaction memo")
        .setRequired(false)
    ),
  run: async (client, interaction, args, senderData) => {
    await interaction.deferReply({ ephemeral: true });
    try {
      const coin = interaction.options.getString("coin");
      const memo = interaction.options.getString("memo");
      const amount = interaction.options.getNumber("amount");
      const recipient = interaction.options.getUser("user");

      const recipientData = await getUser(recipient.id, interaction.guildId);

      const senderClient = await new Bridge(
        ChainData[coin],
        senderData.mnemonic
      )._initialize();
      const senderBalance = await senderClient.getBalance();

      const recipientClient = await new Bridge(
        ChainData[coin],
        recipientData.mnemonic
      )._initialize();
      const recipientAddress = await recipientClient.getAddress();

      const amountToSend = senderClient.assetToBase(amount.toString());
      if (Big(senderBalance.base).lt(amountToSend)) {
        const failedEmbed = new EmbedBuilder()
          .setAuthor({
            name: `Failed tip`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription("You're trying to tip more than you have!")
          .setFooter({ text: EmbedData.Footer })
          .setColor(EmbedData.ErrorColor);
        return await interaction.followUp({
          embeds: [failedEmbed],
        });
      }

      const tipAmountUsd = await senderClient.getUsdByAsset(amount);

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

      await senderClient
        .tip(amountToSend.toString(), recipientAddress, memo)
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
              name: `Sent ${coin}`,
              iconURL: recipient.displayAvatarURL(),
            })
            .setDescription(
              `${
                interaction.user
              } has successfully tipped ${amount} ${coin} (*$${tipAmountUsd.toFixed(
                3
              )}*) to ${recipient}\n`
            )
            .setColor(EmbedData.SuccessColor)
            .setFooter({
              text: `TX Hash: ${response}`,
            });
          return await interaction.channel.send({
            embeds: [successEmbed],
            content: `<@${recipient.id}>`,
          });
        });
    } catch (err) {
      console.log(err);
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occurred when trying to tip")
        .setFooter({ text: EmbedData.Footer })
        .setColor(EmbedData.ErrorColor);
      return interaction.followUp({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};
