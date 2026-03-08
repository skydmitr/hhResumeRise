async function waitForCode(chatId, bot) {
    return new Promise((resolve, reject) => {

        const timer = setTimeout(() => {
            reject(new Error('Время ожидания истекло'));
        }, 120000);

        bot.on('message', (msg) => {
            if (msg.chat.id !== chatId) return;

            if (!/^\d{4,6}$/.test(msg.text)) {
                clearTimeout(timer);
                reject(new Error('Неверный формат кода'));
                return;
            }

            clearTimeout(timer);
            resolve(msg.text);
        });
    });
}

module.exports = { waitForCode };