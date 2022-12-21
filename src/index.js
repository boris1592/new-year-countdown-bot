const { Telegraf } = require('telegraf');
const { CronJob } = require('cron');
const { config } = require('dotenv');
const { readFileSync, writeFileSync, existsSync } = require('fs');

if (!existsSync('data.json')) {
  writeFileSync('data.json', '{}');
}

config();
const chatMessages = JSON.parse(readFileSync('data.json').toString());

function saveData() {
  writeFileSync('data.json', JSON.stringify(chatMessages));
}

function addLeadingZeros(number, totalLength) {
  return String(number).padStart(totalLength, '0');
}

const bot = new Telegraf(process.env.TOKEN);

bot.command('start_countdown', async (ctx) => {
  chatMessages[ctx.chat.id] = (
    await ctx.reply('В ближайшее время тут появится таймер')
  ).message_id;
  saveData();
});

bot.command('stop_countdown', (ctx) => {
  if (ctx.chat.id in chatMessages) delete chatMessages[ctx.chat.id];
  saveData();
});

bot.launch();

const job = new CronJob('* * * * *', () => {
  const now = new Date();
  const newYear = new Date(now.getFullYear() + 1, 0);
  const remainingTime = Math.floor(
    (newYear.getTime() - now.getTime()) / (1000 * 60),
  );

  const days = addLeadingZeros(Math.floor(remainingTime / 60 / 24), 2);
  const hours = addLeadingZeros(Math.floor((remainingTime / 60) % 24), 2);
  const minutes = addLeadingZeros(remainingTime % 60, 2);
  const message = `До нового года осталось: ${days}:${hours}:${minutes}`;
  const toRemove = [];

  for (const chatId in chatMessages) {
    try {
      bot.telegram.editMessageText(chatId, chatMessages[chatId], null, message);
    } catch (e) {
      toRemove.push(chatId);
    }
  }

  for (const chatId of toRemove) {
    delete chatMessages[chatId];
  }

  saveData();
});

job.start();
