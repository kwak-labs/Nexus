const fs = require("fs");

/**
 * @param {Client} client
 */

module.exports = async (client) => {
  // Events
  fs.readdir(`./src/events/`, (err, files) => {
    if (err) throw err;
    let jsfiles = files.filter((f) => f.split(".").pop() === "js");

    if (jsfiles.length <= 0) return console.log("There are no events to load");
    console.log(`Loading ${jsfiles.length} events`);
    jsfiles.forEach((f, i) => {
      require(`../events/${f}`);
    });
  });

  fs.readdir(`./src/commands/`, (err, files) => {
    if (err) throw err;

    let js = files.filter((f) => f.split(".").pop() === "js");

    const arrayOfSlashCommands = [];
    js.map((value) => {
      const file = require(`../commands/${value}`);
      if (!file?.name) return;
      client.slashCommands.set(file.name, file);

      if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
      arrayOfSlashCommands.push(file);
    });
    client.on("ready", async () => {
      // Register for a single guild
      // await client.guilds.cache
      //   .get("1049783263956324462")
      //   .commands.set(arrayOfSlashCommands);
      // console.log(client.user.username);
      // Register for all the guilds the bot is in
      await client.application.commands.set(arrayOfSlashCommands);
    });
  });
};
