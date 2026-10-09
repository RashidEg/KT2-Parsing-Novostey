const express = require('express');
const axios = require('axios');
const app = express();

app.set('views', __dirname);
app.set('view engine', 'ejs');

const names = {
    news: 'Новости',
    articles: 'Все материалы',
    issue: 'Последний номер газеты',
    characters: 'Действующие лица',
    investigation: 'Расследования',
    business: 'Бизнес',
    economics: 'Экономика',
    finance: 'Финансы',
    opinion: 'Мнения',
    politics: 'Политика',
    technology: 'Технологии',
    realty: 'Недвижимость',
    auto: 'Авто',
    menedzhment: 'Менеджмент',
    lifestyle: 'Стиль жизни',
};

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
});

app.get('/categories', (request, response) => {
    axios.get('https://www.vedomosti.ru/info/rss')
        .then(res => {
            let found = [];
            let re = /\/rss\/rubric\/([a-z0-9_-]+)/g;
            let m;
            while ((m = re.exec(res.data)) !== null) {
                if (!found.includes(m[1])) found.push(m[1]);
            }
            if (found.length == 0) found = Object.keys(names);
            response.json(found.map(slug => ({slug: slug, title: names[slug] || slug})));
        })
        .catch(() => {
            response.json(Object.keys(names).map(slug => ({slug: slug, title: names[slug]})));
        });
});

app.get('/:count/news/for/:category', (request, response) => {
    const count = parseInt(request.params.count, 10);
    const category = request.params.category;

    if (isNaN(count) || count <= 0) {
        return response.status(400).send('Ошибка: ЧИСЛО должно быть целым положительным числом.');
    }

    const options = {
        method: 'get',
        url: 'https://api.rss2json.com/v1/api.json',
        params: {rss_url: 'https://www.vedomosti.ru/rss/rubric/' + category}
    };

    axios(options)
        .then(res => {
            response.render('news', {
                count: count,
                category: names[category] || category,
                items: res.data.items.slice(0, count)
            });
        })
        .catch(error => response.send('Ошибка: ' + error.message));
});

app.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
});;