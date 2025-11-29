export type BreadcrumbItem = { name: string; url: string }
export type FAQItem = { question: string; answer: string }
export type OpeningHour = { days: string; opens: string; closes: string }
export type Department = { localBusinessType: string; moreSpecificType: string; name: string; imageUrl: string; telephone: string; days: string; opens: string; closes: string }
export type ContactPoint = { contactType: string; phone: string; areaServed: string; availableLanguage: string; options: string }
export type TicketType = { name: string; price: string; currency?: string; availableFrom?: string; url?: string; availability?: string }

export type BuildParams = {
  type: string
  fields: Record<string, string>
  images: string[]
  breadcrumbs: BreadcrumbItem[]
  faqItemsState: FAQItem[]
  socialProfiles: string[]
  videoThumbnails: string[]
  videoMinutes: string
  videoSeconds: string
  openingHoursState: OpeningHour[]
  departments: Department[]
  contacts: ContactPoint[]
  ticketTypes: TicketType[]
  ticketDefaultCurrency: string
}

export type Review = { name: string; body: string; rating: string; date: string; author: string; publisher: string }
