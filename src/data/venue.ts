export interface VenueInfo {
  name: string;
  tagline: string;
  address: string;
  shortAddress: string;
  district: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  rating: number;
  reviewsCount: number;
  workingHours: string;
  description: string;
  specialties: {
    title: string;
    description: string;
    category: string;
  }[];
  atmosphere: string[];
  photos: {
    url: string;
    caption: string;
  }[];
}

export const SISI_VENUE: VenueInfo = {
  name: 'SiSi Food & Friends',
  tagline: 'Уютное кафе для теплых бранчей, кофе и душевных разговоров',
  address: 'ul. Szamarzewskiego 1/1, 60-851 Poznań, Poland',
  shortAddress: 'Szamarzewskiego 1/1, Poznań',
  district: 'Jeżyce (Ежице)',
  city: 'Познань, Польша',
  coordinates: {
    lat: 52.4103431,
    lng: 16.9024664,
  },
  googleMapsUrl: 'https://maps.app.goo.gl/f1qjNbBK4LC7dx5QA',
  rating: 4.6,
  reviewsCount: 133,
  workingHours: 'Пн-Вс: 09:00 – 19:00',
  description:
    'Светлое, невероятно уютное кафе на углу улиц Шамажевского и Крашевского в историческом квартале Ежице. Здесь подают восхитительный спешелти кофе, знаменитые ракухи императрицы Сиси, авторские сэндвичи и домашнюю выпечку в расслабляющей романтической атмосфере.',
  specialties: [
    {
      title: 'Racuchy cesarzowej SiSi',
      description: 'Воздушные панкейки с маскарпоне, ванилью и сезонными ягодами',
      category: 'Десерт',
    },
    {
      title: 'Chrupiąca Pani',
      description: 'Хрустящий запеченный бриошь с трюфельным сыром и соусом бешамель',
      category: 'Бранч',
    },
    {
      title: 'Спешелти кофе & Матча',
      description: 'Свежеобжаренные зерна, сливочный флэт уайт и премиальная церемониальная матча',
      category: 'Напитки',
    },
    {
      title: 'Drzewko Szczęścia',
      description: 'Сет авторских сладких и соленых паст с теплыми французскими багетами',
      category: 'Закуски',
    },
  ],
  atmosphere: [
    'Теплый свет и живые цветы',
    'Тихая фоновая музыка',
    'Очень мягкие диванчики',
    'Идеально для искренних бесед',
  ],
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
      caption: 'Уютный столик у окна с теплым светом',
    },
    {
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
      caption: 'Свежий ароматный кофе и свежая выпечка',
    },
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      caption: 'Атмосфера европейского кафе в сердце Ежице',
    },
    {
      url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
      caption: 'Авторские напитки и десерты для двоих',
    },
  ],
};

export const POPULAR_POZNAN_ORIGINS = [
  {
    label: 'Poznań Główny (Ж/д вокзал)',
    addressOrCoords: 'Poznań Główny, Poznań',
    iconName: 'train',
    coordinates: { lat: 52.4026, lng: 16.9126 },
  },
  {
    label: 'Stary Rynek (Старый Рынок)',
    addressOrCoords: 'Stary Rynek, Poznań',
    iconName: 'landmark',
    coordinates: { lat: 52.4083, lng: 16.9342 },
  },
  {
    label: 'Rondo Kaponiera (Капоньера)',
    addressOrCoords: 'Rondo Kaponiera, Poznań',
    iconName: 'navigation',
    coordinates: { lat: 52.4079, lng: 16.9122 },
  },
  {
    label: 'Park Sołacki (Парк Солацки)',
    addressOrCoords: 'Park Sołacki, Poznań',
    iconName: 'trees',
    coordinates: { lat: 52.4239, lng: 16.9022 },
  },
];
