// Centralized schema-related static constants extracted from SchemaBuilder
// Keep pure data only; no runtime-dependent logic.

export const schemaDescriptions: Record<string, string> = {
  Article: "Blog posts or news content.",
  Breadcrumb: "Website structure: Home → Category → Page.",
  "FAQ Page": "Questions & answers for rich results.",
  "How-to": "Step-by-step instructions for tasks.",
  "Local Business": "Local service, hours, and location.",
  Organization: "Company brand, socials, and contacts.",
  Product: "SKU, price, reviews, and offers.",
  Recipe: "Cooking instructions, ingredients and timings.",
  Video: "Video metadata with thumbnail, embed & file URL.",
  "Website Sitelinks Searchbox": "Enable sitelinks searchbox in Google.",
  Person: "Information about an individual or author profile.",
  "Job Posting": "Job details for open positions.",
  Event: "Events, dates, and locations.",
}

export const schemaExamples: Record<string, string> = {
  Article: "Article, BlogPosting, NewsArticle",
  Breadcrumb: "Help Google understand your page hierarchy",
  "FAQ Page": "Add questions and answers to create a valid FAQ schema",
  "How-to": "Schema Builder for How-To Guides and Step-by-Step Content",
  "Local Business": "LocalBusiness, Store, Restaurant",
  Product: "Product, Offer, AggregateOffer",
  Recipe: "Recipe — ingredients, cookTime, recipeInstructions",
  Video: "VideoObject",
  "Website Sitelinks Searchbox": "WebSite + SearchAction",
  Organization: "Organization, LocalBusiness, Corporation",
  Person: "Person, Author, Speaker",
  "Job Posting": "Schema Builder for Job Listings, Hiring Info, and Requirements",
  Event: "Generate Structured Data for Events, Business Events, and Festivals",
}

export const HELP_LINKS: Record<string, { schema: { label: string; url: string }[]; google?: { label: string; url: string }[] }> = {
  Article: {
    schema: [
      { label: "Article", url: "https://schema.org/Article" },
      { label: "BlogPosting", url: "https://schema.org/BlogPosting" },
      { label: "NewsArticle", url: "https://schema.org/NewsArticle" },
    ],
    google: [{ label: "Article", url: "https://developers.google.com/search/docs/appearance/structured-data/article" }],
  },
  Breadcrumb: {
    schema: [{ label: "BreadcrumbList", url: "https://schema.org/BreadcrumbList" }],
    google: [{ label: "Breadcrumb", url: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb" }],
  },
  "FAQ Page": {
    schema: [{ label: "FAQPage", url: "https://schema.org/FAQPage" }],
    google: [{ label: "FAQPage", url: "https://developers.google.com/search/docs/appearance/structured-data/faqpage" }],
  },
  "How-to": {
    schema: [{ label: "HowTo", url: "https://schema.org/HowTo" }],
    google: [{ label: "HowTo", url: "https://developers.google.com/search/docs/appearance/structured-data/how-to" }],
  },
  "Local Business": {
    schema: [{ label: "LocalBusiness", url: "https://schema.org/LocalBusiness" }],
    google: [{ label: "Local business", url: "https://developers.google.com/search/docs/appearance/structured-data/local-business" }],
  },
  Organization: {
    schema: [{ label: "Organization", url: "https://schema.org/Organization" }],
    google: [{ label: "Organization", url: "https://developers.google.com/search/docs/appearance/structured-data/organization" }],
  },
  Product: {
    schema: [{ label: "Product", url: "https://schema.org/Product" }],
    google: [{ label: "Product", url: "https://developers.google.com/search/docs/appearance/structured-data/product" }],
  },
  Recipe: {
    schema: [{ label: "Recipe", url: "https://schema.org/Recipe" }],
    google: [{ label: "Recipe", url: "https://developers.google.com/search/docs/appearance/structured-data/recipe" }],
  },
  Video: {
    schema: [{ label: "VideoObject", url: "https://schema.org/VideoObject" }],
    google: [{ label: "Video", url: "https://developers.google.com/search/docs/appearance/structured-data/video" }],
  },
  Person: {
    schema: [{ label: "Person", url: "https://schema.org/Person" }],
    google: [{ label: "Person", url: "https://developers.google.com/search/docs/appearance/structured-data/person" }],
  },
  "Job Posting": {
    schema: [{ label: "JobPosting", url: "https://schema.org/JobPosting" }],
    google: [{ label: "Job Posting", url: "https://developers.google.com/search/docs/appearance/structured-data/job-posting" }],
  },
  Event: {
    schema: [{ label: "Event", url: "https://schema.org/Event" }],
    google: [{ label: "Event", url: "https://developers.google.com/search/docs/appearance/structured-data/event" }],
  },
  "Website Sitelinks Searchbox": {
    schema: [{ label: "WebSite + SearchAction", url: "https://schema.org/WebSite" }],
    google: [{ label: "Sitelinks searchbox", url: "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox" }],
  },
}

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "TEMPORARY",
  "INTERN",
  "VOLUNTEER",
  "PER_DIEM",
]

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "", label: "Select employment type" },
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERN", label: "Intern" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "PER_DIEM", label: "Per diem" },
  { value: "OTHER", label: "Other" },
]

export const SALARY_UNITS = ["YEAR", "MONTH", "WEEK", "DAY", "HOUR"]

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export const DAY_CODE_MAP: Record<string, string> = {
  Monday: "Mo",
  Mon: "Mo",
  Tuesday: "Tu",
  Tue: "Tu",
  Wednesday: "We",
  Wed: "We",
  Thursday: "Th",
  Thu: "Th",
  Friday: "Fr",
  Fri: "Fr",
  Saturday: "Sa",
  Sat: "Sa",
  Sunday: "Su",
  Sun: "Su",
}

export const DAY_ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export const LOCAL_BUSINESS_TYPES: { value: string; desc: string }[] = [
  { value: "LocalBusiness", desc: "A particular physical business or branch of an organization." },
  { value: "AnimalShelter", desc: "Animal shelter." },
  { value: "AutomotiveBusiness", desc: "Car repair, sales, or parts." },
  { value: "ChildCare", desc: "A Childcare center." },
  { value: "Dentist", desc: "A dentist." },
  { value: "DryCleaningOrLaundry", desc: "A dry-cleaning business." },
  { value: "EmergencyService", desc: "Emergency services, such as fire station or ER." },
  { value: "EntertainmentBusiness", desc: "Entertainment provider." },
  { value: "FinancialService", desc: "Financial services business." },
  { value: "FoodEstablishment", desc: "A food-related business." },
  { value: "GovernmentOffice", desc: "A government office." },
  { value: "HealthAndBeautyBusiness", desc: "Health and beauty." },
  { value: "HomeAndConstructionBusiness", desc: "A construction business." },
  { value: "InternetCafe", desc: "An internet cafe." },
  { value: "LegalService", desc: "Legal services such as law firms." },
  { value: "Library", desc: "A library." },
  { value: "LodgingBusiness", desc: "Hotels, motels, or inns." },
  { value: "MedicalBusiness", desc: "Medical or healthcare business." },
  { value: "ProfessionalService", desc: "Provider of professional services." },
  { value: "RealEstateAgent", desc: "Real estate agent or firm." },
  { value: "Store", desc: "Retail store." },
  { value: "SportsActivityLocation", desc: "Sports or recreation facility." },
  { value: "TravelAgency", desc: "A travel agency." },
]

export const SUBTYPE_MAP: Record<string, { value: string; desc: string }[]> = {
  FoodEstablishment: [
    { value: "Restaurant", desc: "Standard dining restaurant" },
    { value: "CafeOrCoffeeShop", desc: "Coffee & tea café" },
    { value: "BarOrPub", desc: "Alcohol service on premises" },
    { value: "Bakery", desc: "Bread, cake & pastries" },
    { value: "FastFoodRestaurant", desc: "Quick service" },
    { value: "IceCreamShop", desc: "Ice cream & frozen treats" },
    { value: "Winery", desc: "Wine production or tasting" },
    { value: "Brewery", desc: "Beer production" },
  ],
  HealthAndBeautyBusiness: [
    { value: "DaySpa", desc: "Spa & relaxation treatments" },
    { value: "HairSalon", desc: "Barber and hair styling" },
    { value: "BeautySalon", desc: "Cosmetic & makeup services" },
    { value: "TattooParlor", desc: "Tattoo studio" },
  ],
  LodgingBusiness: [
    { value: "Hotel", desc: "Full-service hotel" },
    { value: "Motel", desc: "Roadside motel" },
    { value: "Resort", desc: "Resort & recreation" },
    { value: "BedAndBreakfast", desc: "Hosted B&B" },
    { value: "VacationRental", desc: "Short-term rental" },
  ],
  Store: [
    { value: "GroceryStore", desc: "Supermarket" },
    { value: "ClothingStore", desc: "Fashion retail" },
    { value: "ElectronicsStore", desc: "Tech & electronics" },
    { value: "FurnitureStore", desc: "Furniture & décor" },
    { value: "PetStore", desc: "Pet supplies" },
    { value: "JewelryStore", desc: "Jewelry & watches" },
  ],
}

export const EVENT_STATUSES = [
  { value: "", label: "None" },
  { value: "EventScheduled", label: "Scheduled" },
  { value: "EventPostponed", label: "Postponed" },
  { value: "EventCancelled", label: "Cancelled" },
  { value: "EventMovedOnline", label: "Moved online" },
]

export const ATTENDANCE_MODES = [
  { value: "", label: "None" },
  { value: "OnlineEventAttendanceMode", label: "Online" },
  { value: "OfflineEventAttendanceMode", label: "Offline" },
  { value: "MixedEventAttendanceMode", label: "Mixed" },
]

export const PERFORMER_TYPES = [
  { value: "", label: "None" },
  { value: "Person", label: "Person" },
  { value: "PerformingGroup", label: "Performing group" },
  { value: "MusicGroup", label: "Music group" },
  { value: "DanceGroup", label: "Dance group" },
  { value: "TheaterGroup", label: "Theater group" },
  { value: "Organization", label: "Organization" },
]

export const TICKET_AVAILABILITY_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "InStock", label: "In stock" },
  { value: "OutOfStock", label: "Sold out" },
  { value: "PreOrder", label: "Pre-order" },
]

export const COMMON_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "TZS", name: "Tanzanian Shilling" },
]