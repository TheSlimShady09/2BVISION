import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    common: {
      loading: "Loading...",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      back: "Back",
    },
    nav: {
      home: "Home",
      story: "Our Story",
      portfolio: "Portfolio",
      pricing: "Pricing",
      booking: "Booking",
      portal: "Client Portal",
      dashboard: "Dashboard",
    },
    hero: {
      vision: "Vision",
      becomes: "becomes",
      timelessArt: "timeless art.",
      bookSession: "Book a Session",
    },
    story: {
      title: "Our Story",
      subtitle: "Every masterpiece starts with a",
      subtitleHighlight: "single vision.",
      p1: "2B Vision was founded by passionate creators who believed that photography and videography aren't just about capturing images, but about telling stories that outlast time.",
      p2: "Starting with just one camera and a grand dream, our path to success was paved with endless dedication, an eye for raw emotion, and a cinematic approach to every project. Today, we are a premier studio trusted by hundreds to document their legacy.",
    },
    stats: {
      experience: "Years of Experience",
      completed: "Projects Completed",
      clients: "Happy Clients",
      views: "Total Video Views",
    },
    portfolio: {
      title: "Portfolio",
      all: "All",
      photography: "Photography",
      videography: "Videography",
      underConstruction: "Portfolio is under construction. Come back soon!",
      noProjects: "No projects in this category.",
      backToPortfolio: "Return to Portfolio",
      aboutProject: "About the Project",
      clientCategory: "Client / Category",
      service: "Service",
      defaultDescription: "A cinematic look and a unique approach to capturing the most important moments. This project highlights our dedication to details and visual art.",
    },
    pricing: {
      title: "Investment",
      subtitle: "Choose the package that best fits your vision.",
      mostPopular: "Most Popular",
      selectPackage: "Select Package",
      contactInfo: "To get pricing and further details about packages:",
      contactWhatsApp: "Contact us on WhatsApp",
      essentialName: "Essential Story",
      essentialDesc: "Perfect for intimate portraits and short sessions.",
      essentialFeat: [
        "2 Hour Studio Session",
        "2 Wardrobe Changes",
        "15 Retouched High-Res Images",
        "Online Private Gallery",
        "Print Release"
      ],
      cinematicName: "Cinematic Legacy",
      cinematicDesc: "Comprehensive coverage for your special day with premium edits.",
      cinematicFeat: [
        "8 Hours of Coverage",
        "2 Cinematographers",
        "5-7 Minute Highlight Film",
        "Full Ceremony Video",
        "Drone Footage (weather permitting)",
        "Digital Delivery via USB & Online"
      ],
      commercialName: "Commercial Vision",
      commercialDesc: "Elevate your brand with high-end commercial photo and video.",
      commercialFeat: [
        "Half-day Shoot (4 Hours)",
        "Photo & Video Coverage",
        "30-second Promo Video",
        "30 Edited Product/Brand Photos",
        "Commercial Usage License",
        "Creative Direction Consultation"
      ]
    },
    booking: {
      title: "Book a Session",
      subtitle: "Select your preferred date and time to reserve your cinematic experience.",
      selectDate: "Select Date",
      availableTimes: "Available Times",
      details: "Details",
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      eventType: "Event Type",
      package: "Package",
      selectPackageOption: "Select Package",
      notes: "Additional Notes",
      confirmBooking: "Confirm Booking",
      confirmedTitle: "Booking Confirmed!",
      confirmedDesc: "Your session has been successfully booked. Please check your Client Portal.",
      authNotice: "You will be asked to sign in or create an account via the Client Portal to confirm your booking.",
      errSelectDateTime: "Please select a date and time.",
      errCaptcha: "Please confirm you are not a robot (CAPTCHA).",
      portrait: "Portrait",
      wedding: "Wedding",
      commercial: "Commercial",
      other: "Other"
    },
    faq: {
      title: "FAQ",
      subtitle: "Common questions about our process.",
      items: [
        {
          q: "How far in advance should we book?",
          a: "For weddings, we recommend booking 9-12 months in advance as our calendar fills quickly. For portraits and commercial sessions, 4-6 weeks is usually sufficient."
        },
        {
          q: "Do you travel for destination weddings?",
          a: "Absolutely. We are available for assignments worldwide. Travel and accommodation fees are calculated based on the destination and added to your package."
        },
        {
          q: "When will we receive our final photos/video?",
          a: "Portrait galleries are delivered within 2 weeks. Full wedding galleries and cinematic films are typically delivered within 6-8 weeks, ensuring meticulous attention to editing."
        },
        {
          q: "Do we get raw, unedited files?",
          a: "We do not provide raw files. Editing is half the magic of our cinematic style, and we only deliver finished, color-graded masterpieces that represent our brand standard."
        }
      ]
    },
    testimonials: {
      title: "Testimonials",
      items: [
        {
          name: "Arta & Besnik",
          role: "Wedding Clients",
          text: "2B Vision didn't just film our wedding; they captured the core of our love story. The cinematic quality of their work is incomparable. We were left speechless."
        },
        {
          name: "Mirela",
          role: "Creative Director",
          text: "Collaborating with them for our commercial campaign was a revelation. They bring a level of sophistication and minimalist elegance that completely elevated our brand."
        },
        {
          name: "Erion",
          role: "Portrait Session",
          text: "I have never felt so comfortable in front of the camera. The team's direction is gentle, professional, and results in portraits that look like they belong in a luxury magazine."
        }
      ]
    },
    footer: {
      desc: "Capturing moments with cinematic precision. Premium photography and videography for weddings, commercial projects, and high-end portraits.",
      contact: "Contact",
      social: "Social",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "All rights reserved."
    },
    dashboard: {
      welcome: "Welcome back",
      signOut: "Sign Out",
      yourSessions: "Your Sessions",
      noBookings: "You have no active bookings.",
      bookSession: "Book a Session",
      viewDetails: "View Details",
      yourMedia: "Your Media",
      quickActions: "Quick Actions",
      viewPricing: "View Pricing",
      accountSettings: "Account Settings",
      needHelp: "Need Help?",
      helpDesc: "Contact your dedicated producer for questions about your upcoming sessions.",
      contactSupport: "Contact Support"
    }
  },
  sq: {
    common: {
      loading: "Po ngarkohet...",
      pending: "Në pritje",
      confirmed: "Konfirmuar",
      completed: "Përfunduar",
      back: "Kthehu",
    },
    nav: {
      home: "Kreu",
      story: "Historia Jonë",
      portfolio: "Portfolio",
      pricing: "Çmimet",
      booking: "Rezervo",
      portal: "Portali i Klientit",
      dashboard: "Paneli",
    },
    hero: {
      vision: "Vizioni",
      becomes: "juaj kthehet në",
      timelessArt: "art të përjetshëm.",
      bookSession: "Rezervo një Seancë",
    },
    story: {
      title: "Historia Jonë",
      subtitle: "Çdo kryevepër fillon me një",
      subtitleHighlight: "vizion të vetëm.",
      p1: "2B Vision u themelua nga krijues të pasionuar të cilët besonin se fotografia dhe videografia nuk kanë të bëjnë vetëm me kapjen e imazheve, por me tregimin e historive që i mbijetojnë kohës.",
      p2: "Duke filluar me vetëm një aparat fotografik dhe një ëndërr të madhe, rruga jonë drejt suksesit u shtrua me përkushtim të pafund, një sy për emocionet e papërpunuara dhe një qasje kinematografike për çdo projekt. Sot, ne jemi një studio elitare e besuar nga qindra klientë për të dokumentuar trashëgiminë e tyre.",
    },
    stats: {
      experience: "Vite Eksperiencë",
      completed: "Projekte të Përfunduara",
      clients: "Klientë të Lumtur",
      views: "Shikime Totale",
    },
    portfolio: {
      title: "Portfolio",
      all: "Të Gjitha",
      photography: "Fotografi",
      videography: "Videografi",
      underConstruction: "Portfolio është duke u ndërtuar. Kthehuni së shpejti!",
      noProjects: "Nuk ka projekte për këtë kategori.",
      backToPortfolio: "Kthehu te Portfolio",
      aboutProject: "Rreth Projektit",
      clientCategory: "Klienti / Kategoria",
      service: "Shërbimi",
      defaultDescription: "Një vështrim kinematografik dhe një qasje unike për të kapur momentet më të rëndësishme. Ky projekt thekson dedikimin tonë ndaj detajeve dhe artit vizual.",
    },
    pricing: {
      title: "Investimi",
      subtitle: "Zgjidhni paketën që i përshtatet më mirë vizionit tuaj.",
      mostPopular: "Më Popullorja",
      selectPackage: "Zgjidh Paketën",
      contactInfo: "Për të marrë çmimet dhe për detaje të mëtejshme rreth paketave:",
      contactWhatsApp: "Na Kontaktoni në WhatsApp",
      essentialName: "Essential Story",
      essentialDesc: "Ideale për portrete intime dhe seanca të shkurtra.",
      essentialFeat: [
        "Seancë 2 Orëshe në Studio",
        "2 Ndryshime Veshjesh",
        "15 Foto me Rezolucion të Lartë të Retushuara",
        "Galeri Private Online",
        "E drejtë për Printim"
      ],
      cinematicName: "Cinematic Legacy",
      cinematicDesc: "Mbulim i plotë për ditën tuaj të veçantë me montim premium.",
      cinematicFeat: [
        "8 Orë Mbulim",
        "2 Kinematografë",
        "Film Përmbledhës 5-7 Minuta",
        "Video e Plotë e Ceremonisë",
        "Pamje me Dron (në varësi të motit)",
        "Dorëzim Dixhital me USB & Online"
      ],
      commercialName: "Commercial Vision",
      commercialDesc: "Ngritni markën tuaj me foto dhe video komerciale të nivelit të lartë.",
      commercialFeat: [
        "Xhirime Gjysmë Dite (4 Orë)",
        "Mbulim Foto & Video",
        "Video Promovuese 30-sekonda",
        "30 Foto të Redaktuara të Produktit/Markës",
        "Licencë për Përdorim Komercial",
        "Konsulencë për Drejtimin Krijues"
      ]
    },
    booking: {
      title: "Rezervo një Seancë",
      subtitle: "Zgjidhni datën dhe orën tuaj të preferuar për të rezervuar eksperiencën tuaj kinematografike.",
      selectDate: "Zgjidh Datën",
      availableTimes: "Orarët e Disponueshëm",
      details: "Detajet",
      fullName: "Emri i Plotë",
      emailAddress: "Adresa e Email-it",
      phoneNumber: "Numri i Telefonit",
      eventType: "Lloji i Eventit",
      package: "Paketa",
      selectPackageOption: "Zgjidh Paketën",
      notes: "Shënime Shtesë",
      confirmBooking: "Konfirmo Rezervimin",
      confirmedTitle: "Rezervimi u Konfirmua!",
      confirmedDesc: "Seanca juaj është rezervuar me sukses. Ju lutemi kontrolloni Portalin tuaj të Klientit.",
      authNotice: "Do t'ju kërkohet të identifikoheni ose të krijoni një llogari përmes Portalit të Klientit për të konfirmuar rezervimin vuaj.",
      errSelectDateTime: "Ju lutemi zgjidhni datën dhe kohën.",
      errCaptcha: "Ju lutemi konfirmoni që nuk jeni robot (CAPTCHA).",
      portrait: "Portret",
      wedding: "Dasmë",
      commercial: "Komerciale",
      other: "Tjetër"
    },
    faq: {
      title: "FAQ",
      subtitle: "Pyetjet më të shpeshta rreth procesit tonë.",
      items: [
        {
          q: "Sa kohë përpara duhet të rezervojmë?",
          a: "Për dasma, ne rekomandojmë rezervimin 9-12 muaj përpara pasi kalendari ynë mbushet shpejt. Për portrete dhe seanca komerciale, 4-6 javë janë zakonisht të mjaftueshme."
        },
        {
          q: "A udhëtoni për dasma jashtë vendit?",
          a: "Absolutisht. Ne jemi të disponueshëm për shërbime në mbarë botën. Tarifat e udhëtimit dhe akomodimit llogariten sipas destinacionit dhe i shtohen paketës suaj."
        },
        {
          q: "Kur do t'i marrim fotot/videot tona përfundimtare?",
          a: "Galeritë e portreteve dorëzohen brenda 2 javëve. Galeritë e plota të dasmës dhe filmat kinematografikë zakonisht dorëzohen brenda 6-8 javëve, duke siguruar vëmendje të plotë ndaj detajeve gjatë redaktimit."
        },
        {
          q: "A mund të marrim skedarët e papërpunuar (raw)?",
          a: "Ne nuk ofrojmë skedarë të papërpunuar. Redaktimi është gjysma e magjisë së stilit tonë kinematografik, dhe ne dorëzojmë vetëm kryevepra të përfunduara dhe të ngjyrosura profesionalisht që përfaqësojnë standardin tonë të markës."
        }
      ]
    },
    testimonials: {
      title: "Përshtypjet",
      items: [
        {
          name: "Arta & Besnik",
          role: "Klientë Dasme",
          text: "2B Vision nuk na filmoi vetëm dasmën; ata kapën thelbin e historisë sonë të dashurisë. Cilësia kinematografike e punës së tyre është e papërsëritshme. U mbetëm pa fjalë."
        },
        {
          name: "Mirela",
          role: "Drejtoreshë Krijuese",
          text: "Bashkëpunimi me ta për fushatën tonë komerciale ishte një zbulim. Sjellin një nivel sofistikimi dhe elegance minimaliste që ngriti plotësisht markën tonë."
        },
        {
          name: "Erion",
          role: "Seancë Portretesh",
          text: "Nuk jam ndjerë kurrë kaq rehat para kamerës. Drejtimi i ekipit është i butë, profesional, dhe rezulton në portrete që duken sikur i takojnë një reviste luksoze."
        }
      ]
    },
    footer: {
      desc: "Kapja e momenteve me saktësi kinematografike. Fotografi dhe videografi premium për dasma, projekte komerciale dhe portrete luksoze.",
      contact: "Kontakt",
      social: "Social",
      privacy: "Politika e Privatësisë",
      terms: "Kushtet e Shërbimit",
      rights: "Të gjitha të drejtat e rezervuara."
    },
    dashboard: {
      welcome: "Mirë se erdhët përsëri",
      signOut: "Çkyçu",
      yourSessions: "Seancat tuaja",
      noBookings: "Nuk keni asnjë rezervim aktiv.",
      bookSession: "Rezervo një Seancë",
      viewDetails: "Shiko Detajet",
      yourMedia: "Mediat tuaja",
      quickActions: "Veprime të Shpejta",
      viewPricing: "Shiko Çmimet",
      accountSettings: "Cilësimet e Llogarisë",
      needHelp: "Keni Nevojë për Ndihmë?",
      helpDesc: "Kontaktoni me producentin tuaj të dedikuar për pyetje rreth seancave tuaja të ardhshme.",
      contactSupport: "Kontakto Mbështetjen"
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'sq';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'sq') {
      setLanguage(lang);
    }
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let value = translations[language];
    for (const key of keys) {
      if (!value || value[key] === undefined) {
        let fallback = translations.en;
        for (const fKey of keys) {
          if (!fallback || fallback[fKey] === undefined) return keyPath;
          fallback = fallback[fKey];
        }
        return fallback;
      }
      value = value[key];
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
