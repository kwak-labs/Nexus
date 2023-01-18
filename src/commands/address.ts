import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import accounts from '../Models/accounts';
import EmbedData from '../config/EmbedData.json';

/* Awesome bridge functions */
import { ChainData, Bridge, OptionBuilder } from '../bridge';

module.exports = {
  ...new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Get your Nexus address')
    .addStringOption((option) =>
      option
        .setName('coin')
        .setDescription('What address do you want to fetch?')
        .setRequired(true)
        .addChoices(...OptionBuilder),
    ),
  run: async (client: any, interaction: ChatInputCommandInteraction, args: any) => {
    await interaction.deferReply();
    try {
      let coin: string = interaction.options.getString('coin')!;

      let data = await accounts.findOne({
        uid: interaction.user.id,
      });

      if (!data) {
        const AccountEmbed = new EmbedBuilder()
          .setAuthor({
            name: `No Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('You dont have a Nexus account, /start')
          .setColor(EmbedData.ErrorColor);
        return await interaction.followUp({
          embeds: [AccountEmbed],
          ephemeral: true,
        });
      }

      // @ts-ignore
      let bridge = await new Bridge(ChainData[coin], data.mnemonic)._initialize();

      let address = await bridge.getAddress();

      const AddressEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${coin} Address`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`\`\`\`${address}\`\`\``)
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: EmbedData.Footer });
      await interaction.followUp({
        embeds: [AddressEmbed],
      });
    } catch (err: any) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error occured when creating your account')
        .setColor(EmbedData.ErrorColor);
      return interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
