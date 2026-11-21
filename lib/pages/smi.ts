// Публікації в СМИ (перенесено з sales-machine.team/stati-v-smi). Пізніше — з CMS.
// Внутрішні статті (/stati…) поки ведуть на старий сайт.

export type Article = { year: string; title: string; href: string };

export const SMI_PAGE = {
  word: "Статьи в СМИ",
  // У оригіналі заголовка не було; беремо підзаголовок цього пункту зі стрічки на головній.
  title: "О нас пишут с 2016 года",
  cta: "Клик, который поможет бизнесу",
  contact: {
    title: "Привет, это Вадим.",
    text: "Можно бесконечно читать статьи про нас, но текст никогда не передаст потрясающей энергетики от взаимного общения. Самое время начать сейчас!",
  },
};

export const ARTICLES: readonly Article[] = [
  { year: "2026", title: "Проблемы с неймингом", href: "https://vc.ru/id959816/3138339-zhiloy-kompleks-gorizont-problemy-s-neimingom" },
  { year: "2026", title: "Иммерсивное продвижение территорий", href: "https://vc.ru/id307169/3164396-immersivnoe-prodvizhenie-territorii-perezapusk-brenda-rostov-na-donu" },
  { year: "2026", title: "Sales Machine и ГАРД (гильдия архитекторов Ростова-на-Дону)", href: "https://t.me/gardrnd/130" },
  { year: "2025", title: "Дефицит офисов в Ростове-на-Дону. Эксперт Sales Machine рассказывает о причинах кризиса", href: "https://t.me/RostovInside/28844" },
  { year: "2025", title: "Премия РБК: лучший ребрендинг 2024 года от команды Sales Machine", href: "https://t.rbc.ru/tyumen/05/03/2025/67c6f77d9a79470349011216#:~:text=%D0%B2%20%D0%BD%D0%BE%D0%BC%D0%B8%D0%BD%D0%B0%D1%86%D0%B8%D0%B8%20%C2%AB%D0%A0%D0%B5%D0%B1%D1%80%D0%B5%D0%BD%D0%B4%D0%B8%D0%BD%D0%B3%20%D0%B3%D0%BE%D0%B4%D0%B0%C2%BB%20%D0%BE%D1%82%D0%BC%D0%B5%D1%87%D0%B5%D0%BD%D1%8B%20%D0%BE%D0%B1%D0%B0%20%D0%BD%D0%BE%D0%BC%D0%B8%D0%BD%D0%B0%D0%BD%D1%82%D0%B0%C2%A0%E2%80%94%20%D0%B4%D0%B5%D0%B2%D0%B5%D0%BB%D0%BE%D0%BF%D0%B5%D1%80%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D1%8F%20%7B%D0%A5%D0%B0%D1%80%D0%B8%D0%B7%D0%9C%D0%AB%7D" },
  { year: "2025", title: "Sales Machine передает знания поколению «Большого пальца»", href: "https://philology.sfedu.ru/ob-institute/blog/novosti/917-v-ifzhimkk-proshla-vstrecha-studentov-s-osnovatelyami-shkoly-sales-machine.html" },
  { year: "2025", title: "Гильдия маркетологов. Рецензия на книгу «Иммерсивный маркетинг. Хищные продажи»", href: "https://www.marketologi.ru/publikatsii/retsenzii/6405/" },
  { year: "2025", title: "Sales Machine и Артемий Лебедев хедлайнеры ЕФорума, г. Красноярск", href: "https://krasnoyarsk.dk.ru/news/237216801#:~:text=%D0%92%20%D1%8D%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BD%D0%BE%D0%BC%20%D0%BF%D1%83%D0%BB%D0%B5%20%E2%80%94%20%D0%90%D1%80%D1%82%D0%B5%D0%BC%D0%B8%D0%B9%20%D0%9B%D0%B5%D0%B1%D0%B5%D0%B4%D0%B5%D0%B2%2C%20%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B0%20Sales%20Machine%2C%20%D0%A1%D1%82%D0%B0%D0%BD%D0%B8%D1%81%D0%BB%D0%B0%D0%B2%20%D0%A2%D0%B5%D0%BD" },
  { year: "2024", title: "Ребрендинг {ХаризМЫ} от Sales Machine вошел в тройку лучших среди девелоперов России", href: "https://t.me/dvizhenieru/5486" },
  { year: "2024", title: "Эксперты рынка о ребрендинге от Sales Machine", href: "https://dvizhenie.ru/media/1014/rebrending-developerov-trendy-i-oshibki#:~:text=%D0%98%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D0%BD%D1%8B%D0%B9%20%D0%BA%D0%B5%D0%B9%D1%81%20%D1%83%C2%A0%E2%80%9E%D0%A5%D0%B0%D1%80%D0%B8%D0%B7%D0%BC%D1%8B%E2%80%9C%20%D1%81%C2%A0%D1%82%D0%B0%D1%82%D1%83%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0%D0%BC%D0%B8%20%D0%BD%D0%BE%D0%B2%D0%BE%D0%B3%D0%BE%20%D0%B1%D1%80%D0%B5%D0%BD%D0%B4%D0%B0.%20%D0%9E%D0%BD%D0%B8%20%D0%BF%D0%BE%D1%88%D0%BB%D0%B8%20%D0%B2%C2%A0%D0%BD%D0%B5%D1%81%D1%82%D0%B0%D0%BD%D0%B4%D0%B0%D1%80%D1%82%D0%BD%D1%83%D1%8E%20%D0%B4%D0%BB%D1%8F%20%D0%BF%D0%BE%D0%BA%D0%B0%20%D0%B5%D1%89%D0%B5%20%D0%BA%D0%BE%D0%BD%D1%81%D0%B5%D1%80%D0%B2%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%BE%D0%B3%D0%BE%20%D0%B4%D0%B5%D0%B2%D0%B5%D0%BB%D0%BE%D0%BF%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%20%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8E%2C%20%D1%87%D0%B5%D0%BC%20%D0%B8%C2%A0%D0%B2%D1%8B%D0%B7%D0%B2%D0%B0%D0%BB%D0%B8%20%D1%88%D0%BA%D0%B2%D0%B0%D0%BB%20%D1%80%D0%B0%D0%B7%D0%BD%D0%BE%D0%B3%D0%BE%20%D1%80%D0%BE%D0%B4%D0%B0%20%D0%BA%D0%BE%D0%BC%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B8%D0%B5%D0%B2%20%D0%B2%C2%A0%D1%82%D0%B5%D0%BB%D0%B5%D0%B3%D1%80%D0%B0%D0%BC%2D%D0%BA%D0%B0%D0%BD%D0%B0%D0%BB%D0%B0%D1%85%C2%BB%2C%C2%A0%E2%80%94%20%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%B8%D1%82%20%D0%9A%D0%BE%D0%B2%D0%B0%D0%BB%D0%B5%D0%BD%D0%BA%D0%BE" },
  { year: "2024", title: "Возможно, это лучший ребрендинг страны!", href: "https://t.me/kolonka_teamohina/156" },
  { year: "2024", title: "Как необычно презентовать команде новое имя компании?", href: "https://t.me/MAXIM_all/34600" },
  { year: "2024", title: "WOW Awards — а судьи кто?", href: "https://www.sales-machine.team/stati-v-smi/wow-awards---a-sudi-kto" },
  { year: "2024", title: "Нетривиальная презентация нового имени девелопера другим участникам рынка", href: "https://t.me/MAXIM_all/34927" },
  { year: "2023", title: "Про нас в Википедии", href: "https://ru.wikipedia.org/wiki/%D0%98%D0%BC%D0%BC%D0%B5%D1%80%D1%81%D0%B8%D0%B2%D0%BD%D1%8B%D0%B9_%D0%BC%D0%B0%D1%80%D0%BA%D0%B5%D1%82%D0%B8%D0%BD%D0%B3#:~:text=%D1%83%D1%81%D1%82%D0%B0%D1%80%D0%B5%D0%BB%D0%B8%20%D0%B8%D0%BB%D0%B8%20%D0%BE%D1%82%D1%81%D1%83%D1%82%D1%81%D1%82%D0%B2%D1%83%D1%8E%D1%82.-,%D0%98%D0%BC%D0%BC%D0%B5%D1%80%D1%81%D0%B8%D0%B2%D0%BD%D1%8B%D0%B9%20%D0%BC%D0%B0%D1%80%D0%BA%D0%B5%D1%82%D0%B8%D0%BD%D0%B3%20%D0%B2%20%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D0%B8,-%5B%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%20%7C" },
  { year: "2023", title: "Подкаст: «Иммерсивный маркетинг»", href: "https://www.youtube.com/watch?v=VwWyF68F4xA" },
  { year: "2023", title: "PornHub написал о команде Sales Machine в Википедии", href: "https://ru.wikipedia.org/wiki/Pornhub#:~:text=%D0%9D%D0%B0%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80%2C%20%D0%BA%D0%B5%D0%B9%D1%81%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8-,Sales%20Machine,-%D0%BF%D0%BE%20%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6%D0%B5%20%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80" },
  { year: "2023", title: "Иммерсивный маркетинг: от подставных бабушек до PornHub", href: "https://vc.ru/marketing/722173-immersivnyy-marketing-ot-podstavnyh-babushek-do-pornhub-kak-teatr-tolko-deneg-bolshe" },
  { year: "2023", title: "Кто убил Маркетинг: «новые» правила борьбы за потребителей", href: "https://vc.ru/marketing/678663-kto-ubil-marketing-novye-pravila-borby-za-potrebiteley" },
  { year: "2023", title: "Презентация нашей книги «Иммерсивный маркетинг»", href: "https://www.rostov.kp.ru/online/news/5221235/" },
  { year: "2023", title: "Как мы создали подделку, которая порвала оригинал", href: "https://vc.ru/marketing/577374-feyki-rulyat-istoriya-odnoy-poddelki-kotoraya-prevzoshla-original" },
  { year: "2022", title: "Наш обзор на номинантов маркетинга в девелопменте WOW Awards", href: "https://vc.ru/u/959816-sales-machine-team/497302-zavtra-final-wow-awards-reklama-v-sfere-developmenta" },
  { year: "2022", title: "Как заработать на понтах", href: "https://vc.ru/u/959816-sales-machine-team/489918-ponty-rulyat-ili-reklamnaya-kampaniya-v-turcii" },
  { year: "2022", title: "Как мы «бодались» с директором по маркетингу «Самолета»", href: "https://vc.ru/marketing/352224-toksichnaya-marketing-tusovka-kak-u-nominalnogo-direktora-po-marketingu-samoleta-podgorelo-ot-nashego-keysa" },
  { year: "2022", title: "Унылый нейминг российских жилых комплексов", href: "https://vc.ru/marketing/334550-unylyy-neyming-zastroyshchikov-anton-zhk-ili-sobstvennik" },
  { year: "2022", title: "Продажи на Порнхаб собрали почти 50 000 просмотров на vc", href: "https://vc.ru/marketing/199485-prodali-na-pornhub-4-kvartiry-v-semeynom-zhilom-komplekse" },
  { year: "2022", title: "Режиссер креативной команды Sales Machine победил на фестивале архитектурного кино в Венеции", href: "https://www.donnews.ru/film-rostovskogo-rezhissera-pobedil-na-festivale-arhitekturnogo-kino-v-venetsii_59950007" },
  { year: "2021", title: "Победа на ReMovie Awards", href: "https://privet-rostov.ru/main/72288-luchshij-rezhisser-korotkometrazhnogo-kino-zhivet-i-tvorit-v-rostove.html" },
  { year: "2021", title: "Мы номер 1 в роликах про недвижимость", href: "https://www.donnews.ru/na-krupnom-festivale-videoreklamy-v-moskve-neizvestnye-ukrali-u-rostovchan-prizovuyu-tarelku_81314820" },
  { year: "2021", title: "Я заплатил уборщице и достал контакты из мусорки", href: "https://vc.ru/u/463645-biznes-roboty-mechty/296682-ya-zaplatil-uborshchice-i-dostal-kontakty-iz-musorki-kak-podgotovitsya-k-peregovoram-s-investorom" },
  { year: "2020", title: "Хорошему продукту нужен эмоциональный шампур", href: "https://gorodn.ru/razdel/novosti_kompaniy/praktika_biznesa/31617/" },
  { year: "2020", title: "Зачем застройщикам работать с брокерами и агентствами недвижимости", href: "https://dzen.ru/a/XtYZoNrX2AIa-nct#:~:text=%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE%2C%20%D1%83%D1%87%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8%20Sales%20Machine%20%E2%80%94%20%D0%BC%D0%B0%D1%80%D0%BA%D0%B5%D1%82%D0%B8%D0%BD%D0%B3%20%D0%BD%D0%B5%D0%B4%D0%B2%D0%B8%D0%B6%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D0%B8%20%D0%B4%D0%BB%D1%8F%20%D0%B7%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D1%89%D0%B8%D0%BA%D0%BE%D0%B2%3A" },
  { year: "2020", title: "Как изменится рынок недвижимости в 2020 году", href: "https://news.myseldon.com/ru/news/index/234094342#:~:text=%D0%B2%D0%BB%D0%B8%D1%8F%D0%B5%D1%82%20%C2%AB%D0%B3%D0%BB%D1%83%D0%B1%D0%B8%D0%BD%D0%BD%D1%8B%D0%B9%20%D1%87%D0%B8%D0%BD%D0%BE%D0%B2%D0%BD%D0%B8%D0%BA%C2%BB-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%2C%20%D1%83%D1%87%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%2C%20Sales%20Machine" },
  { year: "2020", title: "Канал продаж Robot-to-Consumer (R2C). Новый термин от команды Sales Machine", href: "https://bit.samag.ru/archive/article/2314" },
  { year: "2020", title: "Вебинар «3 Парадокса и 3 волшебные таблетки для продажи недвижимости во время пандемии»", href: "https://m.asninfo.ru/press-releases/486-vebinar-3-paradoksa-i-3-volshebnyye-tabletki-dlya-prodazhi-nedvizhimosti-vo-vremya-pandemii" },
  { year: "2020", title: "Победа на WOW Awards (Москва)", href: "https://www.rostov.kp.ru/online/news/4014082/" },
  { year: "2020", title: "Кейс на Cannes Lions", href: "https://www.youtube.com/watch?v=XAARVy-GJ4s" },
  { year: "2020", title: "Карантин и элитная недвижимость", href: "https://dzen.ru/a/XqqPiKORuHVTlVl5#:~:text=%D1%87%D1%82%D0%BE%2D%D0%BB%D0%B8%D0%B1%D0%BE%20%D0%B4%D1%80%D1%83%D0%B3%D0%BE%D0%B5.-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%2C%20%D1%83%D1%87%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%20%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8%20Sales" },
  { year: "2020", title: "Факторы влияния на рынок недвижимости в 2020", href: "https://www.e-xecutive.ru/finance/investment/1991947-kak-izmenitsya-rynok-nedvizhimosti-v-2020-godu?scrolltop=2367" },
  { year: "2020", title: "Аналитика в жилой недвижимости в 2020", href: "https://news.ners.ru/kak-izmenitsya-rynok-nedvizhimosti-v-2020-godu.html#:~:text=%D0%B2%D0%BB%D0%B8%D1%8F%D0%B5%D1%82%20%C2%AB%D0%B3%D0%BB%D1%83%D0%B1%D0%B8%D0%BD%D0%BD%D1%8B%D0%B9%20%D1%87%D0%B8%D0%BD%D0%BE%D0%B2%D0%BD%D0%B8%D0%BA%C2%BB-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%2C%20%D1%83%D1%87%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%2C%20Sales%20Machine" },
  { year: "2020", title: "Наружная реклама в век диджитал", href: "https://bankstoday.net/last-articles/vse-samoe-vazhnoe-o-reklame-na-bilbordah-tseny-effektivnost-plyusy-i-minusy-mneniya-ekspertov#:~:text=%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D0%B0%D1%85%20%D0%B0%D0%BD%D0%B0%D0%BB%D0%BE%D0%B3%D0%B8%D1%87%D0%BD%D0%B0%D1%8F.%20%D0%9D%D0%B0%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80%2C-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%2C%20%D1%83%D1%87%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%20Sales%20Machine" },
  { year: "2019", title: "История внедрения инноваций в недвижимости", href: "https://promo-bot.ru/review/istoriya-biznes-gruppy-inpk/" },
  { year: "2019", title: "Региональная аналитика в секторе жилой недвижимости", href: "https://gorodn.ru/razdel/rynki/nedvizhimost/23838/" },
  { year: "2019", title: "Аналитика загородной недвижимости. Коттеджи ждут восстановления спроса", href: "https://www.kommersant.ru/doc/3383231#:~:text=%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6%20%C2%AB%D0%98%D0%9D%D0%9F%D0%9A%20%D0%94%D0%B5%D0%B2%D0%B5%D0%BB%D0%BE%D0%BF%D0%BC%D0%B5%D0%BD%D1%82%C2%BB-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%D0%B7%D0%B0%D1%8F%D0%B2%D0%BB%D1%8F%D0%B5%D1%82%2C%20%D1%87%D1%82%D0%BE%20%D0%B2" },
  { year: "2019", title: "Технологии «умного дома» на рынке недвижимости: варианты и решения от застройщиков", href: "https://repinlife.ru/texnologii-umnogo-doma-na-rynke-nedvizhimosti-varianty-i-resheniya-ot-zastrojshhikov/#:~:text=%D1%84%D0%BE%D1%80%D0%BC%D0%B8%D1%80%D1%83%D0%B5%D1%82%20%D0%BB%D0%BE%D1%8F%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5%20%D0%BA%D0%BE%D0%BC%D1%8C%D1%8E%D0%BD%D0%B8%D1%82%D0%B8.-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%2C%20%D1%83%D1%87%D1%80%D0%B5%D0%B4%D0%B8%D1%82%D0%B5%D0%BB%D1%8C" },
  { year: "2018", title: "Детали победы на European Property Awards", href: "/stati/detali-pobedy-na-european-property-awards" },
  { year: "2018", title: "Соединили офлайн + онлайн и опередили план продаж в 3 раза!", href: "https://banditomag.ru/kejs-kak-prodavat-kvartiry-bez-kontekstnoj-reklamy/" },
  { year: "2017", title: "Премиум-сегмент в провинциальной недвижимости", href: "https://plus.rbc.ru/news/5a40b3e17a8aa9087692e7da" },
  { year: "2017", title: "Региональная аналитика элит и премиум класса. Штучный метр", href: "https://www.kommersant.ru/doc/3337878#:~:text=%D1%8D%D1%82%D0%BE%D0%BC%20%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%B8%D1%82%20%D0%B8-,%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE,-%3A%20%C2%AB%D0%A4%D0%BE%D1%80%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%B1%D0%BB%D0%B0%D0%B3%D0%BE%D0%BF%D1%80%D0%B8%D1%8F%D1%82%D0%BD%D0%BE%D0%B3%D0%BE%20%D1%81%D0%BE%D1%81%D0%B5%D0%B4%D1%81%D0%BA%D0%BE%D0%B3%D0%BE" },
  { year: "2017", title: "Квартиры в Батайске догоняют по цене ростовские", href: "https://news.myseldon.com/ru/news/index/178743381" },
  { year: "2017", title: "Анонсы строительства ТеслаДом I", href: "https://cityreporter.ru/v-batajske-postroyat-mnogoetazhnyj-dom-s-robotom-konserzhem/" },
  { year: "2016", title: "Круглый стол в пресс-центре губернатора", href: "https://don24.ru/rubric/ekonomika/rostovchane-vybirayut-kvartiry-kak-moskvichi.html#:~:text=%C2%AB%D0%92%20%D1%8D%D0%BA%D0%BE%D0%BD%D0%BE%D0%BC-%D1%81%D0%B5%D0%B3%D0%BC%D0%B5%D0%BD%D1%82%D0%B5,%D0%BF%D0%BE%D1%8F%D1%81%D0%BD%D0%B8%D0%BB%20%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE" },
  { year: "2016", title: "Региональные особенности и прогноз на 2017", href: "https://rg.ru/2016/11/22/reg-ufo/pochemu-na-iuge-rossii-silno-podeshevela-nedvizhimost.html#:~:text=-%20%D0%92%20%D0%BA%D0%B0%D0%B6%D0%B4%D0%BE%D0%BC%20%D1%80%D0%B0%D0%B9%D0%BE%D0%BD%D0%B5,%D0%94%D0%BE%D0%BD%D1%81%D0%BA%D0%BE%D0%B9%20%D0%A2%D0%B8%D0%BC%D1%83%D1%80%20%D0%97%D0%B0%D1%85%D0%B0%D1%80%D1%87%D0%B5%D0%BD%D0%BA%D0%BE" },
];

// Блокувальники реклами (uBlock, AdGuard з російськими фільтрами) ховають на сторінці посилання на dzen.ru —
// у сітці лишаються порожні клітинки. Такі посилання ведемо через нашу переадресацію /stati-v-smi/go/<n>.
const MASKED_HOSTS = ["dzen.ru"];
const isMasked = (href: string) => {
  if (!/^https?:/.test(href)) return false; // внутрішні сторінки (/stati/…)
  const host = new URL(href).hostname;
  return MASKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
};

/** Адреса картки публікації: напряму або через переадресацію (для доменів, які ріжуть блокувальники). */
export const smiHref = (a: Article, index: number) => (isMasked(a.href) ? `/stati-v-smi/go/${index}` : a.href);

/** Куди веде переадресація /stati-v-smi/go/<n> (лише для «замаскованих» посилань). */
export const smiRedirect = (list: readonly Article[], n: number) => {
  const a = list[n];
  return a && isMasked(a.href) ? a.href : null;
};
