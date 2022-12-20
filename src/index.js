const { Telegraf } = require('telegraf');
const { config } = require('dotenv');
const { CronJob } = require('cron');

config();

const bot = new Telegraf(process.env.TOKEN);
const chatMessages = {};

function addLeadingZeros(number, totalLength) {
  return String(number).padStart(totalLength, '0');
}

bot.command('start_countdown', async (ctx) => {
  chatMessages[ctx.chat.id] = (
    await ctx.reply('В ближайшее время тут появится таймер')
  ).message_id;
});

bot.command('stop_countdown', (ctx) => {
  if (ctx.chat.id in chatMessages) delete chatMessages[ctx.chat.id];
});

bot.launch();

const job = new CronJob('* * * * *', () => {
  const now = new Date();
  const newYear = new Date(process.env.YEAR, 0);
  const remainingTime = Math.floor(
    (newYear.getTime() - now.getTime()) / (1000 * 60),
  );

  const days = addLeadingZeros(Math.floor(remainingTime / 60 / 24), 2);
  const hours = addLeadingZeros(Math.floor((remainingTime / 60) % 24), 2);
  const minutes = addLeadingZeros(remainingTime % 60, 2);
  const message = `До нового года осталось: ${days}:${hours}:${minutes}`;

  for (const chatId in chatMessages) {
    bot.telegram.editMessageText(chatId, chatMessages[chatId], null, message);
  }
});

job.start();
