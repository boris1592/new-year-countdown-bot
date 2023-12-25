export default class Countdown {
  constructor(storage) {
    this.storage = storage;
  }

  async startCountdown(ctx) {
    const message = await ctx.reply("В ближайшее время здесь появится таймер.");

    // To make sure there's only one message per chat at a time
    this.storage.removeMessages(({ chatId }) => chatId === ctx.chat.id);
    this.storage.pushMessage({
      messageId: message.message_id,
      chatId: ctx.chat.id,
    });

    await this.storage.save();
  }

  async stopCountdown(ctx) {
    this.storage.removeMessages(({ chatId }) => chatId === ctx.chat.id);

    await this.storage.save();
  }

  async updateMessages(bot) {
    const messages = this.storage.getMessages();
    const newText = Countdown.generateMessage();
    const toRemove = [];

    await Promise.all(
      messages.map(async ({ messageId, chatId }) => {
        const result = await bot.telegram.editMessageText(
          chatId,
          messageId,
          null,
          newText,
        );

        // For some reason this is how the error is handled:
        // https://telegraf.js.org/classes/Telegram.html#editMessageText
        if (result === true) {
          toRemove.push({ messageId, chatId });
        }
      }),
    );

    this.storage.removeMessages(({ chatId, messageId }) =>
      toRemove.some(
        (message) =>
          message.messageId === messageId && message.chatId === chatId,
      ),
    );

    await this.storage.save();
  }

  static generateMessage() {
    const now = new Date();
    const currYear = now.getFullYear();
    const newYearDate = new Date(currYear + 1, 0);

    const diff = Math.floor(
      (newYearDate.getTime() - now.getTime()) / 1000 / 60,
    );

    const days = Math.floor(diff / 60 / 24);
    const hours = Math.floor(diff / 60) % 24;
    const minutes = diff % 60;

    return `До нового года ${days} д ${hours} ч ${minutes} мин`;
  }
}
