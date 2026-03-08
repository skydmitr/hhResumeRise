require('dotenv').config();
async function onLogin(page) {

    await page.goto(process.env.RESUME_URL, { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: 'Войти' }).click()
    await page.getByRole('button', { name: 'Войти' }).click();
    await page.getByText('Почта').first().click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill(process.env.HH_LOGIN)
    await page.getByRole('button', { name: 'Дальше' }).click();
}

module.exports = { onLogin };