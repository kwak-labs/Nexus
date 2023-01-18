import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import accounts from '../Models/accounts';
import EmbedData from '../config/EmbedData.json';
import Emojis from '../config/Emojis.json';

/* Awesome bridge functions */
import { ChainData, Bridge, OptionBuilder } from '../bridge';

module.exports = {
  ...new SlashCommandBuilder()
    .setName('tip')
    .setDescription('Tips someone some of your juices')
    .addStringOption((option) =>
      option
        .setName('coin')
        .setDescription('What coin will you be sending?')
        .setRequired(true)
        .addChoices(...OptionBuilder),
    )
    .addNumberOption((option) =>
      option.setName('amount').setDescription('Amount of that coin to send?').setRequired(true),
    )
    .addUserOption((option) => option.setName('user').setDescription('Who do you want to tip?').setRequired(true))
    .addStringOption((option) => option.setName('memo').setDescription('Transaction memo').setRequired(false)),

  run: async (client: any, interaction: ChatInputCommandInteraction, args: any) => {
    try {
      let coin: string = interaction.options.getString('coin')!; // Coin being sent
      let memo = interaction.options.getString('memo')!; // Transaction Memo
      let amount = interaction.options.getNumber('amount')!; // Amount being sent
      let user = interaction.options.getUser('user')!; // User getting the tip

      let sendingUser = await accounts.findOne({
        uid: interaction.user.id,
      });
      if (!sendingUser) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `No Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('You dont have an account with Nexus /start')
          .setColor(EmbedData.ErrorColor);
        return await interaction.reply({
          embeds: [embed],
        });
      }

      let recievingUser = await accounts.findOne({
        uid: user.id,
      });
      if (!recievingUser) {
        const AccountEmbed = new EmbedBuilder()
          .setAuthor({
            name: `User doesnt have an account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('The user your trying to tip doesnt have an account')
          .setColor(EmbedData.ErrorColor);
        return await interaction.reply({
          embeds: [AccountEmbed],
          ephemeral: true,
        });
      }

      //@ts-ignore
      const SenderClient = await new Bridge(ChainData[coin], sendingUser.mnemonic!)._initialize();

      //@ts-ignore
      const ReceiverClient = await new Bridge(ChainData[coin], recievingUser.mnemonic!)._initialize();

      let SenderBalance = await SenderClient.getBalance();
      let ReciverAddress = await ReceiverClient.getAddress();

      let AmountBase = SenderClient.assetToBase(amount.toString());

      if (parseInt(SenderBalance.base) < AmountBase) {
        const AccountEmbed = new EmbedBuilder()
          .setAuthor({
            name: `Failed tip`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('Your trying to tip more than you have!')
          .setColor(EmbedData.ErrorColor);
        return await interaction.reply({
          embeds: [AccountEmbed],
          ephemeral: true,
        });
      }

      const ProccessingTipEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Sending ${coin}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `${Emojis.Jump_load} Please wait while your tx is processed on the new block ${Emojis.Jump_load}`,
        )
        .setColor(EmbedData.SuccessColor);
      await interaction.reply({
        embeds: [ProccessingTipEmbed],
      });

      /* Actual Transfer */
      let sendTx = await SenderClient.tip(AmountBase.toString(), ReciverAddress, memo).then(async (response) => {
        if (response.error == 'nogas') {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `No Gas`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(response.message)
            .setColor(EmbedData.ErrorColor);
          return await interaction.editReply({
            embeds: [embed],
          });
        }

        const SuccessSend = new EmbedBuilder()
          .setAuthor({
            name: `Sent ${coin}`,
            iconURL: user.displayAvatarURL(),
          })
          .setDescription(`I have successfully sent ${amount} ${coin} to ${user.username}\n`)
          .setColor(EmbedData.SuccessColor)
          .setFooter({
            text: `TX Hash: ${response}`,
          });
        return await interaction.editReply({
          embeds: [SuccessSend],
        });
      });

      // await ProccessingTipMessage.delete();
    } catch (err: any) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error occured when trying to tip, please try again later.')
        .setColor(EmbedData.ErrorColor);
      return interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
