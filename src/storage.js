import { JSONPreset } from "lowdb/node";

export default class MessageStorage {
  constructor(path) {
    this.initDb(path);
  }

  async initDb(path) {
    this.db = await JSONPreset(path, { messages: [] });
  }

  getMessages() {
    return this.db.data.messages;
  }

  pushMessage(message) {
    this.db.data.messages.push(message);
  }

  removeMessages(perdicate) {
    this.db.data.messages = this.db.data.messages.filter(
      (msg) => !perdicate(msg),
    );
  }

  async save() {
    await this.db.write();
  }
}
