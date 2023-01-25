import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import accounts from '../Models/accounts';
import EmbedData from '../config/EmbedData.json';

/* Awesome bridge functions */
import { ChainData, Bridge, OptionBuilder } from '../bridge';

module.exports = {
  ...new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Get your balance')
    .addStringOption((option) =>
      option
        .setName('coin')
        .setDescription('What balance do you want to get?')
        .setRequired(true)
        .addChoices(...OptionBuilder),
    ),
  run: async (client: any, interaction: ChatInputCommandInteraction, args: any) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      const coin: string = interaction.options.getString('coin')!;

      let data = await accounts.findOne({
        uid: interaction.user.id,
      });

      let account = interaction.user;

      if (!data) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `No Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('you dont have a account you silly goos') // eric easter egg
          .setColor(EmbedData.ErrorColor);
        return await interaction.editReply({
          embeds: [embed],
        });
      }

      //@ts-ignore
      let bridge = await new Bridge(ChainData[coin], data.mnemonic)._initialize();

      let address = await bridge.getAddress();

      let balance = await bridge.getBalance(address);
      let price = await bridge.getUsdByAsset(parseFloat(balance.asset));
      const BalanceEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${account.username}'s Balance`,
          iconURL: account.displayAvatarURL(),
        })
        .addFields(
          {
            name: `${coin}`,
            value: `${balance.asset}`,
            inline: true,
          },
          {
            name: 'Dollar Value',
            value: `$${price.toFixed(3)}`,
            inline: true,
          },
        )
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: EmbedData.Footer });
      await interaction.editReply({
        embeds: [BalanceEmbed],
      });
    } catch (err: any) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error occured when fetching your balance please try again')
        .setColor(EmbedData.ErrorColor);
      return interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
