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
    )
    .addUserOption((option) =>
      option.setName('user').setDescription('Whos balance do you want to check?').setRequired(false),
    ),
  run: async (client: any, interaction: ChatInputCommandInteraction, args: any) => {
    await interaction.deferReply();
    try {
      const coin: string = interaction.options.getString('coin')!;
      let user = interaction.options.getUser('user');

      let address;
      let bridge;
      let account;
      if (user) {
        let data = await accounts.findOne({
          uid: user.id,
        });

        account = user;

        if (!data) {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `No Account`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription('The user you tried searching does not have an account')
            .setColor(EmbedData.ErrorColor);
          return await interaction.editReply({
            embeds: [embed],
          });
        }

        //@ts-ignore
        bridge = await new Bridge(ChainData[coin], data.mnemonic)._initialize();

        address = await bridge.getAddress();
      } else {
        let data = await accounts.findOne({
          uid: interaction.user.id,
        });

        account = interaction.user;

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
        bridge = await new Bridge(ChainData[coin], data.mnemonic)._initialize();

        address = await bridge.getAddress();
      }

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
