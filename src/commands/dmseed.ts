import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import EmbedData from '../config/EmbedData.json';
import accounts from '../Models/accounts';

module.exports = {
  ...new SlashCommandBuilder()
    .setName('getseed')
    .setDescription('Get the seed phrase linked to your account'),
  run: async (client: any, interaction: CommandInteraction, args: any) => {
    try {
      let data = await accounts.findOne({
        uid: interaction.user.id,
      });
      if (!data) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `No Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('You need an account to fetch a seed! /start')
          .setColor(EmbedData.ErrorColor);
        return await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
      await interaction.reply({
        content: 'Seed has been dmed to you',
        ephemeral: true,
      });

      const SeedEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Seed`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`||${data.mnemonic}||`)
        .setColor(EmbedData.SuccessColor)
        .setFooter({
          text: EmbedData.Footer,
        });
      return interaction.user.send({
        embeds: [SeedEmbed],
      });
    } catch (err: any) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('An error occured.')
        .setColor(EmbedData.ErrorColor);
      return interaction.reply({
        embeds: [embed],
      });
    }
  },
};
