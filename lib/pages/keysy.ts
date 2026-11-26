// Кейсы со страницы /keysy (перенесено с sales-machine.team/keysy). Позже — из CMS.
// Кейсы-статьи (/stati/…) ведут на старый сайт; опубликованные в админке — подменяются на /stati/<slug>
// (resolveCases, на сервере в app/(inner)/keysy/page.tsx). Новые кейсы из админки добавляются в свои категории.

const OLD = "https://www.sales-machine.team";
const stati = (slug: string) => `${OLD}/stati/${slug}`;

export const CATEGORIES = [
  { id: "marketing", label: "Маркетинг" },
  { id: "kreativ", label: "Креатив" },
  { id: "pr", label: "PR" },
  { id: "brending", label: "Брендинг" },
  { id: "reklama", label: "Реклама" },
  { id: "rebranding", label: "Ребрендинг" },
  { id: "office", label: "Иммерсивный офис" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type Case = { title: string; href: string; cats: readonly CategoryId[] };

export const KEYSY_PAGE = {
  word: "Кейсы",
  title: "Кейсы, которые принесли результат",
  cta: "Клик, который поможет бизнесу",
  contact: {
    title: "Привет, это Вадим.",
    text: "Ловите мировой тренд на иммерсивность за «хвост». Не упустите время!",
  },
};

export const CASES: readonly Case[] = [
  { title: "Событие как PR", href: "https://www.donnews.ru/V-poselke-Skver--moy-dom-otkryli-stelu-Geroev_88291", cats: ["pr"] },
  { title: "Первый робот-консьерж в России", href: "https://lenta.ru/news/2017/08/01/c_y_b_e_r_v_a_k_h_t_e_r/", cats: ["pr"] },
  { title: "Ростовчане надают лещей Московским и Питерским девелоперам", href: "https://privet-rostov.ru/main/94449-rostovchane-nadajut-leschej-moskve-i-piteru.html", cats: ["pr"] },
  { title: "Канал ТНТ жаждет маркетологов из Ростова", href: "https://www.rostov.kp.ru/online/news/5221235/", cats: ["pr"] },
  { title: "Украли награду! Как из этого события сделать новость о которой говорят?", href: "https://www.donnews.ru/na-krupnom-festivale-videoreklamy-v-moskve-neizvestnye-ukrali-u-rostovchan-prizovuyu-tarelku_81314820", cats: ["pr"] },
  { title: "Венецианский шок! Фильм победитель из Ростова-на-Дону", href: "https://rostov.aif.ru/culture/movie/na_festivale_v_venecii_pobedil_film_ob_arhitekture_rostova", cats: ["pr"] },
  { title: "Порно из Ростова на фестивале в Нью Йорке", href: "https://lenta.ru/news/2015/02/13/russianfilm/", cats: ["pr"] },
  { title: "Лещи девелоперам", href: stati("leshchi-developeram"), cats: ["pr"] },
  { title: "«Иммерсивный маркетинг»: от подставных бабушек до PornHub. Как театр, только денег больше", href: stati("immersivnyy-marketing-ot-babushek-do-pornhub"), cats: ["marketing"] },
  { title: "Новая эра маркетинга из Ростова-на-Дону", href: "https://gorodn.ru/razdel/obshchestvo_free/obrazovanie/41287/", cats: ["marketing"] },
  { title: "«Возьмите мои деньги!» Маркетолог из Ростова — о хищных продажах", href: "https://dzen.ru/a/ZFYCz8k6vUrSPrjl", cats: ["marketing"] },
  { title: "Иммерсивный маркетинг в России: о нашей концепции в Википедии", href: "https://ru.wikipedia.org/wiki/%D0%98%D0%BC%D0%BC%D0%B5%D1%80%D1%81%D0%B8%D0%B2%D0%BD%D1%8B%D0%B9_%D0%BC%D0%B0%D1%80%D0%BA%D0%B5%D1%82%D0%B8%D0%BD%D0%B3", cats: ["marketing"] },
  { title: "Как мы продали 185 квартир за 14 месяцев по самой дорогой цене в локации", href: stati("tesladom-185-kvartir-za-14-mesyacev"), cats: ["marketing"] },
  { title: "Эмоциональный шампур, как важнейший элемент «Иммерсивного маркетинга»", href: "https://gorodn.ru/razdel/novosti_kompaniy/praktika_biznesa/31617/", cats: ["marketing"] },
  { title: "Самая сильная команда на форуме «Движение»", href: stati("samaya-silnaya-komanda-na-forume-dvizhenie"), cats: ["marketing"] },
  { title: "Виральный шедевр с многомиллионным охватом. Креатив в наружной рекламе", href: stati("3-bilborda-na-granice-batayska"), cats: ["kreativ"] },
  { title: "Креативная реклама жилого комплекса, которая продает больше", href: "https://plus.rbc.ru/news/59ededfa7a8aa961fd0ece1c", cats: ["kreativ"] },
  { title: "Голос Gucci в рекламе застройщика", href: stati("golos-gucci-v-reklame-zastroyshchika"), cats: ["kreativ"] },
  { title: "Название улицы о которой говорят все вокруг", href: "https://digitalbands.notion.site/We-dragged-our-competitors-into-a-chess-game-and-mated-them-in-6-moves-3ede0b424d0b4e0c80f0474dad801bd5", cats: ["kreativ"] },
  { title: "Реклама, которую заметил губернатор за один день", href: stati("hb-startovyy-pr"), cats: ["kreativ", "reklama"] },
  { title: "Первый в России робот-консьерж", href: "https://secretmag.ru/news/v-rostovskoi-oblasti-poyavilsya-pervyi-v-rossii-robot-konserzh-01-08-2017.htm", cats: ["kreativ"] },
  { title: "Иногда мы делаем хороший креатив. Забавы ради. Например, как наш баттл с Брусникой", href: stati("feyki-rulyat-batl-s-brusnikoy"), cats: ["kreativ"] },
  { title: "Креативный нейминг для сети офлайн интерьерных магазинов", href: stati("kak-my-pridumali-nazvanie-dlya-magazina-interernyh-veshchey"), cats: ["kreativ"] },
  { title: "12 ключей", href: stati("12-klyuchey"), cats: ["brending"] },
  { title: "Как мы придумали доброго кота для детей", href: stati("dobryy-kot"), cats: ["brending"] },
  { title: "Красиво. Модно. Вкусно", href: stati("krasivo-modno-vkusno"), cats: ["brending"] },
  { title: "Придумали отличительную идею и название для девелоперской компании в сегменте бизнес", href: stati("fundamentalnye-otcy"), cats: ["brending"] },
  { title: "Компания по доставке автомобилей из Ростовской области", href: stati("brending-avto-kung-fu"), cats: ["brending"] },
  { title: "Придумали новое название, айдентику, дескриптор для девелоперской компании из Тюмени с 16-летним опытом", href: stati("rebrending-harizmy"), cats: ["brending", "rebranding"] },
  { title: "Из Люксембурга в Ростов", href: stati("iz-lyuksemburga-v-rostov"), cats: ["brending"] },
  { title: "Переосмыслили идею девелопера из Новосибирска и придумали стартовую рекламную кампанию", href: stati("reklamnaya-kampaniya-richspeys"), cats: ["reklama"] },
  { title: "Яркая реклама — большие продажи!", href: stati("hozyain-barin-novogodnyaya-rk"), cats: ["reklama"] },
  { title: "Мошенники, как способ продвижения новой коллекции сумок!", href: stati("hozyain-barin---avtobusy-i-moshenniki"), cats: ["reklama"] },
  { title: "Рост продаж на 87% за три месяца. Рекламная кампания колбасы из Казахстана", href: stati("reklamnaya-kampaniya-mamino"), cats: ["reklama"] },
  { title: "Маркетинговая битва: УНИСТРОЙ vs Железно и Брусника", href: stati("marketingovaya-bitva-unistroy-vs-zhelezno-i-brusnika"), cats: ["reklama"] },
  { title: "Первый иммерсивный офис продаж жилой недвижимости в России", href: stati("immersivnyy-ofis-prodazh-zhiloy-nedvizhimosti"), cats: ["office"] },
  { title: "PR ребрендинга девелопера, который привёл к наградам", href: stati("pr-harizmy"), cats: ["rebranding"] },
  { title: "Иммерсивная переупаковка строительной компании от названия до отдела продаж", href: stati("immersivnaya-pereupakovka-stroitelnoy-kompanii"), cats: ["rebranding", "marketing"] },
];

/** Подставить внутренние адреса опубликованных кейсов и добавить новые (созданные в админке). */
export const resolveCases = (published: { slug: string; title: string; cats: string[] }[]): Case[] => {
  const bySlug = new Map(published.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  const list: Case[] = CASES.map((c) => {
    const slug = c.href.startsWith(`${OLD}/stati/`) ? c.href.slice(`${OLD}/stati/`.length) : null;
    if (!slug || !bySlug.has(slug)) return c;
    seen.add(slug);
    return { ...c, href: `/stati/${slug}` };
  });
  const ids = new Set<string>(CATEGORIES.map((c) => c.id));
  for (const p of published) {
    if (seen.has(p.slug)) continue;
    const cats = p.cats.filter((c): c is CategoryId => ids.has(c));
    if (cats.length) list.unshift({ title: p.title, href: `/stati/${p.slug}`, cats });
  }
  return list;
};
