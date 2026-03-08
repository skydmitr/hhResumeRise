const {onLogin} = require("../onLogin/onLogin");

async function upResume(chatId, page, bot) {
    const profileLink = page.getByRole('link', {name: /Резюме и ?профиль/i});
    const time = (4 * 60 + 10) * 60 * 1000 // 4 часа 10 минут

    try {
        await profileLink.waitFor({ state: 'visible', timeout: 15000 });

        await profileLink.click();
        await bot.sendMessage(chatId, '✅ Успешно перешли на страницу с резюме.');
    } catch (err) {
        //Если профиль не виден авторизовываемся заново
        await bot.sendMessage(chatId, '⚠️ Профиль не виден → пробуем авторизоваться заново');
        await onLogin(page, bot, chatId);

        await profileLink.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
            throw new Error('❌ Не удалось убедиться, что авторизованы даже после повторной попытки');
        });
    }

    const nameResume = await page.locator('[data-qa="resume-title"]').textContent()
    const viewsResume = await page.locator('[data-qa="count-new-views"]').textContent();
    const invitationsResume = await page.locator('[data-qa="new-invitations"]').textContent();
    const updateNowResume = await page.locator('[data-qa="title-description"]').first().textContent();

     const myResume = {
        name: nameResume.trim(),
        updateNow: updateNowResume.replace(/^Обновлено\s+/i, '').trim(),
        views: viewsResume.replace(/\D/g, ''),
        invitations: invitationsResume.replace(/\D/g, '')
    }

    bot.sendMessage(chatId,
        `📋 *Твоё резюме*

📌 Название:     ${myResume.name || 'не указано'}
🕒 Обновлено:    ${myResume.updateNow || '—'}
👀 Просмотров:   ${myResume.views || '0'}
✉️ Приглашений:  ${myResume.invitations || '0'}`,

        {parse_mode: 'Markdown'});
        return  myResume;
}

module.exports = { upResume };