const fs = require('fs');
const path = require('path');
const { onLogin } = require("../onLogin/onLogin");
const { waitForCode } = require("../waitForCode/waitForCode");

const AUTH_FILE = path.join(__dirname, 'hh-auth.json');

async function auth(browser, bot, chatId) {
    //Проверяет свежую сохранённую сессию
    if (fs.existsSync(AUTH_FILE)) {
        const stats = fs.statSync(AUTH_FILE);
        const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

        if (ageHours < 24) {
            await bot.sendMessage(chatId,
                `Используем сохранённую авторизацию (возраст: ${ageHours.toFixed(1)} ч)`
            );
            return {success: true, page: null};
        }
    }

    await bot.sendMessage(chatId, 'Требуется авторизация...');

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await bot.sendMessage(chatId, 'Выполняем вход...');
        await onLogin(page);

        await bot.sendMessage(chatId, 'Введите код подтверждения из письма HH');
        const codeUser = await waitForCode(chatId, bot);

        await page.getByRole('textbox').fill(codeUser);

        await page.waitForLoadState('networkidle', {timeout: 20000}).catch(() => {
        });

        //Проверяет успешный вход
        const profileLink = page.getByRole('link', {name: /Резюме и ?профиль/i});

        if (await profileLink.isVisible({timeout: 15000})) {
            await bot.sendMessage(chatId, '✅ Успешная авторизация');
        } else {
            throw new Error('❌ Авторизация не удалась — профиль не появился');
        }

        await context.storageState({path: AUTH_FILE});

        await bot.sendMessage(chatId,
            `Авторизация прошла успешно!\nСостояние сохранено в ${AUTH_FILE}`
        );

        return true;

    } catch (err) {
        await bot.sendMessage(chatId, `Ошибка авторизации: ${err.message}`);
        console.error(err);
        await context.close().catch(() => {
        });
        return {success: false, page: null, context: null};
    }
}

module.exports = { auth };