export type BreadcrumbItem = { name: string; url: string }
export type FAQItem = { question: string; answer: string }
export type OpeningHour = { days: string; opens: string; closes: string }
export type Department = { localBusinessType: string; moreSpecificType: string; name: string; image?: string; telephone: string; days: string; opens: string; closes: string; street?: string; city?: string; region?: string; postalCode?: string; country?: string; priceRange?: string; sameAsMain?: string }
export type ContactPoint = { contactType: string; phone: string; areaServed: string; availableLanguage: string; options: string }
export type TicketType = { name: string; price: string; currency?: string; availableFrom?: string; url?: string; availability?: string }
export type OrgExtra = { key: string; value: string }
export type EducationItem = { name: string; url: string }

export type BuildParams = {
  type: string
  fields: Record<string, string>
  images: string[]
  breadcrumbs: BreadcrumbItem[]
  faqItemsState: FAQItem[]
  socialProfiles: string[]
  education: EducationItem[]
  videoThumbnails: string[]
  videoMinutes: string
  videoSeconds: string
  openingHoursState: OpeningHour[]
  departments: Department[]
  contacts: ContactPoint[]
  ticketTypes: TicketType[]
  ticketDefaultCurrency: string
  reviews?: Review[]
  orgExtras?: OrgExtra[]
  // How-to specific repeaters (optional)
  howToTools?: string[]
  howToSupplies?: string[]
  howToSteps?: Array<{ instruction: string; image?: string; name?: string; url?: string }>
}

export type Review = { name: string; body: string; rating: string; date: string }