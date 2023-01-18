import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import accounts from '../Models/accounts';
import EmbedData from '../config/EmbedData.json';
import Emojis from '../config/Emojis.json';
import { rainWinners } from '../helpers/rainWinnder';

/* Awesome bridge functions */
import { ChainData, Bridge, OptionBuilder } from '../bridge';

module.exports = {
  ...new SlashCommandBuilder()
    .setName('rain')
    .setDescription('Let it rain on some dudes')
    .addStringOption((option) =>
      option
        .setName('coin')
        .setDescription('What coin do you want to rain?')
        .setRequired(true)
        .addChoices(...OptionBuilder),
    )
    .addNumberOption((option) =>
      option.setName('amount').setDescription('Amount of that coin to send?').setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName('users').setDescription('How many users do you want to rain to?').setRequired(true),
    )
    .addStringOption((option) => option.setName('memo').setDescription('Transaction memo').setRequired(false)),
  run: async (client: any, interaction: ChatInputCommandInteraction, args: any) => {
    try {
      const coin: string = interaction.options.getString('coin')!;
      const amount: number = interaction.options.getNumber('amount')!;
      const users: number = interaction.options.getInteger('users', true);
      const memo: string = interaction.options.getString('memo')!;

      let data = await accounts.findOne({
        uid: interaction.user.id,
      });
      if (!data) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `No Account`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('You cant make it rain without an account')
          .setColor(EmbedData.ErrorColor)
          .setFooter({ text: EmbedData.Footer });
        return await interaction.reply({
          embeds: [embed],
        });
      }

      //@ts-ignore

      let bridge = await new Bridge(ChainData[coin], data.mnemonic)._initialize();

      let balance = await bridge.getBalance();

      if (parseInt(balance.base) < bridge.assetToBase(amount.toString())) {
        const FailedRain = new EmbedBuilder()
          .setAuthor({
            name: `Failed Rain`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription('Your trying to rain more than you have!')
          .setColor(EmbedData.ErrorColor)
          .setFooter({ text: EmbedData.Footer });
        return await interaction.reply({
          embeds: [FailedRain],
          ephemeral: true,
        });
      }

      let allNexusUsers = await accounts.find({
        guilds: interaction.guild!.id,
      });

      if (allNexusUsers.length < users) {
        const FailedRain = new EmbedBuilder()
          .setAuthor({
            name: `Failed Rain`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(`Your trying to rain more users than have nexus account. Limit is ${allNexusUsers.length}!`)
          .setColor(EmbedData.ErrorColor)
          .setFooter({ text: EmbedData.Footer });
        return await interaction.reply({
          embeds: [FailedRain],
          ephemeral: true,
        });
      }

      let amountPerUser = (amount / users).toFixed(6).toString();

      let winners = rainWinners(users, allNexusUsers.length);

      let messages: any = [];
      let userIds: string[] = [];
      for (let i = 0; i < winners.length; i++) {
        let winnerIndex = winners[i];

        //@ts-ignore
        let winnerBridge = new Bridge(ChainData[coin], allNexusUsers[winnerIndex - 1].mnemonic);
        await winnerBridge._initialize();

        let address = await winnerBridge.getAddress();

        userIds.push(`<@${allNexusUsers[winnerIndex - 1].uid}>`);
        messages.push({
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',

          value: {
            fromAddress: await bridge.getAddress(),
            toAddress: address,
            amount: [
              {
                denom: winnerBridge.chain.denom,
                amount: bridge.assetToBase(amountPerUser.toString()).toString(),
              },
            ],
          },
        });
      }

      const ProccessingRainEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Raining ${coin}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `${Emojis.Jump_load} Please wait while your rain is processed on the next block ${Emojis.Jump_load}`,
        )
        .setColor(EmbedData.SuccessColor)
        .setFooter({ text: EmbedData.Footer });
      await interaction.reply({
        embeds: [ProccessingRainEmbed],
      });

      let rainTx = bridge.rain(messages, amount.toString(), memo).then(async (response) => {
        if (response.error == 'nogas') {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `No Gas`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(response.message)
            .setColor(EmbedData.ErrorColor)
            .setFooter({ text: EmbedData.Footer });
          return await interaction.followUp({
            embeds: [embed],
          });
        }

        const WinningContent = userIds.join(', ');
        const SuccessSend = new EmbedBuilder()
          .setAuthor({
            name: `Successful Rain`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `${interaction.user} has just rained **${amount} ${coin}** (*$${(
              await bridge.getUsdByAsset(amount)
            ).toFixed(3)}*) on ${users} users
            
            Each user will recieve **${amountPerUser} ${coin}** (*$${(
              await bridge.getUsdByAsset(parseInt(amountPerUser))
            ).toFixed(3)}*)
            `,
          )
          .setColor(EmbedData.SuccessColor)
          .setFooter({
            text: `TX Hash: ${response}`,
          });
        return await interaction.editReply({
          embeds: [SuccessSend],
          content: WinningContent,
        });
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
