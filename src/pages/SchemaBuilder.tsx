// src/pages/SchemaBuilder.tsx
import { useState, useMemo, useEffect, type ComponentType } from "react"
import { Plus, Minus } from "lucide-react"
import { Helmet } from "react-helmet-async"
import { buildSchemaFromState, schemaFields, schemaDescriptions, schemaExamples, HELP_LINKS } from "../utils/schema/builders"
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import type { StateProps } from '../types/state'
import StateSelectFallback from "../components/StateSelectFallback"
import * as countryRegionData from 'country-region-data'
// Prefer `currency-codes` (installed). Avoid importing `currency-list` to prevent module-not-found.
import currencyCodes from "currency-codes"
import ISO6391 from "iso-639-1"

import Seo from "../components/Seo"

// Preview icons are now imported by `SchemaPreview` component

// toolsData not required directly here; related tools component is used below
import RelatedTools from "../components/RelatedTools"
import SchemaPreview from "../components/SchemaPreview"
import ProductForm from "../components/schema/ProductForm"
import EventForm from "../components/schema/EventForm"
import OrganizationForm from "../components/schema/OrganizationForm"
import LocalBusinessForm from "../components/schema/LocalBusinessForm"
import WebsiteForm from "../components/schema/WebsiteForm"
import { PersonForm, type PersonFields, HowToForm, type HowToFields, VideoForm, type VideoFields, JobPostingForm, type JobPostingFields } from "../components/schema"
import ArticleForm from "../components/schema/ArticleForm"
import type { ArticleFields } from "../types/article"
import FaqForm from "../components/schema/FaqForm"

import { downloadText, copyToClipboard } from "../utils"

const RICH_RESULT_ELIGIBILITY: Record<string, { eligible: string; recommended: string[] }> = {
  Article: {
    eligible: "Can be eligible for article rich result features when headline, image, dates, author, and publisher data are complete.",
    recommended: ["headline", "authorName", "datePublished", "images", "publisherName"],
  },
  Product: {
    eligible: "Can be eligible for product and review snippets when offer, image, rating, and product identity fields are complete.",
    recommended: ["name", "image", "price", "currency", "availability", "ratingValue"],
  },
  "FAQ Page": {
    eligible: "Can describe FAQ content. Google has limited FAQ rich results, but the markup remains useful for content understanding.",
    recommended: ["faqItems"],
  },
  "How-to": {
    eligible: "Can describe step-by-step content when each instruction is complete and accurate.",
    recommended: ["name", "steps", "description"],
  },
  "Local Business": {
    eligible: "Strengthens local entity understanding when address, phone, URL, hours, and business type are complete.",
    recommended: ["name", "url", "telephone", "street", "city", "country"],
  },
  Event: {
    eligible: "Can be eligible for event search features when dates, venue, event status, organizer, and offer data are complete.",
    recommended: ["name", "startDate", "location", "description"],
  },
  Video: {
    eligible: "Can be eligible for video enhancements when thumbnail, upload date, duration, and video URLs are complete.",
    recommended: ["name", "thumbnailUrl", "uploadDate", "duration"],
  },
  "Job Posting": {
    eligible: "Can be eligible for Google job search features when hiring, location, dates, and salary data are complete.",
    recommended: ["title", "jobDescription", "hiringOrganization", "datePosted", "validThrough"],
  },
}

export default function SchemaBuilder(): JSX.Element {
  const getInitialOrgExtras = (schemaType: string): Array<{ key: string; value: string }> =>
    schemaType === "Organization" ? [{ key: "legalName", value: "" }] : []

  const [type, setType] = useState<string>("Article")
  const [fields, setFields] = useState<Record<string, string>>({ articleType: "Article" })

  const [copied, setCopied] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)
  const [testMsgVisible, setTestMsgVisible] = useState(false)
  const [validateMsgVisible, setValidateMsgVisible] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Dropdown open states
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [articleTypeOpen, setArticleTypeOpen] = useState(false)
  // Event-related custom select opens
  const [eventStatusOpen, setEventStatusOpen] = useState(false)
  const [attendanceModeOpen, setAttendanceModeOpen] = useState(false)
  const [performerTypeOpen, setPerformerTypeOpen] = useState(false)
  // Organizer type dropdown for Event organizer @type
  const [organizerTypeOpen, setOrganizerTypeOpen] = useState(false)
  // Ticket availability open index (for per-ticket custom dropdown)
  const [ticketAvailabilityOpenIndex, setTicketAvailabilityOpenIndex] = useState<number | null>(null)
  // Ticket currency open index for per-ticket currency dropdown
  // HowTo currency dropdown state (searchable list for How-to Estimated cost currency)
  const [howToCurrencyOpen, setHowToCurrencyOpen] = useState<boolean>(false)
  const [howToCurrencySearch, setHowToCurrencySearch] = useState<string>("")
  // Salary currency dropdown state (searchable list for Job Posting salary currency)
  // Note: job-posting-specific dropdowns are handled inside the extracted component.
  // LocalBusiness type dropdown state
  const [localBusinessTypeOpen, setLocalBusinessTypeOpen] = useState<boolean>(false)
  // More specific subtype dropdown state
  const [moreSpecificOpen, setMoreSpecificOpen] = useState<boolean>(false)
  // Country / region custom dropdown state
  const [countryOpen, setCountryOpen] = useState<boolean>(false)
  const [countrySearch, setCountrySearch] = useState<string>("")
  const [regionOpen, setRegionOpen] = useState<boolean>(false)
  const [regionSearch, setRegionSearch] = useState<string>("")
  // Venue-specific country dropdown state
  const [venueCountryOpen, setVenueCountryOpen] = useState<boolean>(false)
  const [venueCountrySearch, setVenueCountrySearch] = useState<string>("")
  // Employment type dropdown state for Job Posting
  // Employment type dropdown state for Job Posting is handled inside the extracted component.
  // Organization @type dropdown state
  const [orgTypeOpen, setOrgTypeOpen] = useState<boolean>(false)
  const [orgMoreSpecificOpen, setOrgMoreSpecificOpen] = useState<boolean>(false)
  // Author @type dropdown (for Article form)
  const [authorTypeOpen, setAuthorTypeOpen] = useState<boolean>(false)
  // JobPosting-specific dropdown open states (lifted from JobPostingForm)
  const [jobEmploymentTypeOpen, setJobEmploymentTypeOpen] = useState<boolean>(false)
  const [jobCountryOpen, setJobCountryOpen] = useState<boolean>(false)
  const [jobRegionOpen, setJobRegionOpen] = useState<boolean>(false)
  const [jobSalaryCurrencyOpen, setJobSalaryCurrencyOpen] = useState<boolean>(false)
  const [jobSalaryUnitOpen, setJobSalaryUnitOpen] = useState<boolean>(false)
  // Contact type dropdown state (per-contact index)
  const [contactTypeOpenIndex, setContactTypeOpenIndex] = useState<number | null>(null)
  // Area(s) Served country dropdown (per-contact index) and search
  const [areaCountryOpenIndex, setAreaCountryOpenIndex] = useState<number | null>(null)
  const [areaCountrySearch, setAreaCountrySearch] = useState<string>("")
  // Contact Options dropdown (per-contact index)
  const [optionsOpenIndex, setOptionsOpenIndex] = useState<number | null>(null)
  // Contact Language(s) dropdown (per-contact index) and search
  const [languageOpenIndex, setLanguageOpenIndex] = useState<number | null>(null)
  const [languageSearch, setLanguageSearch] = useState<string>("")
  // Top-level Organization Language(s) dropdown state
  // (Removed Organization-level languages dropdown per request)
  // Memoized country list for Area(s) Served dropdown (English)
  countries.registerLocale(enLocale)
  // Ticket currency open index for repeater (- null when closed)
  // Default ticket currency dropdown (searchable)
  const [ticketDefaultCurrencyOpen, setTicketDefaultCurrencyOpen] = useState<boolean>(false)
  const [ticketCurrencySearch, setTicketCurrencySearch] = useState<string>("")

  // Images list for Article schema
  const [images, setImages] = useState<string[]>([""])
  // Thumbnails list for Video schema
  const [videoThumbnails, setVideoThumbnails] = useState<string[]>([""])
  // Breadcrumb items for Breadcrumb schema
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; url: string }>>([
    { name: "", url: "" },
  ])
  // FAQ items for FAQ Page schema
  const [faqItemsState, setFaqItemsState] = useState<Array<{ question: string; answer: string }>>([
    { question: "", answer: "" },
  ])

  // Social profiles repeater for Person schema
  const [socialProfiles, setSocialProfiles] = useState<string[]>([])
  // Education repeater for Person schema
  const [education, setEducation] = useState<Array<{ name: string; url: string }>>([])
  // Reviews repeater for Product schema: array of review objects
  const [reviews, setReviews] = useState<Array<{
    name: string
    body: string
    rating: string
    date: string
  }>>([])
  // Opening hours repeater for Local Business
  const [openingHoursState, setOpeningHoursState] = useState<Array<{ days: string; opens: string; closes: string }>>([])

  // Departments repeater for Local Business (sub-units)
  const [departments, setDepartments] = useState<Array<{ localBusinessType: string; moreSpecificType: string; name: string; image?: string; telephone: string; days: string; opens: string; closes: string; street?: string; city?: string; region?: string; postalCode?: string; country?: string; priceRange?: string; sameAsMain?: string }>>([])

  // Per-department dropdown open indices for styled selects
  const [deptLocalBusinessOpenIndex, setDeptLocalBusinessOpenIndex] = useState<number | null>(null)
  const [deptMoreSpecificOpenIndex, setDeptMoreSpecificOpenIndex] = useState<number | null>(null)
  const [deptCountryOpenIndex, setDeptCountryOpenIndex] = useState<number | null>(null)
  const [deptCountrySearch, setDeptCountrySearch] = useState<string>("")
  const [deptRegionOpenIndex, setDeptRegionOpenIndex] = useState<number | null>(null)
  const [deptRegionSearch, setDeptRegionSearch] = useState<string>("")
  const [deptRegionCustomVisibleIndex, setDeptRegionCustomVisibleIndex] = useState<number | null>(null)
  // Opening days dropdown open index (per-opening-hour row)
  const [openingDaysOpenIndex, setOpeningDaysOpenIndex] = useState<number | null>(null)
  // Per-department opening days dropdown
  const [deptOpeningDaysOpenIndex, setDeptOpeningDaysOpenIndex] = useState<number | null>(null)

  // Contacts repeater for Organization schema
  const EMPTY_CONTACT = { contactType: "Customer Service", phone: "", areaServed: "", availableLanguage: "", options: "" }
  const [contacts, setContacts] = useState<Array<{ contactType: string; phone: string; areaServed: string; availableLanguage: string; options: string }>>([EMPTY_CONTACT])
  // Organization Additional Info repeater
  const [orgExtras, setOrgExtras] = useState<Array<{ key: string; value: string }>>(getInitialOrgExtras("Article"))
  const [orgExtraKeyOpenIndex, setOrgExtraKeyOpenIndex] = useState<number | null>(null)

  // Product identification dropdown state (sku, gtin8, gtin13, gtin14, mpn)
  const [productIdOpen, setProductIdOpen] = useState<boolean>(false)
  const [productIdSelected, setProductIdSelected] = useState<string[]>([])

  // Product availability dropdown state
  const [productAvailabilityOpen, setProductAvailabilityOpen] = useState<boolean>(false)
  const [productItemConditionOpen, setProductItemConditionOpen] = useState<boolean>(false)

  // Publish / Modified date pickers (fields.datePublished and fields.dateModified are stored in `fields`)

  // Video duration inputs (minutes & seconds)
  const [videoMinutes, setVideoMinutes] = useState<string>("")
  const [videoSeconds, setVideoSeconds] = useState<string>("")
  // Product offer type dropdown state
  const [productOfferOpen, setProductOfferOpen] = useState<boolean>(false)
  // Product currency dropdown state
  const [productCurrencyOpen, setProductCurrencyOpen] = useState<boolean>(false)
  const [productCurrencySearch, setProductCurrencySearch] = useState<string>("")

  // Event specific: ticket types repeater and performer info
  const [ticketTypes, setTicketTypes] = useState<Array<{ name: string; price: string; currency?: string; availableFrom?: string; url?: string; availability?: string }>>([])
  const [ticketDefaultCurrency, setTicketDefaultCurrency] = useState<string>("")

  // How-to (HowTo) repeaters: tools, supplies, and detailed steps
  const [howToTools, setHowToTools] = useState<string[]>([])
  const [howToSupplies, setHowToSupplies] = useState<string[]>([])
  const [howToSteps, setHowToSteps] = useState<Array<{ instruction: string; image?: string; name?: string; url?: string }>>([
    { instruction: "" },
  ])

  const addTicketType = () =>
    setTicketTypes((prev) => [
      ...prev,
      { name: "", price: "", availableFrom: "", url: "", availability: "" },
    ])

  // How-to handlers
  const addHowToTool = () => setHowToTools((prev) => [...prev, ""])
  const updateHowToTool = (index: number, value: string) => setHowToTools((prev) => {
    const next = [...prev]
    next[index] = value
    return next
  })
  const removeHowToTool = (index: number) => setHowToTools((prev) => prev.filter((_, i) => i !== index))

  const addHowToSupply = () => setHowToSupplies((prev) => [...prev, ""])
  const updateHowToSupply = (index: number, value: string) => setHowToSupplies((prev) => {
    const next = [...prev]
    next[index] = value
    return next
  })
  const removeHowToSupply = (index: number) => setHowToSupplies((prev) => prev.filter((_, i) => i !== index))

  const addHowToStep = () => setHowToSteps((prev) => [...prev, { instruction: "" }])
  const updateHowToStep = (index: number, key: keyof (typeof howToSteps)[0], value: string) => {
    setHowToSteps((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
    // Immediate validation for URL/image fields on change so users see errors right away
    if (key === "url") validateField(`howto_step_url_${index}`, value || "", fields)
    if (key === "image") validateField(`howto_step_image_${index}`, value || "", fields)
  }
  const removeHowToStep = (index: number) => {
    const next = howToSteps.filter((_, i) => i !== index)
    setHowToSteps(next)
    // Clear previous step-related errors and revalidate remaining steps to keep keys in sync
    setErrors((prev) => {
      const nextErr = { ...prev }
      Object.keys(nextErr).forEach((k) => {
        if (k.startsWith("howto_step_url_") || k.startsWith("howto_step_image_")) delete nextErr[k]
      })
      return nextErr
    })
    next.forEach((s, i) => {
      validateField(`howto_step_url_${i}`, s.url || "", fields)
      validateField(`howto_step_image_${i}`, s.image || "", fields)
    })
  }

  const updateTicketType = (index: number, key: string, value: string) => {
    setTicketTypes((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const removeTicketType = (index: number) => setTicketTypes((prev) => prev.filter((_, i) => i !== index))

  // Close schema type dropdown when clicking outside
  useEffect(() => {
    const closeAllDropdowns = () => {
      try {
        setDropdownOpen(false)
        setArticleTypeOpen(false)
        setEventStatusOpen(false)
        setAttendanceModeOpen(false)
        setPerformerTypeOpen(false)
        setTicketAvailabilityOpenIndex(null)
        setHowToCurrencyOpen(false)
        setHowToCurrencySearch("")
        setLocalBusinessTypeOpen(false)
        setMoreSpecificOpen(false)
        setCountryOpen(false)
        setCountrySearch("")
        setRegionOpen(false)
        setRegionSearch("")
        setOrgTypeOpen(false)
        setOrgMoreSpecificOpen(false)
        setAuthorTypeOpen(false)
        setJobEmploymentTypeOpen(false)
        setJobCountryOpen(false)
        setJobRegionOpen(false)
        setJobSalaryCurrencyOpen(false)
        setJobSalaryUnitOpen(false)
        setOrgExtraKeyOpenIndex(null)
        setContactTypeOpenIndex(null)
        setAreaCountryOpenIndex(null)
        setAreaCountrySearch("")
        setOptionsOpenIndex(null)
        setLanguageOpenIndex(null)
        setLanguageSearch("")
        setTicketDefaultCurrencyOpen(false)
        setTicketCurrencySearch("")
        setTimezoneOpen(false)
        setTimezoneSearch("")
        setVenueCountryOpen(false)
        setVenueCountrySearch("")
        setDeptLocalBusinessOpenIndex(null)
        setDeptMoreSpecificOpenIndex(null)
        setOpeningDaysOpenIndex(null)
        setDeptOpeningDaysOpenIndex(null)
        setProductIdOpen(false)
        setProductAvailabilityOpen(false)
        setProductItemConditionOpen(false)
        setProductCurrencyOpen(false)
        setKnowsLangOpen(false)
        setKnowsLangSearch("")
      } catch {
        // ignore errors in teardown
      }
    }

    const handleClickOutside = (e: MouseEvent | Event) => {
      const target = (e as MouseEvent).target as HTMLElement | null
      if (!target) return

      // If the user clicked directly on a select trigger, let that trigger handle opening/closing.
      if (target.closest('.custom-select-trigger')) return
      // If the click was inside an open select list (options area), don't close — allow interacting with options.
      if (target.closest('.custom-select-list')) return

      // Otherwise close all open dropdowns (clicking anywhere closes them).
      closeAllDropdowns()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllDropdowns()
    }

    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  // Schema-related constants have been extracted to `src/utils/schema/builders.ts` and are imported above.

  const renderHelpLinks = (schemaType: string) => {
    const entry = HELP_LINKS[schemaType]
    if (!entry) return null

    const schemaLinks = (entry.schema || []).map((s) => (
      <li key={s.url} className="mt-1">
        <a className="text-primary" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
      </li>
    ))

    const googleLinks = (entry.google || []).map((g) => (
      <li key={g.url} className="mt-1">
        <a className="text-primary text-base" href={g.url} target="_blank" rel="noopener noreferrer">{g.label}</a>
      </li>
    ))

    return (
      <div className="mt-2 text-base text-gray-600">
        <hr className="my-4 border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong className="text-base">Schema.org:</strong>
            <div className="mt-1">{schemaLinks.length ? <ul className="list-disc ml-5">{schemaLinks}</ul> : null}</div>
          </div>
          <div>
            <strong className="text-base">Google docs:</strong>
            <div className="mt-1">{googleLinks.length ? <ul className="list-disc ml-5">{googleLinks}</ul> : null}</div>
          </div>
        </div>
      </div>
    )
  }

  // Field definitions moved to `src/utils/schema/builders.ts` and are
  // imported at the top of this file as `schemaFields`, `schemaDescriptions`,
  // `schemaExamples`, and `HELP_LINKS`.

  // Employment / salary options
  const EMPLOYMENT_TYPES = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACTOR",
    "TEMPORARY",
    "INTERN",
    "VOLUNTEER",
    "PER_DIEM",
  ]

  // Employment type options are used by validation; the UI-specific options are provided by the extracted component.

  const SALARY_UNITS = ["YEAR", "MONTH", "WEEK", "DAY", "HOUR"]

  // Days of week for opening hours dropdown
  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  // Timezones list (try Intl.supportedValuesOf if available, fallback to common ones)
  const TIMEZONES: string[] = (() => {
    try {
      // @ts-ignore: supportedValuesOf may not be typed in this environment
      const vals = (Intl as any).supportedValuesOf?.('timeZone')
      if (Array.isArray(vals) && vals.length) return vals
    } catch {
      // ignore
    }
    return ["UTC", "Africa/Nairobi", "Europe/London", "America/New_York", "Asia/Kolkata", "Asia/Tokyo"]
  })()

  // Helpers to compute current GMT offset for a given IANA timezone
  const getTimezoneOffsetMinutes = (timeZone: string) => {
    try {
      const now = new Date()
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      const parts = fmt.formatToParts(now).reduce((acc: any, p: any) => {
        acc[p.type] = p.value
        return acc
      }, {})

      const year = Number(parts.year)
      const month = Number(parts.month) - 1
      const day = Number(parts.day)
      const hour = Number(parts.hour)
      const minute = Number(parts.minute)
      const second = Number(parts.second)

      // The UTC timestamp that corresponds to the wall-clock time in the target timezone
      const utcForTz = Date.UTC(year, month, day, hour, minute, second)
      const nowMs = now.getTime()
      // Positive minutes means the timezone is ahead of UTC (e.g. +180 for GMT+3)
      const offsetMinutes = Math.round((utcForTz - nowMs) / 60000)
      return offsetMinutes
    } catch {
      return 0
    }
  }

  const formatGmtOffset = (mins: number) => {
    const sign = mins >= 0 ? '+' : '-'
    const m = Math.abs(mins)
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    return `GMT${sign}${hh}:${mm}`
  }

  // Map full day names (or short codes) to schema.org day codes
  

  
  // LocalBusiness @type options with descriptions
  const LOCAL_BUSINESS_TYPES: { value: string; desc: string }[] = [
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

  // ---------- Subtype map ----------
  const SUBTYPE_MAP: Record<string, { value: string; desc: string }[]> = {
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
    FinancialService: [
      { value: "AccountingService", desc: "Accounting services" },
      { value: "AutomatedTeller", desc: "ATM" },
      { value: "BankOrCreditUnion", desc: "Bank or credit union" },
      { value: "InsuranceAgency", desc: "Insurance agency" },
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

  // Organization types and subtypes (used in Organization form)
  const ORG_TYPES: { value: string; desc: string }[] = [
    { value: "Organization", desc: "A general organization like a business, NGO, or club." },
    { value: "Airline", desc: "Provides passenger flight services." },
    { value: "Consortium", desc: "A membership body of organizations." },
    { value: "Corporation", desc: "A registered business company." },
    { value: "EducationalOrganization", desc: "A school, college, or learning institution." },
    { value: "FundingScheme", desc: "Grant funding program." },
    { value: "GovernmentOrganization", desc: "Public or state-run institution." },
    { value: "LibrarySystem", desc: "Network of cooperating libraries." },
    { value: "MedicalOrganization", desc: "Healthcare provider." },
    { value: "NGO", desc: "Non-profit organization." },
    { value: "NewsMediaOrganization", desc: "Publishes or broadcasts news." },
    { value: "OnlineBusiness", desc: "Internet-based business." },
    { value: "PerformingGroup", desc: "Music, dance, or theater group." },
    { value: "PoliticalParty", desc: "Organized political movement." },
    { value: "Project", desc: "Organized planned initiative." },
    { value: "ResearchOrganization", desc: "Academic or scientific research." },
    { value: "SearchRescueOrganization", desc: "Emergency search & rescue." },
    { value: "SportsOrganization", desc: "Sports organizing body." },
    { value: "WorkersUnion", desc: "Represents employees’ interests." },
  ]

  const ORG_SUBTYPE_MAP: Record<string, { value: string; desc: string }[]> = {
    EducationalOrganization: [
      { value: "CollegeOrUniversity", desc: "Higher education institution." },
      { value: "ElementarySchool", desc: "Primary education." },
      { value: "HighSchool", desc: "Secondary education." },
      { value: "MiddleSchool", desc: "Intermediate level school." },
      { value: "Preschool", desc: "Early childhood education." },
      { value: "School", desc: "General education facility." },
    ],
    MedicalOrganization: [
      { value: "Dentist", desc: "Dental healthcare." },
      { value: "Hospital", desc: "Large healthcare facility." },
      { value: "MedicalClinic", desc: "Outpatient healthcare." },
      { value: "Pharmacy", desc: "Dispenses medicines." },
      { value: "Physician", desc: "Licensed medical doctor." },
      { value: "VeterinaryCare", desc: "Animal healthcare." },
    ],
    PerformingGroup: [
      { value: "DanceGroup", desc: "Dance performers." },
      { value: "MusicGroup", desc: "Musical group." },
      { value: "TheaterGroup", desc: "Stage performers." },
    ],
    SportsOrganization: [
      { value: "SportsClub", desc: "Organized sports club." },
      { value: "SportsTeam", desc: "Team in competitions." },
    ],
  }

  // Organization additional info selectable options
  const ORG_ADDITIONAL_OPTIONS: { key: string; label: string }[] = [
    { key: "legalName", label: "Legal Name" },
    { key: "foundingDate", label: "Founding Date" },
    { key: "iso6523Code", label: "ISO 6523 Code" },
    { key: "duns", label: "DUNS" },
    { key: "leiCode", label: "LEI Code" },
    { key: "naicsCode", label: "NAICS Code" },
    { key: "globalLocationNumber", label: "Global Location Number" },
    { key: "vatId", label: "VAT ID" },
    { key: "taxId", label: "Tax ID" },
    { key: "numberOfEmployees", label: "Number of Employees" },
  ]

  const EVENT_STATUSES = [
    { value: "", label: "None" },
    { value: "EventScheduled", label: "Scheduled" },
    { value: "EventPostponed", label: "Postponed" },
    { value: "EventCancelled", label: "Cancelled" },
    { value: "EventMovedOnline", label: "Moved online" },
  ]

  const ATTENDANCE_MODES = [
    { value: "", label: "None" },
    { value: "OnlineEventAttendanceMode", label: "Online" },
    { value: "OfflineEventAttendanceMode", label: "Offline" },
    { value: "MixedEventAttendanceMode", label: "Mixed" },
  ]

  const PERFORMER_TYPES = [
    { value: "", label: "None" },
    { value: "Person", label: "Person" },
    { value: "PerformingGroup", label: "Performing group" },
    { value: "MusicGroup", label: "Music group" },
    { value: "DanceGroup", label: "Dance group" },
    { value: "TheaterGroup", label: "Theater group" },
    { value: "Organization", label: "Organization" },
  ]

  const ORGANIZER_TYPES = [
    { value: "Organization", label: "Organization" },
    { value: "Person", label: "Person" },
  ]

  // Timezone dropdown state (for Event timezone selector)
  const [timezoneOpen, setTimezoneOpen] = useState<boolean>(false)
  const [timezoneSearch, setTimezoneSearch] = useState<string>("")

  const TICKET_AVAILABILITY_OPTIONS = [
    { value: "InStock", label: "In stock" },
    { value: "OutOfStock", label: "Out of stock" },
    { value: "OnlineOnly", label: "Online only" },
    { value: "InStoreOnly", label: "In store only" },
    { value: "PreOrder", label: "Pre-order" },
    { value: "PreSale", label: "Pre-sale" },
    { value: "LimitedAvailability", label: "Limited availability" },
    { value: "SoldOut", label: "Sold out" },
    { value: "Discontinued", label: "Discontinued" },
  ]

  const ITEM_CONDITION_OPTIONS = [
    { value: "NewCondition", label: "New" },
    { value: "UsedCondition", label: "Used" },
    { value: "RefurbishedCondition", label: "Refurbished" },
    { value: "DamagedCondition", label: "Damaged" },
  ]

  // Common currencies (small static list). Replace or extend if you installed a package.
  const COMMON_CURRENCIES = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "KES", name: "Kenyan Shilling" },
    { code: "UGX", name: "Ugandan Shilling" },
    { code: "TZS", name: "Tanzanian Shilling" },
  ]

  // Build a complete currency list from available packages, preferring `currency-list`, then `currency-codes`, then fallback
  const ALL_CURRENCIES: { code: string; name: string }[] = (() => {
    const safeName = (val: any) => {
      if (val == null) return ""
      if (typeof val === "string") return val
      if (typeof val === "object") return String(val.currency || val.name || val.code || JSON.stringify(val))
      return String(val)
    }

    try {
      // Use currency-codes (codes() returns an array of currency codes)
      if (currencyCodes && typeof currencyCodes.codes === "function") {
        const codes = currencyCodes.codes()
        if (Array.isArray(codes) && codes.length) {
          return codes
            .map((c: any) => {
              const code = typeof c === "string" ? c : (c && c.code) || String(c)
              // Try to get a friendly name via currencyCodes.code(code)
              try {
                const info: any = currencyCodes.code(String(code))
                const name = info && (info.currency || info.code) ? safeName(info.currency || info.code) : String(code)
                return { code: String(code), name }
              } catch {
                return { code: String(code), name: String(code) }
              }
            })
            .filter((c: any) => c && c.code)
            .sort((a: any, b: any) => a.code.localeCompare(b.code))
        }
      }
    } catch (e) {
      // ignore and fall back
    }

    return COMMON_CURRENCIES
  })()

  // Countries list (requires `country-list` package)
  // Countries list using `i18n-iso-countries` (English locale)
  // Build list of { name, code } and prefer storing ISO codes as the field value.
  countries.registerLocale(enLocale)
  const COUNTRY_LIST: { name: string; code?: string }[] = Object.entries((countries.getNames('en', { select: 'official' }) || {}) as Record<string, string>)
    .map(([code, name]) => ({ name: String(name), code }))
    .filter((c) => c && c.name)
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  // Contact options (use schema.org enumeration values as `value`, labels for UI)
  const CONTACT_OPTIONS: { value: string; label: string }[] = [
    { value: "TollFree", label: "Toll-free" },
    { value: "HearingImpairedSupported", label: "Hearing impaired" },
  ]

  // Full language list (ISO 639-1) generated from `iso-639-1` package
  const LANG_LIST: { code: string; name: string }[] = useMemo(() =>
    ISO6391.getAllCodes()
      .map((code) => ({ code, name: ISO6391.getName(code) || code }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [])

  // Knows language multi-select UI state (syncs with fields.knowsLanguage)
  const [knowsLangOpen, setKnowsLangOpen] = useState<boolean>(false)
  const [knowsLangSearch, setKnowsLangSearch] = useState<string>("")
  const [knowsLangSelected, setKnowsLangSelected] = useState<string[]>([])

  useEffect(() => {
    const arr = (fields.knowsLanguage || "")
      .toString()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setKnowsLangSelected(arr)
  }, [fields.knowsLanguage])

  // (Intl.DisplayNames handled via `displayNames` below)

  // Localized display names helper for languages
  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "language" })
    } catch {
      return null
    }
  }, [])
  const STATES_BY_COUNTRY: Record<string, string[]> = (() => {
    try {
      const data = (countryRegionData as any).default || countryRegionData
      const needed = ['US', 'CA', 'GB', 'AU']
      const map: Record<string, string[]> = {}
      needed.forEach((code) => {
        const entry = data.find((c: any) => c.countryShortCode === code || c.countryName === code)
        if (entry && entry.regions && entry.regions.length) {
          map[code] = entry.regions.map((r: any) => r.name)
        }
      })

      // Ensure US includes DC and territories if not present in the package data
      const usExtras = ['District of Columbia','Puerto Rico','Guam','American Samoa','Northern Mariana Islands','United States Virgin Islands']
      if (!map['US'] || map['US'].length === 0) {
        map['US'] = [
          'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
          ...usExtras
        ]
      } else {
        usExtras.forEach((e) => { if (!map['US'].includes(e)) map['US'].push(e) })
      }

      // Fallbacks for other countries if missing
      if (!map['CA']) map['CA'] = ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan']
      if (!map['GB']) map['GB'] = ['England','Scotland','Wales','Northern Ireland']
      if (!map['AU']) map['AU'] = ['New South Wales','Queensland','South Australia','Tasmania','Victoria','Western Australia','Australian Capital Territory','Northern Territory']

      return map
    } catch (err) {
      // If anything fails, return the previous hardcoded map
      return {
        US: [
          'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
          'District of Columbia','Puerto Rico','Guam','American Samoa','Northern Mariana Islands','United States Virgin Islands'
        ],
        CA: ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'],
        GB: ['England','Scotland','Wales','Northern Ireland'],
        AU: ['New South Wales','Queensland','South Australia','Tasmania','Victoria','Western Australia','Australian Capital Territory','Northern Territory']
      }
    }
  })()

  // Region select helper state: when user chooses 'Other', show a custom input
  const [regionCustomVisible, setRegionCustomVisible] = useState<boolean>(false)

  // Dynamically load optional State component from `react-country-state-fields` if available.
  const [StateSelectComp, setStateSelectComp] = useState<ComponentType<StateProps> | null>(null)

  useEffect(() => {
    // Use local fallback State select component (avoids dependency on react-country-state-fields)
    setStateSelectComp(() => StateSelectFallback)
  }, [])

  // Helper: derive a 2-letter ISO country code from the stored `fields.country` value.
  const getSelectedCountryCode = (countryVal?: string) => {
    if (!countryVal) return undefined
    // If user or selector already provided a 2-letter uppercase code, use it directly
    if (/^[A-Z]{2}$/.test(countryVal)) return countryVal
    // Otherwise try to map a country name to ISO alpha-2 code using i18n-iso-countries
    try {
      const code = countries.getAlpha2Code(countryVal, 'en')
      return code || undefined
    } catch {
      return undefined
    }
  }

  const selectedCountryCode = getSelectedCountryCode(fields.country)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Shared FAQ items for Schema Builder
  const FAQ_ITEMS = [
    {
      q: "What is JSON-LD schema markup?",
      a: "JSON-LD schema markup is structured data added to your website’s code to help search engines understand your content. It enables enhanced search results like rich snippets, business details, and FAQs.",
    },
    {
      q: "Does schema markup improve SEO rankings?",
      a: "Schema markup does not directly boost rankings, but it improves how your content is interpreted. This can increase visibility in search results and improve click-through rates.",
    },
    {
      q: "Which schema type should I choose?",
      a: "Choose based on your page:\n\nOrganization / LocalBusiness → company websites\nArticle / BlogPosting → blog content\nFAQPage → FAQs\nProduct → eCommerce\n\nUsing the right type improves your chances of rich results.",
    },
    {
      q: "Where should I add the JSON-LD code?",
      a: "Add the generated JSON-LD to your website’s <head> section or before the closing <body> tag. Most CMS platforms support this via plugins or custom code blocks.",
    },
    {
      q: "How do I test my schema markup?",
      a: "Use tools like Google’s Rich Results Test or the Schema Markup Validator to check for errors and confirm eligibility for rich results.",
    },
    {
      q: "Do I need to fill in every field?",
      a: "No. Only include fields that are accurate and relevant. High-quality, correct data is more important than completing every field.",
    },
  ]

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  }

  const isUrlKey = (k: string) => {
    if (!k) return false
    const lk = k.toLowerCase()
    return /url/.test(lk) || /logo/.test(lk) || /^images_\d+$/.test(k) || k === "images"
  }

  const renderError = (key?: string): JSX.Element | null => {
    if (!key) return null
    const msg = errors[key]
    if (!msg) return null
    if (isUrlKey(key)) {
      return <div className="validation-message">{msg}</div>
    }
    return <div className="validation-message">{msg}</div>
  }

  const isValidUrl = (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const getFieldLabel = (key: string) => {
    const allFields = schemaFields[type] || []
    return allFields.find((field) => field.key === key)?.label || key
  }

  const getFieldValue = (key: string) => {
    if (key === "faqItems") return faqItemsState.some((item) => item.question.trim() && item.answer.trim()) ? "filled" : ""
    if (key === "itemList") return breadcrumbs.some((item) => item.name.trim() && item.url.trim()) ? "filled" : ""
    if (key === "steps") return howToSteps.some((step) => step.instruction.trim()) || fields.steps?.trim() ? "filled" : ""
    if (key === "images") return images.some((image) => image.trim()) || fields.images?.trim() ? "filled" : ""
    return fields[key] || ""
  }

  const richResultPreview = useMemo(() => {
    const config = RICH_RESULT_ELIGIBILITY[type]
    const recommended = config?.recommended || []
    const complete = recommended.filter((key) => String(getFieldValue(key)).trim())
    return {
      text: config?.eligible || "This schema helps search engines understand the entity on the page. Rich result eligibility depends on Google's supported features and field completeness.",
      completeCount: complete.length,
      totalCount: recommended.length,
      missing: recommended.filter((key) => !String(getFieldValue(key)).trim()),
    }
  }, [breadcrumbs, faqItemsState, fields, howToSteps, images, type])

  const updateBreadcrumb = (index: number, key: "name" | "url", value: string) => {
    setBreadcrumbs((prev) => {
      const next = prev.slice()
      next[index] = { ...next[index], [key]: value }
      return next
    })
    // validate URL when updating url field
    if (key === "url") {
      const errKey = `breadcrumb_url_${index}`
      setErrors((prev) => {
        const next = { ...prev }
        if (!value || value.trim() === "") {
          // empty -> remove error
          delete next[errKey]
        } else if (!isValidUrl(value.trim())) {
          next[errKey] = "Invalid URL format"
        } else {
          delete next[errKey]
        }
        return next
      })
    }
  }

  const addBreadcrumb = () => setBreadcrumbs((prev) => [...prev, { name: "", url: "" }])

  const removeBreadcrumb = (index: number) =>
    setBreadcrumbs((prev) => prev.filter((_, i) => i !== index))

  const updateFaqItem = (index: number, key: "question" | "answer", value: string) => {
    setFaqItemsState((prev) => {
      const next = prev.slice()
      next[index] = { ...next[index], [key]: value }
      return next
    })
    // validate question/answer presence
    const errKey = `faq_${key}_${index}`
    const trimmed = value ? value.trim() : ""
    setErrors((prev) => {
      const next = { ...prev }
      if (!trimmed) {
        next[errKey] = key === "question" ? "Question cannot be empty" : "Answer cannot be empty"
      } else {
        delete next[errKey]
      }
      return next
    })
  }

  const addFaqItem = () => setFaqItemsState((prev) => [...prev, { question: "", answer: "" }])

  const removeFaqItem = (index: number) => {
    setFaqItemsState((prev) => prev.filter((_, i) => i !== index))
    // clear faq-related errors (re-validation will occur on edits)
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (k.startsWith("faq_question_") || k.startsWith("faq_answer_")) delete next[k]
      })
      return next
    })
  }

  // Social profiles handlers
  const handleSocialChange = (index: number, value: string) => {
    setSocialProfiles((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    // optional: validate social url
    validateField(`sameAs_${index}`, value, fields)
  }

  // When a social profile input is blurred, remove the last empty profile (like images/video thumbs)
  const handleSocialBlur = (index: number) => {
    const val = (socialProfiles && socialProfiles[index]) ? socialProfiles[index].trim() : ""
    // if the blurred field is empty and it's the last item, remove it
    if (!val && socialProfiles && index === socialProfiles.length - 1) {
      removeSocialProfile(index)
      return
    }
    // re-run validation on blur
    validateField(`sameAs_${index}`, val, fields)
  }

  // Opening hours handlers
  const addOpeningHour = () => {
    // Prevent adding opening hours when Open 24/7 is checked
    if ((fields.open24_7 || "") === "true") {
      // set a small validation hint
      setErrors((prev) => ({ ...prev, openingHours: "Cannot add hours while 'Open 24/7' is enabled" }))
      return
    }
    // clear any openingHours error when adding
    setErrors((prev) => {
      const next = { ...prev }
      delete next.openingHours
      return next
    })
    setOpeningHoursState((prev) => [...prev, { days: "", opens: "", closes: "" }])
  }
  const updateOpeningHour = (index: number, key: "days" | "opens" | "closes", value: string) => {
    // Validate time inputs for opens/closes (HH:MM 24-hour). Accept single-digit hours like "8:00"
    const isValidTime = (v: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test((v || "").trim())

    // Normalize time to two-digit hour format when valid (e.g. "8:00" -> "08:00")
    const normalizeTime = (v: string) => {
      const trimmed = (v || "").trim()
      const m = trimmed.match(/^([0-9]{1,2}):([0-5][0-9])$/)
      if (!m) return trimmed
      const hh = m[1].padStart(2, "0")
      const mm = m[2]
      return `${hh}:${mm}`
    }

    if (key === "opens" || key === "closes") {
      if (value && value.trim() && !isValidTime(value.trim())) {
        setErrors((prev) => ({ ...prev, [`openingHours_time_${index}_${key}`]: "Time must be in HH:MM (24-hour) format" }))
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[`openingHours_time_${index}_${key}`]
          return next
        })
      }
    }

    setOpeningHoursState((prev) => {
      const next = [...prev]
      const newVal = (key === "opens" || key === "closes") && value ? normalizeTime(value) : value
      next[index] = { ...next[index], [key]: newVal }
      return next
    })
  }
  const removeOpeningHour = (index: number) => setOpeningHoursState((prev) => prev.filter((_, i) => i !== index))

  // Departments handlers
  const addDepartment = () => setDepartments((prev) => [...prev, { localBusinessType: "LocalBusiness", moreSpecificType: "", name: "", image: "", telephone: "", days: "", opens: "", closes: "", street: "", city: "", region: "", postalCode: "", country: "", priceRange: "", sameAsMain: "false" }])
  const updateDepartment = (index: number, key: string, value: string) => {
    try { console.debug("updateDepartment", { index, key, value }) } catch {}
    setDepartments((prev) => {
      const next = [...prev]
      const item = { ...next[index], [key]: value }

      // When LocalBusiness @type changes, keep moreSpecificType EMPTY unless user explicitly picks one.
      // Only clear invalid values; do NOT auto-select first subtype (so placeholder can show).
      if (key === "localBusinessType") {
        const parent = value || ""
        const opts = parent && SUBTYPE_MAP[parent] ? SUBTYPE_MAP[parent] : []
        if (opts && opts.length) {
          if (!item.moreSpecificType || !opts.some((o) => o.value === item.moreSpecificType)) {
            item.moreSpecificType = "" // allow placeholder "Select Option" to appear
          }
        } else {
          item.moreSpecificType = "" // no subtypes for this parent
        }
      }

      // If toggling sameAsMain, populate or clear the department structured address from main business fields
      if (key === "sameAsMain") {
        if (value === "true") {
          item.street = fields.street?.trim() || ""
          item.city = fields.city?.trim() || ""
          item.region = fields.region?.trim() || ""
          item.postalCode = fields.postalCode?.trim() || ""
          item.country = fields.country?.trim() || ""
        } else {
          // switching off — clear the dept address so user can enter custom parts
          item.street = ""
          item.city = ""
          item.region = ""
          item.postalCode = ""
          item.country = ""
        }
      }

      next[index] = item
      return next
    })
  }
  const removeDepartment = (index: number) => setDepartments((prev) => prev.filter((_, i) => i !== index))

  // Contacts handlers (Organization)
  const addContact = () => setContacts((prev) => [...prev, { ...EMPTY_CONTACT }])
  const updateContact = (index: number, key: string, value: string) => {
    setContacts((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }
  const removeContact = (index: number) =>
    setContacts((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.length ? next : [{ ...EMPTY_CONTACT }]
    })

  const addSocialProfile = () => setSocialProfiles((prev) => [...prev, ""])

  const removeSocialProfile = (index: number) => {
    setSocialProfiles((prev) => prev.filter((_, i) => i !== index))
    // clear related errors
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (k.startsWith("sameAs_") ) delete next[k]
      })
      return next
    })
  }

  // Education repeater handlers
  const addEducation = () => setEducation((prev) => [...prev, { name: "", url: "" }])

  const handleEducationFieldChange = (index: number, key: keyof (typeof education)[0], value: string) => {
    setEducation((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const removeEducation = (index: number) => setEducation((prev) => prev.filter((_, i) => i !== index))

  // Reviews handlers (structured review objects)
  const addReview = () => setReviews((prev) => [...prev, { name: "", body: "", rating: "", date: "" }])

  const handleReviewFieldChange = (index: number, key: keyof (typeof reviews)[0], value: string) => {
    setReviews((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })

    // Inline validation for review fields
    const trimmed = value ? value.trim() : ""
    const errKey = `review_${index}_${key}`
    setErrors((prev) => {
      const next = { ...prev }
      if (!trimmed) {
        delete next[errKey]
        return next
      }
      if (key === 'rating') {
        if (isNaN(Number(trimmed))) next[errKey] = 'Rating must be a number'
        else delete next[errKey]
        return next
      }
      if (key === 'date') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) next[errKey] = 'Date must be yyyy-mm-dd'
        else delete next[errKey]
        return next
      }
      // For other keys, remove errors (no special validation)
      delete next[errKey]
      return next
    })
  }

  const handleReviewFieldBlur = (index: number, key: keyof (typeof reviews)[0]) => {
    // Clean review body on blur: strip HTML, collapse whitespace, trim, enforce length limit
    if (key === 'body') {
      const raw = String(reviews[index]?.body || "")
      // Remove HTML tags
      let cleaned = raw.replace(/<[^>]*>/g, "")
      // Collapse multiple whitespace/newlines into single space, then trim
      cleaned = cleaned.replace(/\s+/g, " ").trim()
      // Limit to 2000 chars to avoid huge payloads
      if (cleaned.length > 2000) cleaned = cleaned.slice(0, 2000)
      if (cleaned !== raw) {
        setReviews((prev) => {
          const next = [...prev]
          next[index] = { ...next[index], body: cleaned }
          return next
        })
      }
    }

    // If last and empty, remove
    const isLastEmpty = Object.values(reviews[index] || {}).every((v) => !(String(v || "").trim()))
    if (isLastEmpty && index === reviews.length - 1) {
      removeReview(index)
      return
    }
    // trigger validation already handled in change
  }

  const removeReview = (index: number) => {
    setReviews((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (k.startsWith("review_")) delete next[k]
      })
      return next
    })
  }

  // Migrate existing contacts[].availableLanguage values from names -> ISO 639-1 codes when possible
  useEffect(() => {
    setContacts((prev) => {
      let changed = false
      const next = prev.map((c) => {
        if (!c.availableLanguage || !c.availableLanguage.trim()) return c
        const parts = c.availableLanguage.split(",").map((s) => s.trim()).filter(Boolean)
        const mapped = parts.map((p) => {
          // already a 2-letter code
          if (/^[A-Za-z]{2}$/.test(p)) return p.toLowerCase()
          // try iso-639-1 mapping by name
          try {
            const code = ISO6391.getCode(p)
            if (code) return code
          } catch {
            // ignore
          }
          // case-insensitive exact match to display name
          const found = ISO6391.getAllCodes().find((code) => (ISO6391.getName(code) || "").toLowerCase() === p.toLowerCase())
          if (found) return found
          // leave as-is (fallback)
          return p
        })
        const nextVal = mapped.join(",")
        if (nextVal !== c.availableLanguage) {
          changed = true
          return { ...c, availableLanguage: nextVal }
        }
        return c
      })
      return changed ? next : prev
    })
  }, [])

  const validateField = (key: string, value: any, allFields: Record<string, any>) => {
    const nextErrors = { ...errors }

    const setError = (k: string, msg?: string) => {
      if (msg) nextErrors[k] = msg
      else delete nextErrors[k]
    }

    const isArray = Array.isArray(value)
    const trimmed = !isArray && value ? String(value).trim() : ""

    if (isArray) {
      // Special-case: arrays are used for repeater fields (e.g. hiringOrganizationSameAs)
      const lk = key.toLowerCase()
      if (lk.includes("sameas")) {
        const arr = (value as any[]).map((s) => (s ? String(s).trim() : "")).filter(Boolean)
        if (arr.length === 0) {
          setError(key)
          setErrors(nextErrors)
          return
        }
        // Validate each URL is well-formed; if any invalid, set a field-level error
        const invalid = arr.some((u) => !isValidUrl(u))
        if (invalid) setError(key, "One or more profile URLs are invalid")
        else setError(key)
        setErrors(nextErrors)
        return
      }

      // For other arrays, treat empty as optional
      if ((value as any[]).length === 0) {
        setError(key)
        setErrors(nextErrors)
        return
      }
      // Fall through: convert non-empty array to a joined string for any remaining checks
    }

    if (!trimmed) {
      // Optional fields: remove existing error
      setError(key)
      setErrors(nextErrors)
      return
    }

    // Per-image validation (images_0, images_1, etc.)
    if (/^images_\d+$/.test(key)) {
      if (!isValidUrl(trimmed)) setError(key, "Invalid URL format")
      else setError(key)
      setErrors(nextErrors)
      return
    }

    // Per-video-thumbnail validation (videoThumbs_0, videoThumbs_1, etc.)
    if (/^videoThumbs_\d+$/.test(key)) {
      if (!isValidUrl(trimmed)) setError(key, "Invalid URL format")
      else setError(key)
      setErrors(nextErrors)
      return
    }

    const lk = key.toLowerCase()

    // Phone/Telephone validation: no letters allowed
    if (lk.includes("phone") || lk.includes("telephone")) {
      const hasLetters = /[a-zA-Z]/.test(trimmed)
      if (hasLetters) {
        nextErrors[key] = "Phone numbers cannot contain letters"
      } else {
        delete nextErrors[key]
      }
      setErrors(nextErrors)
      return
    }

    // Email validation for any field name containing 'email'
    if (lk.includes("email")) {
      // Simple but practical email regex
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      if (!emailOk) nextErrors[key] = "Invalid email address"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Special validation for searchbox URL templates: must include the placeholder
    if (key === "urlTemplate") {
      const ok = /^(https?:\/\/)/.test(trimmed) && trimmed.includes("{search_term_string}")
      if (!ok) nextErrors[key] = "URL template must be a valid URL and include {search_term_string}"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Special validation for SeekToAction target templates: must include the placeholder
    if (key === "seekToTarget") {
      const ok = /^(https?:\/\/)/.test(trimmed) && trimmed.includes("{seek_to_second_number}")
      if (!ok) nextErrors[key] = "SeekTo URL must be a valid URL and include {seek_to_second_number}"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Job-related date fields validation
    if (key === "datePosted" || key === "validThrough") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) nextErrors[key] = "Date must be in yyyy-mm-dd format"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Time fields validation (HH:MM 24-hour)
    if (key === "startTime" || key === "endTime") {
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(trimmed)) nextErrors[key] = "Time must be in HH:MM (24-hour) format"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Organization founding date
    if (key === "foundingDate") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) nextErrors[key] = "Date must be in yyyy-mm-dd format"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // Salary numeric enforcement for min/max salary fields
    if (key === "minSalary" || key === "maxSalary") {
      if (trimmed && isNaN(Number(trimmed))) nextErrors[key] = "Salary must be a number"
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    // employmentType and salaryUnit should be one of allowed options when present
    if (key === "employmentType") {
      const allowed = EMPLOYMENT_TYPES
      if (trimmed && !allowed.includes(trimmed)) nextErrors[key] = `Employment type must be one of: ${allowed.join(", ")}`
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    if (key === "salaryUnit") {
      const allowed = SALARY_UNITS
      if (trimmed && !allowed.includes(trimmed)) nextErrors[key] = `Per must be one of: ${allowed.join(", ")}`
      else delete nextErrors[key]
      setErrors(nextErrors)
      return
    }

    if (
      lk.includes("url") ||
      lk.includes("logo") ||
      lk.includes("image") ||
      // treat repeater keys like sameAs_0, sameAs_1 as URL entries
      key.toLowerCase().startsWith("sameas_")
    ) {
      if (!isValidUrl(trimmed)) setError(key, "Invalid URL format")
      else setError(key)
      setErrors(nextErrors)
      return
    }

    switch (key) {
      case "images": {
        const parts = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        const invalid = parts.find((p) => !isValidUrl(p))
        if (invalid) setError(key, "Invalid URL format")
        else setError(key)
        break
      }

      case "datePublished":
      case "dateModified": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) setError(key, "Date must be in yyyy-mm-dd format")
        else setError(key)
        break
      }

      case "price":
      case "lowPrice":
      case "highPrice":
        if (trimmed && isNaN(Number(trimmed))) setError(key, "Price must be a number")
        else setError(key)
        break

      case "offerCount": {
        if (trimmed && (!/^[0-9]+$/.test(trimmed) || isNaN(Number(trimmed)))) setError(key, "Number of offers must be a non-negative integer")
        else setError(key)
        break
      }

      case "ratingValue":
      case "bestRating":
      case "worstRating":
        if (trimmed && isNaN(Number(trimmed))) setError(key, "Rating must be a number")
        else setError(key)
        break

      case "ratingCount":
        if (trimmed && (!/^[0-9]+$/.test(trimmed) || isNaN(Number(trimmed)))) setError(key, "Number of ratings must be a non-negative integer")
        else setError(key)
        break

      case "headline": {
        if (allFields.strictHeadlineLimit === "true" && trimmed.length > 110) {
          setError(key, "Headline exceeds 110 characters")
        } else setError(key)
        break
      }

      case "totalTime": {
        // Accept plain minutes (e.g. "40") or basic ISO 8601 minute duration (e.g. "PT40M")
        if (/^\d+$/.test(trimmed) || /^PT\d+M$/.test(trimmed)) setError(key)
        else setError(key, "Enter minutes (e.g. 40) or ISO duration (e.g. PT40M)")
        break
      }

      default:
        setError(key)
    }

    setErrors(nextErrors)
  }

  // Validate socialProfiles entries whenever they change
  useEffect(() => {
    socialProfiles.forEach((s, i) => validateField(`sameAs_${i}`, s, fields))
  }, [socialProfiles, fields])

  // Validate videoThumbnails entries whenever they change
  useEffect(() => {
    videoThumbnails.forEach((t, i) => validateField(`videoThumbs_${i}`, t, fields))
  }, [videoThumbnails, fields])

  // Validate HowTo steps' image and URL fields whenever they change
  useEffect(() => {
    howToSteps.forEach((s, i) => {
      validateField(`howto_step_url_${i}`, s.url || "", fields)
      validateField(`howto_step_image_${i}`, s.image || "", fields)
    })
  }, [howToSteps, fields])

  // Validate top-level HowTo image/url fields when editing How-to
  useEffect(() => {
    if (type !== "How-to") return
    validateField("image", fields.image || "", fields)
    validateField("url", fields.url || "", fields)
  }, [type, fields.image, fields.url, fields])

  // Validate department images and opening hours
  useEffect(() => {
    departments.forEach((dept, i) => {
      if (dept.image) validateField(`dept_image_${i}`, dept.image, fields)
      if (dept.opens) {
        if (!/^\d{1,2}:[0-5]\d$/.test(dept.opens.trim())) {
          setErrors((prev) => ({ ...prev, [`dept_opens_${i}`]: "Time must be in HH:MM format (e.g. 08:00)" }))
        } else {
          setErrors((prev) => {
            const next = { ...prev }
            delete next[`dept_opens_${i}`]
            return next
          })
        }
      }
      if (dept.closes) {
        if (!/^\d{1,2}:[0-5]\d$/.test(dept.closes.trim())) {
          setErrors((prev) => ({ ...prev, [`dept_closes_${i}`]: "Time must be in HH:MM format (e.g. 21:00)" }))
        } else {
          setErrors((prev) => {
            const next = { ...prev }
            delete next[`dept_closes_${i}`]
            return next
          })
        }
      }
    })
  }, [departments, fields])

  // Validate contacts repeater: require phone and basic checks
  useEffect(() => {
    contacts.forEach((c, i) => {
      setErrors((prev) => {
        const next = { ...prev }
        const key = `contact_phone_${i}`
        if (!c.phone || !c.phone.trim()) next[key] = "Phone is required for each contact"
        else delete next[key]
        return next
      })
      // validate areaServed/options formatting could be added later
    })
  }, [contacts])

  // Image handlers
  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    validateField(`images_${index}`, value, fields)
  }

  const addImage = () => setImages((prev) => [...prev, ""])

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Keywords are provided as a comma-separated string in `fields.keywords`.

  // Generic field handler
  const handleChange = (key: string, value: any) => {
    setFields((prev) => {
      let val = value

      // Strip letters from phone/telephone fields (only operate on strings)
      if ((key.toLowerCase().includes("phone") || key.toLowerCase().includes("telephone")) && typeof value === 'string') {
        val = value.replace(/[a-zA-Z]/g, "")
      }

      // Enforce strict headline limit while typing if enabled (only for strings)
      if (key === "headline" && prev.strictHeadlineLimit === "true" && typeof value === 'string') {
        val = value.slice(0, 110)
      }

      // If user changes the top-level LocalBusiness @type, mirror localbusiness.js behavior:
      // - if there are subtypes in SUBTYPE_MAP for the selected parent, set `moreSpecificType` to the first available option when the current value isn't valid
      // - otherwise clear `moreSpecificType`
      if (key === "localBusinessType") {
        const parent = val || ""
        const opts = parent && SUBTYPE_MAP[parent] ? SUBTYPE_MAP[parent] : []
        let nextMore = prev.moreSpecificType || ""
        if (opts && opts.length) {
          const ok = nextMore && opts.some((o) => o.value === nextMore)
          if (!ok) nextMore = opts[0].value
        } else {
          nextMore = ""
        }

        const next = { ...prev, [key]: val, moreSpecificType: nextMore }
        validateField(key, val, next)
        validateField("moreSpecificType", nextMore, next)
        return next
      }

      // When user changes venue country, clear venueRegion if we don't have states for it
      if (key === "venueCountry") {
        const countryVal = (val || "").toUpperCase()
        // If we don't have a states list for the selected country, clear venueRegion
        if (!countryVal || !STATES_BY_COUNTRY[countryVal]) {
          const next = { ...prev, [key]: val, venueRegion: "" }
          validateField(key, val, next)
          validateField("venueRegion", "", next)
          return next
        }
      }

      // When user changes the top-level country, clear region if we don't have states for it
      if (key === "country") {
        const countryVal = (val || "").toUpperCase()
        if (!countryVal || !STATES_BY_COUNTRY[countryVal]) {
          const next = { ...prev, [key]: val, region: "" }
          validateField(key, val, next)
          validateField("region", "", next)
          return next
        }
      }

      // If user attempts to set venueRegion but country is not US, ignore the value (clear it)
      if (key === "venueRegion") {
        const selected = prev.venueCountry || ""
        if ((selected || "").toUpperCase() !== "US") {
          const next = { ...prev, venueRegion: "" }
          validateField("venueRegion", "", next)
          return next
        }
      }

      // If user changes the top-level Organization @type, mirror Organization behavior:
      // - if there are subtypes in ORG_SUBTYPE_MAP for the selected parent, set `moreSpecificType` to the first available option when the current value isn't valid
      // - otherwise clear `moreSpecificType`
      if (key === "organizationType") {
        const parent = val || ""
        const opts = parent && ORG_SUBTYPE_MAP[parent] ? ORG_SUBTYPE_MAP[parent] : []
        let nextMore = prev.moreSpecificType || ""
        if (opts && opts.length) {
          const ok = nextMore && opts.some((o) => o.value === nextMore)
          if (!ok) nextMore = opts[0].value
        } else {
          nextMore = ""
        }

        const next = { ...prev, [key]: val, moreSpecificType: nextMore }
        validateField(key, val, next)
        validateField("moreSpecificType", nextMore, next)
        return next
      }

      const next = { ...prev, [key]: val }
      validateField(key, val, next)
      return next
    })
  }

  // Build JSON-LD schema (local copy kept for reference; actual usage via buildSchemaFromState)
  
  const schemaJSON = useMemo(
    () => JSON.stringify(buildSchemaFromState(({
      type,
      fields,
      images,
      breadcrumbs,
      faqItemsState,
      socialProfiles,
      education,
      videoThumbnails,
      videoMinutes,
      videoSeconds,
      openingHoursState,
      departments,
      contacts,
      ticketTypes,
      ticketDefaultCurrency,
      // No automatic page URL provided — mainEntityOfPage will only be added when user enters a URL
      reviews,
      orgExtras,
      // How-to specific arrays
      howToTools,
      howToSupplies,
      howToSteps,
    } as any)), null, 2),
    [fields, type, images, breadcrumbs, faqItemsState, socialProfiles, education, videoThumbnails, videoMinutes, videoSeconds, openingHoursState, departments, contacts, ticketTypes, ticketDefaultCurrency, reviews, orgExtras, howToTools, howToSupplies, howToSteps]
  )

  // Wrapped script tag version for preview/copy/download
  const schemaScript = useMemo(() => {
    return "<script type=\"application/ld+json\">\n" + schemaJSON + "\n</script>"
  }, [schemaJSON])

  const handleCopy = async () => {
    await copyToClipboard(schemaScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const handleDownload = () => {
    const fileBase = type === "Article" ? fields.articleType || "Article" : type
    const filename = `${fileBase} schema.json`
    downloadText(filename, schemaScript)
    setDownloadMsgVisible(true)
    setTimeout(() => setDownloadMsgVisible(false), 1400)
  }

  const handleTest = async () => {
    try {
      await copyToClipboard(schemaScript)
      setTestMsgVisible(true)
      window.open("https://search.google.com/test/rich-results", "_blank", "noopener,noreferrer")
      setTimeout(() => setTestMsgVisible(false), 1400)
    } catch {
      window.open("https://search.google.com/test/rich-results", "_blank", "noopener,noreferrer")
    }
  }

  const handleValidate = async () => {
    try {
      await copyToClipboard(schemaScript)
      setValidateMsgVisible(true)
      window.open("https://validator.schema.org/", "_blank", "noopener,noreferrer")
      setTimeout(() => setValidateMsgVisible(false), 1400)
    } catch {
      window.open("https://validator.schema.org/", "_blank", "noopener,noreferrer")
    }
  }

  const handleReset = () => {
    setFields(type === "Article" ? { articleType: "Article" } : {})
    setImages(type === "Article" ? [""] : [])
    setOrgExtras(getInitialOrgExtras(type))
    setErrors({})
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  

  const articleTitle = "Article Schema"
  const builderSeoMeta: Record<string, { title: string; description: string }> = {
    Article: {
      title: "Free Article Schema Generator (JSON-LD)",
      description: "Generate Article, BlogPosting, and NewsArticle JSON-LD with headlines, authors, and publisher data to improve SEO and search visibility.",
    },
    Breadcrumb: {
      title: "Free Breadcrumb Schema Generator (JSON-LD)",
      description: "Create BreadcrumbList JSON-LD to define your site structure and improve breadcrumb snippets in Google search results for better navigation.",
    },
    "FAQ Page": {
      title: "Free FAQ Schema Generator (JSON-LD)",
      description: "Build FAQPage JSON-LD with structured question and answer pairs to increase eligibility for Google rich results and improve click-through rates.",
    },
    "How-to": {
      title: "Free How-To Schema Generator (JSON-LD)",
      description: "Generate HowTo JSON-LD for step-by-step guides, including tools, instructions, and structured data to enhance visibility in search results.",
    },
    "Local Business": {
      title: "Free Local Business Schema Generator",
      description: "Create LocalBusiness JSON-LD with address, opening hours, and contact details to strengthen local SEO and improve visibility in Google search.",
    },
    Organization: {
      title: "Free Organization Schema Generator (JSON-LD)",
      description: "Generate Organization JSON-LD with brand details, social profiles, contact points, and entity signals to improve recognition in search results.",
    },
    Product: {
      title: "Free Product Schema Generator (JSON-LD)",
      description: "Build Product JSON-LD with pricing, availability, ratings, and reviews to enhance eCommerce listings and qualify for rich results in search.",
    },
    Video: {
      title: "Free Video Schema Generator (JSON-LD)",
      description: "Create VideoObject JSON-LD with thumbnails, duration, upload date, and metadata to improve video indexing and visibility in search results.",
    },
    "Website Sitelinks Searchbox": {
      title: "Free Sitelinks Searchbox Schema Generator",
      description: "Generate WebSite JSON-LD with SearchAction to enable a sitelinks search box for branded queries and improve navigation in search results.",
    },
    Person: {
      title: "Free Person Schema Generator (JSON-LD)",
      description: "Create Person JSON-LD with name, role, bio, and social profiles to strengthen identity signals and improve entity recognition in search.",
    },
    "Job Posting": {
      title: "Free Job Posting Schema Generator",
      description: "Build JobPosting JSON-LD with title, salary, location, and hiring details to qualify for Google job search features and improve visibility.",
    },
    Event: {
      title: "Free Event Schema Generator (JSON-LD)",
      description: "Create Event JSON-LD with dates, venue, ticketing, and organizer details to improve visibility and eligibility for event rich results.",
    },
  }
  const seoMeta = builderSeoMeta[type] || {
    title: `${type} Schema Builder (JSON-LD)`,
    description: `Generate clean JSON-LD for ${type}.`,
  }

  // Derived flags used by several product/offer controls
  const offerDisabled = !((fields.offerType || "").trim())
  const isAggregateOffer = ((fields.offerType || "").trim() === "AggregateOffer")

  return (
    <>
      <Seo
        title={seoMeta.title}
        description={seoMeta.description}
        keywords="schema generator, json-ld generator, seo tools"
        url="https://cralite.com/tools/schema-builder/"
        disableBreadcrumb={true}
      />
      {/* Inject FAQ JSON-LD so the page provides structured FAQ data */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      {/* Rotate only the plus icon when opened */}
      <style>{`details[open] summary .faq-plus { transform: rotate(45deg); }`}</style>
      <section className="section section--neutral">
        <div className="section-inner">
        <section className="tool-section">
          <div className="mb-0">
            <div className="tool-grid items-center">
              {/* LEFT – Dropdown + title */}
              <div>
                <h3 className="text-[1.5rem] font-semibold mb-2">
                  Which Schema.org markup would you like to generate?
                </h3>

                <div className="custom-select-wrapper relative" style={{ width: "100%" }}>
                  <button
                    type="button"
                    className="custom-select-trigger tool-select"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen((o) => !o)}
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <span className="truncate block">{type}</span>
                    <span className="text-xs">⏷</span>
                  </button>

                  {/* Language display locale toggle removed per request */}

                  {dropdownOpen && (
                    <div
                      className="custom-select-list absolute left-0 mt-1 z-50"
                      style={{ width: "100%" }}
                    >
                      <ul>
                        {Object.keys(schemaFields).sort((a, b) => a.localeCompare(b)).map((schemaType) => (
                          <li
                            key={schemaType}
                            onClick={() => {
                              setType(schemaType)
                              setFields(schemaType === "Article" ? { articleType: "Article" } : {})
                              setImages(schemaType === "Article" ? [""] : [])
                              setOrgExtras(getInitialOrgExtras(schemaType))
                              setDropdownOpen(false)
                              setErrors({})
                            }}
                            className={schemaType === type ? "selected" : ""}
                          >
                            <div className="font-semibold text-[15px]">{schemaType}</div>
                            <div className="text-[13px] text-gray-500">
                              {schemaDescriptions[schemaType] || ""}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT – Description */}
              <div className="text-base text-gray-600 leading-relaxed">
                Use this Schema.org structured data generator to create JSON-LD markups easily.
                After generating, test your markup using the{" "}
                <a
                  href="https://search.google.com/test/rich-results"
                  className="text-blue-600 underline text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Rich Results Test
                </a>{" "}
                or the{" "}
                <a
                  href="https://validator.schema.org/"
                  className="text-blue-600 underline text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Schema Markup Validator
                </a>
                .
              </div>
            </div>
          </div>
          </section>
          <section className="tool-section">
        {/* ======= MAIN TOOL GRID ======= */}
        <div className="tool-grid">
          {/* LEFT FORM */}
          <div className="tool-form">
            <div className="tool-header-compact">
              <h2 className="tool-h2">{type === "Article" ? articleTitle : `${type} Schema Builder`}</h2>
              <p className="tool-sub">
                {type === "Article" ? (
                  "Use this builder to create accurate JSON-LD for articles, blog posts, and news content."
                ) : (
                  <>{schemaExamples[type]} for {type}</>
                )}
              </p>
            </div>

            {type === "Recipe" && (
              <div className="text-sm text-gray-500 mt-0">
                Times use ISO 8601 durations (e.g. <code>PT15M</code>, <code>PT1H30M</code>).
                Ingredients: one per line or comma-separated. Instructions: one step per line.
              </div>
            )}

            {/* How-to helper text removed per request */}

            {type === "Job Posting" && (
              <div className="text-sm text-gray-500 mt-0">
                Dates use <code>yyyy-mm-dd</code>. Salary values are numeric; set <code>Per</code> to <code>YEAR</code>, <code>HOUR</code>, etc.
              </div>
            )}

            {type === "Article" ? (
              <ArticleForm
                fields={fields as ArticleFields}
                handleChange={handleChange}
                renderError={renderError}
                articleTypeOpen={articleTypeOpen}
                  toggleArticleTypeOpen={() => setArticleTypeOpen((o) => !o)}
                  authorTypeOpen={authorTypeOpen}
                  toggleAuthorTypeOpen={() => setAuthorTypeOpen((o) => !o)}
                images={images}
                addImage={addImage}
                removeImage={removeImage}
                handleImageChange={handleImageChange}
              />
            ) : type === "Breadcrumb" ? (
              <div>
                
                <div className="space-y-4">
                  {breadcrumbs.map((b, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-1">
                        <label className="tool-label">Name</label>
                        <input
                          type="text"
                          className="tool-input"
                          value={b.name}
                          placeholder={`Page #${idx + 1} Name`}
                          onChange={(e) => updateBreadcrumb(idx, "name", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="tool-label">URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="tool-input flex-1"
                            value={b.url}
                            placeholder={`https://example.com/page-${idx + 1}`}
                            onChange={(e) => updateBreadcrumb(idx, "url", e.target.value)}
                          />
                          <button
                            type="button"
                            className="toolbar-btn toolbar-btn--red square-btn"
                            onClick={() => removeBreadcrumb(idx)}
                            aria-label="Remove breadcrumb"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                        {!b.url || isValidUrl(b.url) ? null : (
                          <div className="validation-message">Invalid URL format</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div>
                    <button type="button" className="action-btn" onClick={addBreadcrumb}>
                      Add URL
                    </button>
                  </div>
                </div>
              </div>
            ) : type === "FAQ Page" ? (
              <FaqForm
                faqItems={faqItemsState}
                updateFaqItem={updateFaqItem}
                addFaqItem={addFaqItem}
                removeFaqItem={removeFaqItem}
                renderError={renderError}
              />
            ) : type === "Person" ? (
              <PersonForm
                fields={fields as Partial<PersonFields>}
                handleChange={handleChange}
                renderError={renderError}
                knowsLangOpen={knowsLangOpen}
                setKnowsLangOpen={setKnowsLangOpen}
                knowsLangSelected={knowsLangSelected}
                setKnowsLangSelected={setKnowsLangSelected}
                knowsLangSearch={knowsLangSearch}
                setKnowsLangSearch={setKnowsLangSearch}
                LANG_LIST={LANG_LIST}
                socialProfiles={socialProfiles}
                handleSocialChange={handleSocialChange}
                handleSocialBlur={handleSocialBlur}
                addSocialProfile={addSocialProfile}
                removeSocialProfile={removeSocialProfile}
                education={education}
                handleEducationFieldChange={handleEducationFieldChange}
                removeEducation={removeEducation}
                addEducation={addEducation}
                selectedCountryCode={selectedCountryCode}
                StateSelectComp={StateSelectComp}
                regionCustomVisible={regionCustomVisible}
                setRegionCustomVisible={setRegionCustomVisible}
                regionOpen={regionOpen}
                setRegionOpen={setRegionOpen}
                regionSearch={regionSearch}
                setRegionSearch={setRegionSearch}
                countryOpen={countryOpen}
                setCountryOpen={setCountryOpen}
                countrySearch={countrySearch}
                setCountrySearch={setCountrySearch}
                COUNTRY_LIST={COUNTRY_LIST}
                STATES_BY_COUNTRY={STATES_BY_COUNTRY}
              />
            ) : (
              /* How-to — custom layout (supplies, tools, steps) */
              type === "How-to" ? (
                <HowToForm
                  fields={fields as Partial<HowToFields>}
                  handleChange={handleChange}
                  renderError={renderError}
                  howToCurrencyOpen={howToCurrencyOpen}
                  setHowToCurrencyOpen={setHowToCurrencyOpen}
                  howToCurrencySearch={howToCurrencySearch}
                  setHowToCurrencySearch={setHowToCurrencySearch}
                  ALL_CURRENCIES={ALL_CURRENCIES}
                  howToSupplies={howToSupplies}
                  addHowToSupply={addHowToSupply}
                  addHowToTool={addHowToTool}
                  howToTools={howToTools}
                  updateHowToSupply={updateHowToSupply}
                  removeHowToSupply={removeHowToSupply}
                  updateHowToTool={updateHowToTool}
                  removeHowToTool={removeHowToTool}
                  howToSteps={howToSteps}
                  updateHowToStep={updateHowToStep}
                  removeHowToStep={removeHowToStep}
                  addHowToStep={addHowToStep}
                />
              ) :
              // Event — custom layout (fields match attached design)
              type === "Event" ? (
                <EventForm
                  fields={fields}
                  handleChange={handleChange}
                  renderError={renderError}
                  eventStatusOpen={eventStatusOpen}
                  setEventStatusOpen={setEventStatusOpen}
                  attendanceModeOpen={attendanceModeOpen}
                  setAttendanceModeOpen={setAttendanceModeOpen}
                  EVENT_STATUSES={EVENT_STATUSES}
                  ATTENDANCE_MODES={ATTENDANCE_MODES}
                  timezoneOpen={timezoneOpen}
                  setTimezoneOpen={setTimezoneOpen}
                  timezoneSearch={timezoneSearch}
                  setTimezoneSearch={setTimezoneSearch}
                  TIMEZONES={TIMEZONES}
                  getTimezoneOffsetMinutes={getTimezoneOffsetMinutes}
                  formatGmtOffset={formatGmtOffset}
                  venueCountryOpen={venueCountryOpen}
                  setVenueCountryOpen={setVenueCountryOpen}
                  venueCountrySearch={venueCountrySearch}
                  setVenueCountrySearch={setVenueCountrySearch}
                  COUNTRY_LIST={COUNTRY_LIST}
                  STATES_BY_COUNTRY={STATES_BY_COUNTRY}
                  organizerTypeOpen={organizerTypeOpen}
                  setOrganizerTypeOpen={setOrganizerTypeOpen}
                  ORGANIZER_TYPES={ORGANIZER_TYPES}
                  performerTypeOpen={performerTypeOpen}
                  setPerformerTypeOpen={setPerformerTypeOpen}
                  PERFORMER_TYPES={PERFORMER_TYPES}
                  ticketTypes={ticketTypes}
                  addTicketType={addTicketType}
                  updateTicketType={updateTicketType}
                  removeTicketType={removeTicketType}
                  ticketDefaultCurrency={ticketDefaultCurrency}
                  setTicketDefaultCurrency={setTicketDefaultCurrency}
                  ticketDefaultCurrencyOpen={ticketDefaultCurrencyOpen}
                  setTicketDefaultCurrencyOpen={setTicketDefaultCurrencyOpen}
                  ticketCurrencySearch={ticketCurrencySearch}
                  setTicketCurrencySearch={setTicketCurrencySearch}
                  ALL_CURRENCIES={ALL_CURRENCIES}
                  ticketAvailabilityOpenIndex={ticketAvailabilityOpenIndex}
                  setTicketAvailabilityOpenIndex={setTicketAvailabilityOpenIndex}
                  TICKET_AVAILABILITY_OPTIONS={TICKET_AVAILABILITY_OPTIONS}
                />
              ) :
              // Video — extracted to component
              type === "Video" ? (
                <VideoForm
                  fields={fields as Partial<VideoFields>}
                  handleChange={handleChange}
                  renderError={renderError}
                  videoMinutes={videoMinutes}
                  setVideoMinutes={setVideoMinutes}
                  videoSeconds={videoSeconds}
                  setVideoSeconds={setVideoSeconds}
                  videoThumbnails={videoThumbnails}
                  setVideoThumbnails={setVideoThumbnails}
                  validateField={validateField}
                  setErrors={setErrors}
                />
              ) :
              // Job Posting — extracted to component
              type === "Job Posting" ? (
                <JobPostingForm
                  fields={fields as Partial<JobPostingFields>}
                  handleChange={handleChange}
                  renderError={renderError}
                  StateSelectComp={StateSelectComp}
                  COUNTRY_LIST={COUNTRY_LIST}
                  STATES_BY_COUNTRY={STATES_BY_COUNTRY}
                    jobEmploymentTypeOpen={jobEmploymentTypeOpen}
                    toggleJobEmploymentTypeOpen={() => setJobEmploymentTypeOpen((o) => !o)}
                    jobCountryOpen={jobCountryOpen}
                    toggleJobCountryOpen={() => setJobCountryOpen((o) => !o)}
                    jobRegionOpen={jobRegionOpen}
                    toggleJobRegionOpen={() => setJobRegionOpen((o) => !o)}
                    jobSalaryCurrencyOpen={jobSalaryCurrencyOpen}
                    toggleJobSalaryCurrencyOpen={() => setJobSalaryCurrencyOpen((o) => !o)}
                    jobSalaryUnitOpen={jobSalaryUnitOpen}
                    toggleJobSalaryUnitOpen={() => setJobSalaryUnitOpen((o) => !o)}
                />
              ) :
              // Website Sitelinks Searchbox — custom layout
              type === "Website Sitelinks Searchbox" ? (
                <WebsiteForm
                  fields={fields}
                  handleChange={handleChange}
                  renderError={renderError}
                />
              ) : (
                // Non-Article types — simple mapping (Local Business has repeaters)
                type === "Local Business" ? (
                  <LocalBusinessForm
                    fields={fields}
                    handleChange={handleChange}
                    renderError={renderError}
                    schemaFields={schemaFields}
                    type={type}
                    SUBTYPE_MAP={SUBTYPE_MAP}
                    LOCAL_BUSINESS_TYPES={LOCAL_BUSINESS_TYPES}
                    localBusinessTypeOpen={localBusinessTypeOpen}
                    setLocalBusinessTypeOpen={setLocalBusinessTypeOpen}
                    moreSpecificOpen={moreSpecificOpen}
                    setMoreSpecificOpen={setMoreSpecificOpen}
                    countryOpen={countryOpen}
                    setCountryOpen={setCountryOpen}
                    countrySearch={countrySearch}
                    setCountrySearch={setCountrySearch}
                    regionOpen={regionOpen}
                    setRegionOpen={setRegionOpen}
                    regionSearch={regionSearch}
                    setRegionSearch={setRegionSearch}
                    StateSelectComp={StateSelectComp}
                    getSelectedCountryCode={getSelectedCountryCode}
                    regionCustomVisible={regionCustomVisible}
                    setRegionCustomVisible={setRegionCustomVisible}
                    STATES_BY_COUNTRY={STATES_BY_COUNTRY}
                    COUNTRY_LIST={COUNTRY_LIST}
                    openingHoursState={openingHoursState}
                    addOpeningHour={addOpeningHour}
                    updateOpeningHour={updateOpeningHour}
                    removeOpeningHour={removeOpeningHour}
                    DAYS_OF_WEEK={DAYS_OF_WEEK}
                    departments={departments}
                    addDepartment={addDepartment}
                    updateDepartment={updateDepartment}
                    removeDepartment={removeDepartment}
                    deptLocalBusinessOpenIndex={deptLocalBusinessOpenIndex}
                    setDeptLocalBusinessOpenIndex={setDeptLocalBusinessOpenIndex}
                    deptMoreSpecificOpenIndex={deptMoreSpecificOpenIndex}
                    setDeptMoreSpecificOpenIndex={setDeptMoreSpecificOpenIndex}
                    deptCountryOpenIndex={deptCountryOpenIndex}
                    setDeptCountryOpenIndex={setDeptCountryOpenIndex}
                    deptCountrySearch={deptCountrySearch}
                    setDeptCountrySearch={setDeptCountrySearch}
                    deptRegionOpenIndex={deptRegionOpenIndex}
                    setDeptRegionOpenIndex={setDeptRegionOpenIndex}
                    deptRegionSearch={deptRegionSearch}
                    setDeptRegionSearch={setDeptRegionSearch}
                    deptRegionCustomVisibleIndex={deptRegionCustomVisibleIndex}
                    setDeptRegionCustomVisibleIndex={setDeptRegionCustomVisibleIndex}
                    deptOpeningDaysOpenIndex={deptOpeningDaysOpenIndex}
                    setDeptOpeningDaysOpenIndex={setDeptOpeningDaysOpenIndex}
                    openingDaysOpenIndex={openingDaysOpenIndex}
                    setOpeningDaysOpenIndex={setOpeningDaysOpenIndex}
                    socialProfiles={socialProfiles}
                    handleSocialChange={handleSocialChange}
                    handleSocialBlur={handleSocialBlur}
                    removeSocialProfile={removeSocialProfile}
                    addSocialProfile={addSocialProfile}
                  />
                ) : type === "Organization" ? (
                  <OrganizationForm
                    fields={fields}
                    handleChange={handleChange}
                    renderError={renderError}
                    schemaFields={schemaFields as any}
                    orgTypeOpen={orgTypeOpen}
                    setOrgTypeOpen={setOrgTypeOpen}
                    orgMoreSpecificOpen={orgMoreSpecificOpen}
                    setOrgMoreSpecificOpen={setOrgMoreSpecificOpen}
                    ORG_TYPES={ORG_TYPES}
                    ORG_SUBTYPE_MAP={ORG_SUBTYPE_MAP}
                    orgExtras={orgExtras}
                    setOrgExtras={setOrgExtras}
                    orgExtraKeyOpenIndex={orgExtraKeyOpenIndex}
                    setOrgExtraKeyOpenIndex={setOrgExtraKeyOpenIndex}
                    ORG_ADDITIONAL_OPTIONS={ORG_ADDITIONAL_OPTIONS}
                    socialProfiles={socialProfiles}
                    handleSocialChange={handleSocialChange}
                    handleSocialBlur={handleSocialBlur}
                    removeSocialProfile={removeSocialProfile}
                    addSocialProfile={addSocialProfile}
                    contacts={contacts}
                    addContact={addContact}
                    removeContact={removeContact}
                    updateContact={updateContact}
                    contactTypeOpenIndex={contactTypeOpenIndex}
                    setContactTypeOpenIndex={setContactTypeOpenIndex}
                    areaCountryOpenIndex={areaCountryOpenIndex}
                    setAreaCountryOpenIndex={setAreaCountryOpenIndex}
                    areaCountrySearch={areaCountrySearch}
                    setAreaCountrySearch={setAreaCountrySearch}
                    COUNTRY_LIST={COUNTRY_LIST}
                    languageOpenIndex={languageOpenIndex}
                    setLanguageOpenIndex={setLanguageOpenIndex}
                    languageSearch={languageSearch}
                    setLanguageSearch={setLanguageSearch}
                    LANG_LIST={LANG_LIST}
                    displayNames={displayNames ? { of: displayNames.of } : undefined}
                    optionsOpenIndex={optionsOpenIndex}
                    setOptionsOpenIndex={setOptionsOpenIndex}
                    CONTACT_OPTIONS={CONTACT_OPTIONS}
                    openingHoursState={openingHoursState}
                    addOpeningHour={addOpeningHour}
                    updateOpeningHour={updateOpeningHour}
                    removeOpeningHour={removeOpeningHour}
                  />
                ) : (
                              type === "Product" ? (
                                <ProductForm
                                  fields={fields}
                                  handleChange={handleChange}
                                  schemaFields={schemaFields}
                                  renderError={renderError}
                                  productIdSelected={productIdSelected}
                                  setProductIdSelected={setProductIdSelected}
                                  productIdOpen={productIdOpen}
                                  setProductIdOpen={setProductIdOpen}
                                  productOfferOpen={productOfferOpen}
                                  setProductOfferOpen={setProductOfferOpen}
                                  offerDisabled={offerDisabled}
                                  productCurrencyOpen={productCurrencyOpen}
                                  setProductCurrencyOpen={setProductCurrencyOpen}
                                  productCurrencySearch={productCurrencySearch}
                                  setProductCurrencySearch={setProductCurrencySearch}
                                  ALL_CURRENCIES={ALL_CURRENCIES}
                                  isAggregateOffer={isAggregateOffer}
                                  productAvailabilityOpen={productAvailabilityOpen}
                                  setProductAvailabilityOpen={setProductAvailabilityOpen}
                                  TICKET_AVAILABILITY_OPTIONS={TICKET_AVAILABILITY_OPTIONS}
                                  productItemConditionOpen={productItemConditionOpen}
                                  setProductItemConditionOpen={setProductItemConditionOpen}
                                  ITEM_CONDITION_OPTIONS={ITEM_CONDITION_OPTIONS}
                                  handleReviewFieldChange={handleReviewFieldChange}
                                  handleReviewFieldBlur={handleReviewFieldBlur}
                                  reviews={reviews}
                                  addReview={addReview}
                                  removeReview={removeReview}
                                />
                              ) : (
                                schemaFields[type].map((field) => (
                                  <div key={field.key} className="tool-field">
                                    <label className="tool-label">{field.label}</label>
                                    <input type="text" className="tool-input" value={fields[field.key] || ""} placeholder={field.placeholder} onChange={(e) => handleChange(field.key, e.target.value)} />
                                    {renderError(field.key)}
                                  </div>
                                ))
                              )
                            )
              )
            )}
            {renderHelpLinks(type)}
          </div>

          {/* RIGHT PREVIEW */}
          <SchemaPreview
            schemaScript={schemaScript}
            onTest={handleTest}
            onValidate={handleValidate}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onReset={handleReset}
            copied={copied}
            downloadMsgVisible={downloadMsgVisible}
            resetMsgVisible={resetMsgVisible}
            testMsgVisible={testMsgVisible}
            validateMsgVisible={validateMsgVisible}
            richResultPreview={
              <div className="tool-serp bg-white mb-4">
                <h3 className="tool-section-title mt-0">Rich Result Eligibility</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{richResultPreview.text}</p>
                <div className="mt-3 text-sm text-gray-600">
                  Completion: <strong>{richResultPreview.completeCount}/{richResultPreview.totalCount || 0}</strong> key signals
                </div>
                {richResultPreview.missing.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-semibold text-secondary">Missing signals</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {richResultPreview.missing.map((key) => (
                        <span key={key} className="text-xs border border-orange-200 rounded-full px-3 py-1 bg-orange-50 text-orange-700">
                          {getFieldLabel(key)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </section>
      </div>
      </section>

      {/* =============================== */}
      {/* HOW TO USE / STEPS SECTION */}
      {/* =============================== */}
      <section className="section section--white">
        <div className="section-inner">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">How to Use the Schema Builder</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-5">Select a schema type, fill the relevant fields, then copy or download the JSON-LD. Use the test button to validate with Google's tool.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/pick.svg", import.meta.url).href,
                title: "1. Choose a Schema Type",
                desc: "Select the Schema.org type that best matches your page or content.",
              },
              {
                icon: new URL("../assets/icons/info.svg", import.meta.url).href,
                title: "2. Fill in the Required Fields",
                desc: "Provide the key information relevant to your selected schema type.",
              },
              {
                icon: new URL("../assets/icons/generate.svg", import.meta.url).href,
                title: "3. Generate, Copy, and Test",
                desc: "Copy the JSON-LD, run the Rich Results Test, and paste into your site head.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="step-icon-outer">
                  <div className="step-icon-circle">
                    <img src={icon} alt={title} className="step-icon-img" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-lg text-secondary max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== */}
      {/* FAQ SECTION */}
      {/* =============================== */}
      <section className="section section--neutral">
        <div className="section-inner">
          <h2 className="md:text-4xl mb-5 text-center">Frequently Asked Questions</h2>

          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx} className="border-b border-gray-200 group" open={openFaq === idx}>
              <summary
                className="flex items-center justify-between py-6 cursor-pointer text-left text-xl font-semibold text-secondary"
                onClick={(e) => {
                  e.preventDefault()
                  setOpenFaq(openFaq === idx ? null : idx)
                }}
                aria-expanded={openFaq === idx}
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <Minus className="w-6 h-6 text-secondary transition-transform duration-200" />
                ) : (
                  <Plus className="w-6 h-6 text-secondary transition-transform duration-200 faq-plus" />
                )}
              </summary>
              <div className="pb-6 text-lg text-secondary">
                {item.q === "Which schema type should I choose?" ? (
                  <div className="space-y-3">
                    <p>Choose based on your page:</p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Organization / LocalBusiness</strong> → company websites</li>
                      <li><strong>Article / BlogPosting</strong> → blog content</li>
                      <li><strong>FAQPage</strong> → FAQs</li>
                      <li><strong>Product</strong> → eCommerce</li>
                    </ul>
                    <p>Using the right type improves your chances of rich results.</p>
                  </div>
                ) : (
                  item.a
                )}
              </div>
            </details>
          ))}

          <div className="max-w-5xl mx-auto text-center mt-6">
            <p className="text-lg text-secondary">Still stuck? <a href="https://cralite.com/contact/" className="text-primary font-normal">Contact us</a>.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/schema-builder" />
        </div>
      </section>
    </>
  )
}

