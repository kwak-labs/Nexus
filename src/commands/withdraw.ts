import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import accounts from '../Models/accounts';
import EmbedData from '../config/EmbedData.json';
import Emojis from '../config/Emojis.json';

/* Awesome bridge functions */
import { ChainData, Bridge, OptionBuilder } from '../bridge';

module.exports = {
  ...new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Get some of your coin out of Nexus')
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
    .addStringOption((option) =>
      option
        .setName('address')
        .setDescription('What address do you want to send too?')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('memo').setDescription('Transaction memo').setRequired(false),
    ),

  run: async (client: any, interaction: ChatInputCommandInteraction, args: any) => {
    try {
      await interaction.deferReply();
      let coin: string = interaction.options.getString('coin')!;
      let memo = interaction.options.getString('memo')!;
      let amount = interaction.options.getNumber('amount')!;
      let address = interaction.options.getString('address')!;

      let sendingUser = await accounts.findOne({
        uid: interaction.user.id,
      });
      if (!sendingUser) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `No Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('You dont have an account with Nexus /start') // eric easter egg
          .setColor(EmbedData.ErrorColor);
        return await interaction.followUp({
          embeds: [embed],
        });
      }

      //@ts-ignore
      const SenderClient = new Bridge(ChainData[coin], sendingUser.mnemonic!);
      let { coinname } = await SenderClient._initialize();

      let SenderBalance = await SenderClient.getBalance();

      let AmountBase = SenderClient.assetToBase(amount.toString());

      if (parseInt(SenderBalance.base) < AmountBase) {
        const AccountEmbed = new EmbedBuilder()
          .setAuthor({
            name: `Failed withdrawl`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('your trying to withdraw more than you have!')
          .setColor(EmbedData.ErrorColor);
        return await interaction.followUp({
          embeds: [AccountEmbed],
          ephemeral: true,
        });
      }

      const ProccessingTipEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Sending ${coinname}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `${Emojis.Jump_load} Please wait while your tx is processed on the new block ${Emojis.Jump_load}`,
        )
        .setColor(EmbedData.SuccessColor);
      await interaction.followUp({
        embeds: [ProccessingTipEmbed],
        ephemeral: true,
      });

      /* Actual Transfer */
      let sendTx = await SenderClient.tip(AmountBase.toString(), address, memo).then(
        async (response) => {
          if (response.error == 'nogas') {
            const embed = new EmbedBuilder()
              .setAuthor({
                name: `No Gas`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(response.message)
              .setColor(EmbedData.ErrorColor);
            return await interaction.followUp({
              embeds: [embed],
            });
          }

          const SuccessSend = new EmbedBuilder()
            .setAuthor({
              name: `Sent ${coinname}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`I have successfully sent ${amount} ${coinname} to \`${address}\`\n`)
            .setColor(EmbedData.SuccessColor)
            .setFooter({
              text: `TX Hash: ${response}`,
            });
          return await interaction.followUp({
            embeds: [SuccessSend],
          });
        },
      );
    } catch (err: any) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error occured when trying to withdraw, please try again later.')
        .setColor(EmbedData.ErrorColor);
      return interaction.followUp({
        embeds: [embed],
      });
    }
  },
};