import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import EmbedData from '../config/EmbedData.json';

module.exports = {
  ...new SlashCommandBuilder().setName('help').setDescription('Get help with using commands'),
  run: async (client: any, interaction: any, args: any) => {
    try {
      const HelpEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Help`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `
      **Commands**
      /start - Create your Nexus wallet
      /balance - Check your wallets balance
      /deposit - Get the address of a chain to deposit to
      /withdraw - Withdraw some of your selected crypto to a specific address
      /tip - Send a user some crypto
      /getseed - Get your seed phrase
      /rain - Rain crypto on random users
      /help - Well you found this command lol
      `,
        )
        .setColor(EmbedData.SuccessColor)
        .setFooter({
          text: EmbedData.Footer,
        });
      return interaction.reply({
        embeds: [HelpEmbed],
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
