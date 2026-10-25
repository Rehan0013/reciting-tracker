// Quran Metadata & Options for Quran Reader
export interface SurahMeta {
  number: number;
  arabic: string;
  english: string;
  meaning: string;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
  order: number;
  page: number;
}

export interface TranslationOption {
  id: string;
  name: string;
  language: string;
  direction: 'ltr' | 'rtl';
}

export interface ReciterOption {
  id: string;
  name: string;
  subtext: string;
  bitrate: number;
}

export interface TafsirOption {
  id: number;
  name: string;
  author: string;
  language: string;
}

export const QURAN_SURAHS: SurahMeta[] = [
  {
    "number": 1,
    "arabic": "الفاتحة",
    "english": "Al-Fatihah",
    "meaning": "The Opener",
    "verses": 7,
    "revelation": "Meccan",
    "order": 5,
    "page": 1
  },
  {
    "number": 2,
    "arabic": "البقرة",
    "english": "Al-Baqarah",
    "meaning": "The Cow",
    "verses": 286,
    "revelation": "Medinan",
    "order": 87,
    "page": 2
  },
  {
    "number": 3,
    "arabic": "آل عمران",
    "english": "Ali 'Imran",
    "meaning": "Family of Imran",
    "verses": 200,
    "revelation": "Medinan",
    "order": 89,
    "page": 50
  },
  {
    "number": 4,
    "arabic": "النساء",
    "english": "An-Nisa",
    "meaning": "The Women",
    "verses": 176,
    "revelation": "Medinan",
    "order": 92,
    "page": 77
  },
  {
    "number": 5,
    "arabic": "المائدة",
    "english": "Al-Ma'idah",
    "meaning": "The Table Spread",
    "verses": 120,
    "revelation": "Medinan",
    "order": 112,
    "page": 106
  },
  {
    "number": 6,
    "arabic": "الأنعام",
    "english": "Al-An'am",
    "meaning": "The Cattle",
    "verses": 165,
    "revelation": "Meccan",
    "order": 55,
    "page": 128
  },
  {
    "number": 7,
    "arabic": "الأعراف",
    "english": "Al-A'raf",
    "meaning": "The Heights",
    "verses": 206,
    "revelation": "Meccan",
    "order": 39,
    "page": 151
  },
  {
    "number": 8,
    "arabic": "الأنفال",
    "english": "Al-Anfal",
    "meaning": "The Spoils of War",
    "verses": 75,
    "revelation": "Medinan",
    "order": 88,
    "page": 177
  },
  {
    "number": 9,
    "arabic": "التوبة",
    "english": "At-Tawbah",
    "meaning": "The Repentance",
    "verses": 129,
    "revelation": "Medinan",
    "order": 113,
    "page": 187
  },
  {
    "number": 10,
    "arabic": "يونس",
    "english": "Yunus",
    "meaning": "Jonah",
    "verses": 109,
    "revelation": "Meccan",
    "order": 51,
    "page": 208
  },
  {
    "number": 11,
    "arabic": "هود",
    "english": "Hud",
    "meaning": "Hud",
    "verses": 123,
    "revelation": "Meccan",
    "order": 52,
    "page": 221
  },
  {
    "number": 12,
    "arabic": "يوسف",
    "english": "Yusuf",
    "meaning": "Joseph",
    "verses": 111,
    "revelation": "Meccan",
    "order": 53,
    "page": 235
  },
  {
    "number": 13,
    "arabic": "الرعد",
    "english": "Ar-Ra'd",
    "meaning": "The Thunder",
    "verses": 43,
    "revelation": "Medinan",
    "order": 96,
    "page": 249
  },
  {
    "number": 14,
    "arabic": "ابراهيم",
    "english": "Ibrahim",
    "meaning": "Abraham",
    "verses": 52,
    "revelation": "Meccan",
    "order": 72,
    "page": 255
  },
  {
    "number": 15,
    "arabic": "الحجر",
    "english": "Al-Hijr",
    "meaning": "The Rocky Tract",
    "verses": 99,
    "revelation": "Meccan",
    "order": 54,
    "page": 262
  },
  {
    "number": 16,
    "arabic": "النحل",
    "english": "An-Nahl",
    "meaning": "The Bee",
    "verses": 128,
    "revelation": "Meccan",
    "order": 70,
    "page": 267
  },
  {
    "number": 17,
    "arabic": "الإسراء",
    "english": "Al-Isra",
    "meaning": "The Night Journey",
    "verses": 111,
    "revelation": "Meccan",
    "order": 50,
    "page": 282
  },
  {
    "number": 18,
    "arabic": "الكهف",
    "english": "Al-Kahf",
    "meaning": "The Cave",
    "verses": 110,
    "revelation": "Meccan",
    "order": 69,
    "page": 293
  },
  {
    "number": 19,
    "arabic": "مريم",
    "english": "Maryam",
    "meaning": "Mary",
    "verses": 98,
    "revelation": "Meccan",
    "order": 44,
    "page": 305
  },
  {
    "number": 20,
    "arabic": "طه",
    "english": "Taha",
    "meaning": "Ta-Ha",
    "verses": 135,
    "revelation": "Meccan",
    "order": 45,
    "page": 312
  },
  {
    "number": 21,
    "arabic": "الأنبياء",
    "english": "Al-Anbya",
    "meaning": "The Prophets",
    "verses": 112,
    "revelation": "Meccan",
    "order": 73,
    "page": 322
  },
  {
    "number": 22,
    "arabic": "الحج",
    "english": "Al-Hajj",
    "meaning": "The Pilgrimage",
    "verses": 78,
    "revelation": "Medinan",
    "order": 103,
    "page": 332
  },
  {
    "number": 23,
    "arabic": "المؤمنون",
    "english": "Al-Mu'minun",
    "meaning": "The Believers",
    "verses": 118,
    "revelation": "Meccan",
    "order": 74,
    "page": 342
  },
  {
    "number": 24,
    "arabic": "النور",
    "english": "An-Nur",
    "meaning": "The Light",
    "verses": 64,
    "revelation": "Medinan",
    "order": 102,
    "page": 350
  },
  {
    "number": 25,
    "arabic": "الفرقان",
    "english": "Al-Furqan",
    "meaning": "The Criterion",
    "verses": 77,
    "revelation": "Meccan",
    "order": 42,
    "page": 359
  },
  {
    "number": 26,
    "arabic": "الشعراء",
    "english": "Ash-Shu'ara",
    "meaning": "The Poets",
    "verses": 227,
    "revelation": "Meccan",
    "order": 47,
    "page": 367
  },
  {
    "number": 27,
    "arabic": "النمل",
    "english": "An-Naml",
    "meaning": "The Ant",
    "verses": 93,
    "revelation": "Meccan",
    "order": 48,
    "page": 377
  },
  {
    "number": 28,
    "arabic": "القصص",
    "english": "Al-Qasas",
    "meaning": "The Stories",
    "verses": 88,
    "revelation": "Meccan",
    "order": 49,
    "page": 385
  },
  {
    "number": 29,
    "arabic": "العنكبوت",
    "english": "Al-'Ankabut",
    "meaning": "The Spider",
    "verses": 69,
    "revelation": "Meccan",
    "order": 85,
    "page": 396
  },
  {
    "number": 30,
    "arabic": "الروم",
    "english": "Ar-Rum",
    "meaning": "The Romans",
    "verses": 60,
    "revelation": "Meccan",
    "order": 84,
    "page": 404
  },
  {
    "number": 31,
    "arabic": "لقمان",
    "english": "Luqman",
    "meaning": "Luqman",
    "verses": 34,
    "revelation": "Meccan",
    "order": 57,
    "page": 411
  },
  {
    "number": 32,
    "arabic": "السجدة",
    "english": "As-Sajdah",
    "meaning": "The Prostration",
    "verses": 30,
    "revelation": "Meccan",
    "order": 75,
    "page": 415
  },
  {
    "number": 33,
    "arabic": "الأحزاب",
    "english": "Al-Ahzab",
    "meaning": "The Combined Forces",
    "verses": 73,
    "revelation": "Medinan",
    "order": 90,
    "page": 418
  },
  {
    "number": 34,
    "arabic": "سبإ",
    "english": "Saba",
    "meaning": "Sheba",
    "verses": 54,
    "revelation": "Meccan",
    "order": 58,
    "page": 428
  },
  {
    "number": 35,
    "arabic": "فاطر",
    "english": "Fatir",
    "meaning": "Originator",
    "verses": 45,
    "revelation": "Meccan",
    "order": 43,
    "page": 434
  },
  {
    "number": 36,
    "arabic": "يس",
    "english": "Ya-Sin",
    "meaning": "Ya Sin",
    "verses": 83,
    "revelation": "Meccan",
    "order": 41,
    "page": 440
  },
  {
    "number": 37,
    "arabic": "الصافات",
    "english": "As-Saffat",
    "meaning": "Those who set the Ranks",
    "verses": 182,
    "revelation": "Meccan",
    "order": 56,
    "page": 446
  },
  {
    "number": 38,
    "arabic": "ص",
    "english": "Sad",
    "meaning": "The Letter \"Saad\"",
    "verses": 88,
    "revelation": "Meccan",
    "order": 38,
    "page": 453
  },
  {
    "number": 39,
    "arabic": "الزمر",
    "english": "Az-Zumar",
    "meaning": "The Troops",
    "verses": 75,
    "revelation": "Meccan",
    "order": 59,
    "page": 458
  },
  {
    "number": 40,
    "arabic": "غافر",
    "english": "Ghafir",
    "meaning": "The Forgiver",
    "verses": 85,
    "revelation": "Meccan",
    "order": 60,
    "page": 467
  },
  {
    "number": 41,
    "arabic": "فصلت",
    "english": "Fussilat",
    "meaning": "Explained in Detail",
    "verses": 54,
    "revelation": "Meccan",
    "order": 61,
    "page": 477
  },
  {
    "number": 42,
    "arabic": "الشورى",
    "english": "Ash-Shuraa",
    "meaning": "The Consultation",
    "verses": 53,
    "revelation": "Meccan",
    "order": 62,
    "page": 483
  },
  {
    "number": 43,
    "arabic": "الزخرف",
    "english": "Az-Zukhruf",
    "meaning": "The Ornaments of Gold",
    "verses": 89,
    "revelation": "Meccan",
    "order": 63,
    "page": 489
  },
  {
    "number": 44,
    "arabic": "الدخان",
    "english": "Ad-Dukhan",
    "meaning": "The Smoke",
    "verses": 59,
    "revelation": "Meccan",
    "order": 64,
    "page": 496
  },
  {
    "number": 45,
    "arabic": "الجاثية",
    "english": "Al-Jathiyah",
    "meaning": "The Crouching",
    "verses": 37,
    "revelation": "Meccan",
    "order": 65,
    "page": 499
  },
  {
    "number": 46,
    "arabic": "الأحقاف",
    "english": "Al-Ahqaf",
    "meaning": "The Wind-Curved Sandhills",
    "verses": 35,
    "revelation": "Meccan",
    "order": 66,
    "page": 502
  },
  {
    "number": 47,
    "arabic": "محمد",
    "english": "Muhammad",
    "meaning": "Muhammad",
    "verses": 38,
    "revelation": "Medinan",
    "order": 95,
    "page": 507
  },
  {
    "number": 48,
    "arabic": "الفتح",
    "english": "Al-Fath",
    "meaning": "The Victory",
    "verses": 29,
    "revelation": "Medinan",
    "order": 111,
    "page": 511
  },
  {
    "number": 49,
    "arabic": "الحجرات",
    "english": "Al-Hujurat",
    "meaning": "The Rooms",
    "verses": 18,
    "revelation": "Medinan",
    "order": 106,
    "page": 515
  },
  {
    "number": 50,
    "arabic": "ق",
    "english": "Qaf",
    "meaning": "The Letter \"Qaf\"",
    "verses": 45,
    "revelation": "Meccan",
    "order": 34,
    "page": 518
  },
  {
    "number": 51,
    "arabic": "الذاريات",
    "english": "Adh-Dhariyat",
    "meaning": "The Winnowing Winds",
    "verses": 60,
    "revelation": "Meccan",
    "order": 67,
    "page": 520
  },
  {
    "number": 52,
    "arabic": "الطور",
    "english": "At-Tur",
    "meaning": "The Mount",
    "verses": 49,
    "revelation": "Meccan",
    "order": 76,
    "page": 523
  },
  {
    "number": 53,
    "arabic": "النجم",
    "english": "An-Najm",
    "meaning": "The Star",
    "verses": 62,
    "revelation": "Meccan",
    "order": 23,
    "page": 526
  },
  {
    "number": 54,
    "arabic": "القمر",
    "english": "Al-Qamar",
    "meaning": "The Moon",
    "verses": 55,
    "revelation": "Meccan",
    "order": 37,
    "page": 528
  },
  {
    "number": 55,
    "arabic": "الرحمن",
    "english": "Ar-Rahman",
    "meaning": "The Beneficent",
    "verses": 78,
    "revelation": "Medinan",
    "order": 97,
    "page": 531
  },
  {
    "number": 56,
    "arabic": "الواقعة",
    "english": "Al-Waqi'ah",
    "meaning": "The Inevitable",
    "verses": 96,
    "revelation": "Meccan",
    "order": 46,
    "page": 534
  },
  {
    "number": 57,
    "arabic": "الحديد",
    "english": "Al-Hadid",
    "meaning": "The Iron",
    "verses": 29,
    "revelation": "Medinan",
    "order": 94,
    "page": 537
  },
  {
    "number": 58,
    "arabic": "المجادلة",
    "english": "Al-Mujadila",
    "meaning": "The Pleading Woman",
    "verses": 22,
    "revelation": "Medinan",
    "order": 105,
    "page": 542
  },
  {
    "number": 59,
    "arabic": "الحشر",
    "english": "Al-Hashr",
    "meaning": "The Exile",
    "verses": 24,
    "revelation": "Medinan",
    "order": 101,
    "page": 545
  },
  {
    "number": 60,
    "arabic": "الممتحنة",
    "english": "Al-Mumtahanah",
    "meaning": "She that is to be examined",
    "verses": 13,
    "revelation": "Medinan",
    "order": 91,
    "page": 549
  },
  {
    "number": 61,
    "arabic": "الصف",
    "english": "As-Saf",
    "meaning": "The Ranks",
    "verses": 14,
    "revelation": "Medinan",
    "order": 109,
    "page": 551
  },
  {
    "number": 62,
    "arabic": "الجمعة",
    "english": "Al-Jumu'ah",
    "meaning": "The Congregation, Friday",
    "verses": 11,
    "revelation": "Medinan",
    "order": 110,
    "page": 553
  },
  {
    "number": 63,
    "arabic": "المنافقون",
    "english": "Al-Munafiqun",
    "meaning": "The Hypocrites",
    "verses": 11,
    "revelation": "Medinan",
    "order": 104,
    "page": 554
  },
  {
    "number": 64,
    "arabic": "التغابن",
    "english": "At-Taghabun",
    "meaning": "The Mutual Disillusion",
    "verses": 18,
    "revelation": "Medinan",
    "order": 108,
    "page": 556
  },
  {
    "number": 65,
    "arabic": "الطلاق",
    "english": "At-Talaq",
    "meaning": "The Divorce",
    "verses": 12,
    "revelation": "Medinan",
    "order": 99,
    "page": 558
  },
  {
    "number": 66,
    "arabic": "التحريم",
    "english": "At-Tahrim",
    "meaning": "The Prohibition",
    "verses": 12,
    "revelation": "Medinan",
    "order": 107,
    "page": 560
  },
  {
    "number": 67,
    "arabic": "الملك",
    "english": "Al-Mulk",
    "meaning": "The Sovereignty",
    "verses": 30,
    "revelation": "Meccan",
    "order": 77,
    "page": 562
  },
  {
    "number": 68,
    "arabic": "القلم",
    "english": "Al-Qalam",
    "meaning": "The Pen",
    "verses": 52,
    "revelation": "Meccan",
    "order": 2,
    "page": 564
  },
  {
    "number": 69,
    "arabic": "الحاقة",
    "english": "Al-Haqqah",
    "meaning": "The Reality",
    "verses": 52,
    "revelation": "Meccan",
    "order": 78,
    "page": 566
  },
  {
    "number": 70,
    "arabic": "المعارج",
    "english": "Al-Ma'arij",
    "meaning": "The Ascending Stairways",
    "verses": 44,
    "revelation": "Meccan",
    "order": 79,
    "page": 568
  },
  {
    "number": 71,
    "arabic": "نوح",
    "english": "Nuh",
    "meaning": "Noah",
    "verses": 28,
    "revelation": "Meccan",
    "order": 71,
    "page": 570
  },
  {
    "number": 72,
    "arabic": "الجن",
    "english": "Al-Jinn",
    "meaning": "The Jinn",
    "verses": 28,
    "revelation": "Meccan",
    "order": 40,
    "page": 572
  },
  {
    "number": 73,
    "arabic": "المزمل",
    "english": "Al-Muzzammil",
    "meaning": "The Enshrouded One",
    "verses": 20,
    "revelation": "Meccan",
    "order": 3,
    "page": 574
  },
  {
    "number": 74,
    "arabic": "المدثر",
    "english": "Al-Muddaththir",
    "meaning": "The Cloaked One",
    "verses": 56,
    "revelation": "Meccan",
    "order": 4,
    "page": 575
  },
  {
    "number": 75,
    "arabic": "القيامة",
    "english": "Al-Qiyamah",
    "meaning": "The Resurrection",
    "verses": 40,
    "revelation": "Meccan",
    "order": 31,
    "page": 577
  },
  {
    "number": 76,
    "arabic": "الانسان",
    "english": "Al-Insan",
    "meaning": "The Man",
    "verses": 31,
    "revelation": "Medinan",
    "order": 98,
    "page": 578
  },
  {
    "number": 77,
    "arabic": "المرسلات",
    "english": "Al-Mursalat",
    "meaning": "The Emissaries",
    "verses": 50,
    "revelation": "Meccan",
    "order": 33,
    "page": 580
  },
  {
    "number": 78,
    "arabic": "النبإ",
    "english": "An-Naba",
    "meaning": "The Tidings",
    "verses": 40,
    "revelation": "Meccan",
    "order": 80,
    "page": 582
  },
  {
    "number": 79,
    "arabic": "النازعات",
    "english": "An-Nazi'at",
    "meaning": "Those who drag forth",
    "verses": 46,
    "revelation": "Meccan",
    "order": 81,
    "page": 583
  },
  {
    "number": 80,
    "arabic": "عبس",
    "english": "'Abasa",
    "meaning": "He Frowned",
    "verses": 42,
    "revelation": "Meccan",
    "order": 24,
    "page": 585
  },
  {
    "number": 81,
    "arabic": "التكوير",
    "english": "At-Takwir",
    "meaning": "The Overthrowing",
    "verses": 29,
    "revelation": "Meccan",
    "order": 7,
    "page": 586
  },
  {
    "number": 82,
    "arabic": "الإنفطار",
    "english": "Al-Infitar",
    "meaning": "The Cleaving",
    "verses": 19,
    "revelation": "Meccan",
    "order": 82,
    "page": 587
  },
  {
    "number": 83,
    "arabic": "المطففين",
    "english": "Al-Mutaffifin",
    "meaning": "The Defrauding",
    "verses": 36,
    "revelation": "Meccan",
    "order": 86,
    "page": 587
  },
  {
    "number": 84,
    "arabic": "الإنشقاق",
    "english": "Al-Inshiqaq",
    "meaning": "The Sundering",
    "verses": 25,
    "revelation": "Meccan",
    "order": 83,
    "page": 589
  },
  {
    "number": 85,
    "arabic": "البروج",
    "english": "Al-Buruj",
    "meaning": "The Mansions of the Stars",
    "verses": 22,
    "revelation": "Meccan",
    "order": 27,
    "page": 590
  },
  {
    "number": 86,
    "arabic": "الطارق",
    "english": "At-Tariq",
    "meaning": "The Nightcommer",
    "verses": 17,
    "revelation": "Meccan",
    "order": 36,
    "page": 591
  },
  {
    "number": 87,
    "arabic": "الأعلى",
    "english": "Al-A'la",
    "meaning": "The Most High",
    "verses": 19,
    "revelation": "Meccan",
    "order": 8,
    "page": 591
  },
  {
    "number": 88,
    "arabic": "الغاشية",
    "english": "Al-Ghashiyah",
    "meaning": "The Overwhelming",
    "verses": 26,
    "revelation": "Meccan",
    "order": 68,
    "page": 592
  },
  {
    "number": 89,
    "arabic": "الفجر",
    "english": "Al-Fajr",
    "meaning": "The Dawn",
    "verses": 30,
    "revelation": "Meccan",
    "order": 10,
    "page": 593
  },
  {
    "number": 90,
    "arabic": "البلد",
    "english": "Al-Balad",
    "meaning": "The City",
    "verses": 20,
    "revelation": "Meccan",
    "order": 35,
    "page": 594
  },
  {
    "number": 91,
    "arabic": "الشمس",
    "english": "Ash-Shams",
    "meaning": "The Sun",
    "verses": 15,
    "revelation": "Meccan",
    "order": 26,
    "page": 595
  },
  {
    "number": 92,
    "arabic": "الليل",
    "english": "Al-Layl",
    "meaning": "The Night",
    "verses": 21,
    "revelation": "Meccan",
    "order": 9,
    "page": 595
  },
  {
    "number": 93,
    "arabic": "الضحى",
    "english": "Ad-Duhaa",
    "meaning": "The Morning Hours",
    "verses": 11,
    "revelation": "Meccan",
    "order": 11,
    "page": 596
  },
  {
    "number": 94,
    "arabic": "الشرح",
    "english": "Ash-Sharh",
    "meaning": "The Relief",
    "verses": 8,
    "revelation": "Meccan",
    "order": 12,
    "page": 596
  },
  {
    "number": 95,
    "arabic": "التين",
    "english": "At-Tin",
    "meaning": "The Fig",
    "verses": 8,
    "revelation": "Meccan",
    "order": 28,
    "page": 597
  },
  {
    "number": 96,
    "arabic": "العلق",
    "english": "Al-'Alaq",
    "meaning": "The Clot",
    "verses": 19,
    "revelation": "Meccan",
    "order": 1,
    "page": 597
  },
  {
    "number": 97,
    "arabic": "القدر",
    "english": "Al-Qadr",
    "meaning": "The Power",
    "verses": 5,
    "revelation": "Meccan",
    "order": 25,
    "page": 598
  },
  {
    "number": 98,
    "arabic": "البينة",
    "english": "Al-Bayyinah",
    "meaning": "The Clear Proof",
    "verses": 8,
    "revelation": "Medinan",
    "order": 100,
    "page": 598
  },
  {
    "number": 99,
    "arabic": "الزلزلة",
    "english": "Az-Zalzalah",
    "meaning": "The Earthquake",
    "verses": 8,
    "revelation": "Medinan",
    "order": 93,
    "page": 599
  },
  {
    "number": 100,
    "arabic": "العاديات",
    "english": "Al-'Adiyat",
    "meaning": "The Courser",
    "verses": 11,
    "revelation": "Meccan",
    "order": 14,
    "page": 599
  },
  {
    "number": 101,
    "arabic": "القارعة",
    "english": "Al-Qari'ah",
    "meaning": "The Calamity",
    "verses": 11,
    "revelation": "Meccan",
    "order": 30,
    "page": 600
  },
  {
    "number": 102,
    "arabic": "التكاثر",
    "english": "At-Takathur",
    "meaning": "The Rivalry in world increase",
    "verses": 8,
    "revelation": "Meccan",
    "order": 16,
    "page": 600
  },
  {
    "number": 103,
    "arabic": "العصر",
    "english": "Al-'Asr",
    "meaning": "The Declining Day",
    "verses": 3,
    "revelation": "Meccan",
    "order": 13,
    "page": 601
  },
  {
    "number": 104,
    "arabic": "الهمزة",
    "english": "Al-Humazah",
    "meaning": "The Traducer",
    "verses": 9,
    "revelation": "Meccan",
    "order": 32,
    "page": 601
  },
  {
    "number": 105,
    "arabic": "الفيل",
    "english": "Al-Fil",
    "meaning": "The Elephant",
    "verses": 5,
    "revelation": "Meccan",
    "order": 19,
    "page": 601
  },
  {
    "number": 106,
    "arabic": "قريش",
    "english": "Quraysh",
    "meaning": "Quraysh",
    "verses": 4,
    "revelation": "Meccan",
    "order": 29,
    "page": 602
  },
  {
    "number": 107,
    "arabic": "الماعون",
    "english": "Al-Ma'un",
    "meaning": "The Small kindnesses",
    "verses": 7,
    "revelation": "Meccan",
    "order": 17,
    "page": 602
  },
  {
    "number": 108,
    "arabic": "الكوثر",
    "english": "Al-Kawthar",
    "meaning": "The Abundance",
    "verses": 3,
    "revelation": "Meccan",
    "order": 15,
    "page": 602
  },
  {
    "number": 109,
    "arabic": "الكافرون",
    "english": "Al-Kafirun",
    "meaning": "The Disbelievers",
    "verses": 6,
    "revelation": "Meccan",
    "order": 18,
    "page": 603
  },
  {
    "number": 110,
    "arabic": "النصر",
    "english": "An-Nasr",
    "meaning": "The Divine Support",
    "verses": 3,
    "revelation": "Medinan",
    "order": 114,
    "page": 603
  },
  {
    "number": 111,
    "arabic": "المسد",
    "english": "Al-Masad",
    "meaning": "The Palm Fiber",
    "verses": 5,
    "revelation": "Meccan",
    "order": 6,
    "page": 603
  },
  {
    "number": 112,
    "arabic": "الإخلاص",
    "english": "Al-Ikhlas",
    "meaning": "The Sincerity",
    "verses": 4,
    "revelation": "Meccan",
    "order": 22,
    "page": 604
  },
  {
    "number": 113,
    "arabic": "الفلق",
    "english": "Al-Falaq",
    "meaning": "The Daybreak",
    "verses": 5,
    "revelation": "Meccan",
    "order": 20,
    "page": 604
  },
  {
    "number": 114,
    "arabic": "الناس",
    "english": "An-Nas",
    "meaning": "Mankind",
    "verses": 6,
    "revelation": "Meccan",
    "order": 21,
    "page": 604
  }
];

export const TRANSLATION_OPTIONS: TranslationOption[] = [
  { id: 'en.sahih', name: 'Saheeh International', language: 'English', direction: 'ltr' },
  { id: 'en.asad', name: 'Muhammad Asad', language: 'English', direction: 'ltr' },
  { id: 'en.pickthall', name: 'M. Pickthall', language: 'English', direction: 'ltr' },
  { id: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'Urdu', direction: 'rtl' },
  { id: 'ur.ahmedali', name: 'Ahmed Ali', language: 'Urdu', direction: 'rtl' },
  { id: 'hi.hindi', name: 'Suhel Farooq Khan', language: 'Hindi', direction: 'ltr' },
  { id: 'bn.bengali', name: 'Muhiuddin Khan', language: 'Bengali', direction: 'ltr' },
  { id: 'fr.hamidullah', name: 'Muhammad Hamidullah', language: 'French', direction: 'ltr' },
  { id: 'id.indonesian', name: 'Bahasa Indonesia', language: 'Indonesian', direction: 'ltr' },
  { id: 'tr.diyanet', name: 'Diyanet Isleri', language: 'Turkish', direction: 'ltr' },
];

export const RECITER_OPTIONS: ReciterOption[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', subtext: 'Murattal, clear pace', bitrate: 128 },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', subtext: 'Standard tajweed reference', bitrate: 128 },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', subtext: 'Melodic and emotional', bitrate: 128 },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', subtext: 'Prophetic Mosque Imam', bitrate: 128 },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', subtext: 'Clear resonance', bitrate: 128 },
  { id: 'ar.ahmedajamy', name: 'Ahmed ibn Ali al-Ajamy', subtext: 'Smooth flow', bitrate: 128 },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Abdus Samad', subtext: 'Murattal classic style', bitrate: 192 },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahmaan As-Sudais', subtext: 'Masjid al-Haram Imam', bitrate: 192 },
];

export const TAFSIR_OPTIONS: TafsirOption[] = [
  { id: 169, name: 'Tafsir Ibn Kathir (Abridged)', author: 'Hafiz Ibn Kathir', language: 'English' },
  { id: 168, name: "Ma'arif al-Qur'an", author: 'Mufti Muhammad Shafi', language: 'English' },
  { id: 817, name: 'Tazkirul Quran', author: 'Maulana Wahiduddin Khan', language: 'English' },
  { id: 160, name: 'تفسیر ابنِ کثیر (اردو)', author: 'Hafiz Ibn Kathir', language: 'Urdu' },
  { id: 159, name: 'بیان القرآن (اردو)', author: 'Dr. Israr Ahmad', language: 'Urdu' },
  { id: 16, name: 'تفسير الميسر (عربي)', author: 'King Fahd Complex', language: 'Arabic' },
];

export const JUZ_LIST = [
  { juz: 1,  name: 'Alif Lam Meem', arabic: 'الم', startSurah: 1, startAyah: 1 },
  { juz: 2,  name: 'Sayaqool', arabic: 'سَيَقُولُ', startSurah: 2, startAyah: 142 },
  { juz: 3,  name: 'Tilkar Rusul', arabic: 'تِلْكَ الرُّسُلُ', startSurah: 2, startAyah: 253 },
  { juz: 4,  name: 'Lan Tanaloo', arabic: 'لَنْ تَنَالُوا', startSurah: 3, startAyah: 92 },
  { juz: 5,  name: 'Wal Muhsanat', arabic: 'وَالْمُحْصَنَاتُ', startSurah: 4, startAyah: 24 },
  { juz: 6,  name: 'La Yuhibbullah', arabic: 'لَا يُحِبُّ اللَّهُ', startSurah: 4, startAyah: 148 },
  { juz: 7,  name: 'Wa Iza Samiu', arabic: 'وَإِذَا سَمِعُوا', startSurah: 5, startAyah: 82 },
  { juz: 8,  name: 'Wa Law Annana', arabic: 'وَلَوْ أَنَّنَا', startSurah: 6, startAyah: 111 },
  { juz: 9,  name: 'Qalal Malao', arabic: 'قَالَ الْمَلَأُ', startSurah: 7, startAyah: 88 },
  { juz: 10, name: "Wa A'lamoo", arabic: 'وَاعْلَمُوا', startSurah: 8, startAyah: 41 },
  { juz: 11, name: 'Yatazeroon', arabic: 'يَعْتَذِرُونَ', startSurah: 9, startAyah: 93 },
  { juz: 12, name: 'Wa Mamin Daabbah', arabic: 'وَمَا مِنْ دَابَّةٍ', startSurah: 11, startAyah: 6 },
  { juz: 13, name: 'Wa Ma Ubrioo', arabic: 'وَمَا أُبَرِّئُ', startSurah: 12, startAyah: 53 },
  { juz: 14, name: 'Rubama', arabic: 'رُبَمَا', startSurah: 15, startAyah: 2 },
  { juz: 15, name: 'Subhanallazi', arabic: 'سُبْحَانَ الَّذِي', startSurah: 17, startAyah: 1 },
  { juz: 16, name: 'Qala Alam', arabic: 'قَالَ أَلَمْ', startSurah: 18, startAyah: 75 },
  { juz: 17, name: 'Iqtaraba Lin Nasi', arabic: 'اقْتَرَبَ لِلنَّاسِ', startSurah: 21, startAyah: 1 },
  { juz: 18, name: 'Qad Aflaha', arabic: 'قَدْ أَفْلَحَ', startSurah: 23, startAyah: 1 },
  { juz: 19, name: 'Wa Qalal Lazina', arabic: 'وَقَالَ الَّذِينَ', startSurah: 25, startAyah: 21 },
  { juz: 20, name: 'Amman Khalaqa', arabic: 'أَمَّنْ خَلَقَ', startSurah: 27, startAyah: 60 },
  { juz: 21, name: 'Utlu Ma Oohiya', arabic: 'اتْلُ مَا أُوحِيَ', startSurah: 29, startAyah: 46 },
  { juz: 22, name: 'Wa Manyaqnut', arabic: 'وَمَنْ يَقْنُتْ', startSurah: 33, startAyah: 31 },
  { juz: 23, name: 'Wa Mali', arabic: 'وَمَا لِيَ', startSurah: 36, startAyah: 28 },
  { juz: 24, name: 'Faman Azlamu', arabic: 'فَمَنْ أَظْلَمُ', startSurah: 39, startAyah: 32 },
  { juz: 25, name: 'Ilaihi Yuraddu', arabic: 'إِلَيْهِ يُرَدُّ', startSurah: 41, startAyah: 47 },
  { juz: 26, name: "Ha'a Meem", arabic: 'حم', startSurah: 46, startAyah: 1 },
  { juz: 27, name: 'Qala Fama Khatbukum', arabic: 'قَالَ فَمَا خَطْبُكُمْ', startSurah: 51, startAyah: 31 },
  { juz: 28, name: 'Qad Sami Allah', arabic: 'قَدْ سَمِعَ اللَّهُ', startSurah: 58, startAyah: 1 },
  { juz: 29, name: 'Tabarakallazi', arabic: 'تَبَارَكَ الَّذِي', startSurah: 67, startAyah: 1 },
  { juz: 30, name: "Amma Yatasaa'aloon", arabic: 'عَمَّ يَتَسَاءَلُونَ', startSurah: 78, startAyah: 1 },
];

/** Convert standard numbers to Arabic Eastern numerals: 123 -> ١٢٣ */
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, (d) => arabicDigits[Number(d)]);
}

/**
 * Normalizes ayah text from api.alquran.cloud.
 * For Surahs other than 1 (Al-Fatiha) and 9 (At-Tawbah),
 * api.alquran.cloud prepends Bismillah to verse 1.
 * We strip it from verse 1 so it isn't rendered twice when
 * a dedicated Bismillah header is shown.
 */
export function cleanAyahText(rawText: string, surahNumber: number, ayahNumberInSurah: number): string {
  if (!rawText) return '';
  let text = rawText.trim();
  // Remove zero-width characters / BOM
  text = text.replace(/^[﻿​-‍﻿]/g, '');

  if (surahNumber !== 1 && surahNumber !== 9 && ayahNumberInSurah === 1) {
    const bismillahVariants = [
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    ];
    for (const b of bismillahVariants) {
      if (text.startsWith(b)) {
        text = text.slice(b.length).trim();
        break;
      }
    }
  }
  return text;
}

export function getSurahMeta(number: number): SurahMeta | undefined {
  return QURAN_SURAHS.find((s) => s.number === number);
}
