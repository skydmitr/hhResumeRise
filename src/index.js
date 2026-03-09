require('dotenv').config();

const { chromium } = require('playwright')
const { upResume } = require('./upResume/upResume.js');
const { auth } = require('./auth/auth.js');
const TelegramBot = require('node-telegram-bot-api')
const path = require('path');
const {resumeBoost} = require("./upResume/resumeBoost/resumeBoost");
const AUTH_FILE = path.join(__dirname, '/auth/hh-auth.json');

if (!process.env.BOT_TOKEN || !process.env.RESUME_URL || !process.env.HH_LOGIN) throw new Error('Проверьте .env, все ли переменные заполнены');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true}); //Прослушивание сообщений

async function run(chatId) {
    let browser = null;
    let context = null;
    let page = null;

    try {
        browser = await chromium.launch({ headless: false });

        const authResult = await auth(browser, bot, chatId);

        if (!authResult.success) {
            throw new Error('Авторизация не удалась');
        }

        if (authResult.page) {
            page = authResult.page;
            context = authResult.context;
        } else {
            context = await browser.newContext({
                storageState: AUTH_FILE
            });
            page = await context.newPage();
            await page.goto(process.env.RESUME_URL, { waitUntil: 'networkidle' });
        }

        await upResume(chatId, page, bot);
        await resumeBoost(chatId, page, bot, upResume);


    } catch (err) {
        await bot.sendMessage(chatId, `❌ Ошибка: ${err.message}`);
    }
}

bot.onText(/\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `Привет, я твой Бот-Напоминалка о поднятии резюме`)
    run(chatId);
})



