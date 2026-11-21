// Кейс із sales-machine.team/stati/leshchi-developeram — для наповнення бази (npm run db:seed).
import type { SeedCase } from "./types";

const leshchi: SeedCase = {
  "slug": "leshchi-developeram",
  "title": "Ростовчане надают лещей девелоперам из Москвы и Питера",
  "seoTitle": "Лещи девелоперам",
  "description": "Видео «Ростовские маркетологи надают лещей девелоперам из Питера и Москвы»: 124 000 просмотров при бюджете 3 000 рублей.",
  "cats": [
    "pr"
  ],
  "cta": "Хочу иммерсивный офис продаж",
  "publishedAt": "2024-02-26T12:00:00.000Z",
  "blocks": [
    {
      "type": "text",
      "label": "Задача:",
      "body": "Организаторы первого в России дискуссионного бэттла между застройщиками из Питера и Москвы позвали нашу команду Sales Machine в качестве судей. Мы начали думать, как подсветить нашу группу как экспертов, которых привлекают для оценки столичных девелоперов."
    },
    {
      "type": "text",
      "label": "Реализация:",
      "body": "Исходя из донского колорита, мы придумали яркий заголовок «Ростовские маркетологи надают лещей девелоперам из Питера и Москвы». Получилось иммерсивно и ярко. Далее мы сняли видеоролик по этой теме и разместили его в своем блоге. Посыл получился таким вовлекающим, что региональные СМИ подхватили и растиражировали наши посты из соцсетей в своих каналах."
    },
    {
      "type": "video",
      "src": "https://rutube.ru/play/embed/14e224f7bcc2d1b1739cb0d48c7045b5/?p=H80U-fOAnnKKR7dAn9LUgw",
      "format": "wide"
    },
    {
      "type": "text",
      "label": "Результат:",
      "body": "Бюджет на съемку: 3 000 рублей\nБюджет на продвижение: 0 рублей\nСовокупное количество просмотров: 124 000\nER: 5%"
    },
    {
      "type": "text",
      "label": "Телеграм:",
      "body": "[https://t.me/yug_rf/7439](https://t.me/yug_rf/7439)\n[https://t.me/privet_rostov_ru/27778](https://t.me/privet_rostov_ru/27778)\n[https://t.me/cheRostov/7549](https://t.me/cheRostov/7549)\n[https://t.me/kp_rostov/15245](https://t.me/kp_rostov/15245)\n[https://t.me/yug_rf/7444](https://t.me/yug_rf/7444)"
    },
    {
      "type": "text",
      "label": "ВКонтакте:",
      "body": "[https://vk.com/wall-73738995_523114](https://vk.com/wall-73738995_523114)\n[https://vk.com/wall-41225457_132229](https://vk.com/wall-41225457_132229)\n[https://vk.com/privetrostovdon?w=wall-73738995_523064](https://vk.com/privetrostovdon?w=wall-73738995_523064)\n[https://vk.com/privetrostovdon?w=wall-73738995_523114](https://vk.com/privetrostovdon?w=wall-73738995_523114)"
    },
    {
      "type": "text",
      "label": "Сайты:",
      "body": "[https://www.rostov.kp.ru/online/news/5492736/](https://www.rostov.kp.ru/online/news/5492736/)\n[https://dzen.ru/a/ZSVQRtaBAXWQkEnl?referrer_clid=1400&](https://dzen.ru/a/ZSVQRtaBAXWQkEnl?referrer_clid=1400&)\n[https://privet-rostov.ru/main/94449-rostovchane-nadajut-leschej-moskve-i-piteru.html](https://privet-rostov.ru/main/94449-rostovchane-nadajut-leschej-moskve-i-piteru.html)"
    }
  ]
};

export default leshchi;
