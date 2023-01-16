import { Schema, model } from 'mongoose';

let AccountSchema = new Schema({
  uid: String,
  mnemonic: String,
  guilds: [],
});

export default model('Users', AccountSchema);
