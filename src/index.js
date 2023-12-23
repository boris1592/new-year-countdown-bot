import { config } from "dotenv";
import { Telegraf } from "telegraf";
import { CronJob } from "cron";
import MessageStorage from "./storage.js";
import Countdown from "./countdown.js";

function buildDeps() {
  const bot = new Telegraf(process.env.TOKEN);
  const storage = new MessageStorage("messages.json");
  const countdown = new Countdown(storage);

  return { bot, storage, countdown };
}

function startBot() {
  const { bot, countdown } = buildDeps();

  bot.command("start_countdown", (ctx) => countdown.startCountdown(ctx));
  bot.command("stop_countdown", (ctx) => countdown.stopCountdown(ctx));
  bot.launch();

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  const job = new CronJob("* * * * *", () => countdown.updateMessages(bot));
  job.start();
}

config();
startBot();
