import { EmbedBuilder, SlashCommandBuilder, CommandInteraction } from 'discord.js';
import accounts from '../Models/accounts';
import EmbedData from '../config/EmbedData.json';

import { generateSeed } from '../helpers/GenerateSeed';

module.exports = {
  ...new SlashCommandBuilder().setName('start').setDescription('Get started with Nexus'),
  run: async (client: any, interaction: CommandInteraction, args: any) => {
    await interaction.deferReply();
    try {
      let data = await accounts.findOne({
        uid: interaction.user.id,
      });
      if (data) {
        const AccountEmbed = new EmbedBuilder()
          .setAuthor({
            name: `Existing Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('You already have an account created')
          .setColor(EmbedData.ErrorColor);
        return await interaction.followUp({
          embeds: [AccountEmbed],
          ephemeral: true,
        });
      }

      let seed = await generateSeed(24);

      const account = new accounts({
        uid: interaction.user.id,
        mnemonic: seed,
        guilds: [interaction.guild!.id],
      });
      await account.save();

      const embedd = new EmbedBuilder()
        .setAuthor({
          name: `Account Creator`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`Account has succesfully been created`)
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: '/help to get info on commands' });
      await interaction.followUp({
        embeds: [embedd],
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
