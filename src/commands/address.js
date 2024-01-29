const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const EmbedData = require("../config/EmbedData.json");

/* Awesome bridge functions */
const { ChainData, Bridge, OptionBuilder } = require("../bridge");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Get your Nexus address")
    .addStringOption((option) =>
      option
        .setName("coin")
        .setDescription("What address do you want to get?")
        .setRequired(true)
        .addChoices(...OptionBuilder)
    ),
  run: async (
    client,
    /**
     * @type {import('discord.js').ChatInputCommandInteraction}
     */ interaction,
    args,
    userData
  ) => {
    await interaction.deferReply({ ephemeral: true });
    try {
      const coin = interaction.options.getString("coin");
      let bridge = await new Bridge(
        ChainData[coin],
        userData.mnemonic
      )._initialize();

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
    } catch (err) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("An error occured when fetching your balance")
        .setColor(EmbedData.ErrorColor);
      return interaction.editReply({
        embeds: [embed],
      });
    }
  },
};
