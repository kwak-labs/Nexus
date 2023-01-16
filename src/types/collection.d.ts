import { Collection } from 'discord.js';

module 'discord.js' {
  export interface Client {
    slashCommands: Collection<unknown, any>;
  }
}
