const INTERVAL = (4 * 60 + 10) * 60 * 1000; // 4 часа 10 минут в миллисекундах
//const INTERVAL = 10000; // для теста


//Функция парсинга строку "Обновлено: 6 марта 2026 в 19:07"
function getLastUpdateDate(updateStr) {
    if (!updateStr || updateStr === '—') return new Date(0);

    const match = updateStr.match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})\s+в\s+(\d{1,2}):(\d{2})/i);
    if (!match) return new Date(0);

    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const year = parseInt(match[3], 10);
    const hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);

    const months = {
        "января": 0, "февраля": 1, "марта": 2, "апреля": 3, "мая": 4,
        "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9,
        "ноября": 10, "декабря": 11
    };

    const month = months[monthStr];
    if (month === undefined) return new Date(0);

    return new Date(year, month, day, hours, minutes, 0, 0);
}

async function resumeBoost(chatId, page, bot, upResumeFn) {
    //Первый запуск — сразу
    try {
        console.log(`[${new Date().toLocaleString()}] Первый запуск`);
        await upResumeFn(chatId, page, bot);
    } catch (err) {
        console.error('Ошибка первого запуска:', err);
        await bot.sendMessage(chatId, `Ошибка при первом поднятии: ${err.message}`);
    }

    //Периодический запуск каждые 4 ч 10 мин
    setInterval(async () => {
        try {
            console.log(`[${new Date().toLocaleString()}] Периодическое поднятие`);

            //Вызывает функцию и получает свежие данные
            const myResume = await upResumeFn(chatId, page, bot);

            //Парсит время последнего обновления
            const lastTime = getLastUpdateDate(myResume.updateNow);
            const now = new Date();
            const diffMs = now - lastTime;

            console.log(`Прошло с последнего обновления: ${Math.floor(diffMs / 3600000)} ч ${Math.floor((diffMs % 3600000) / 60000)} мин`);

        } catch (err) {
            console.error('Ошибка в планировщике:', err);
            await bot.sendMessage(chatId, `Ошибка при периодическом поднятии: ${err.message}`);
        }
    }, INTERVAL);
}

module.exports = { resumeBoost };