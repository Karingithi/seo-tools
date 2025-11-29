// src/lib/schema/builders.ts
import { DAY_ORDER } from "./constants"

export type BuildParams = {
  type: string
  fields: Record<string, string>
  // Article
  images: string[]
  // Breadcrumb
  breadcrumbs: Array<{ name: string; url: string }>
  // FAQ
  faqItemsState: Array<{ question: string; answer: string }>
  // Person / Organization
  socialProfiles: string[]
  // Video
  videoThumbnails: string[]
  videoMinutes: string
  videoSeconds: string
  // Local Business
  openingHoursState: Array<{ days: string; opens: string; closes: string }>
  departments: Array<{ localBusinessType: string; moreSpecificType: string; name: string; imageUrl: string; telephone: string; days: string; opens: string; closes: string }>
  // Organization
  contacts: Array<{ contactType: string; phone: string; areaServed: string; availableLanguage: string; options: string }>
  // Event
  ticketTypes: Array<{ name: string; price: string; currency?: string; availableFrom?: string; url?: string; availability?: string }>
  ticketDefaultCurrency: string
}

// These helpers were previously inline in SchemaBuilder
export const normalizeDaysToCodes = (daysRaw: string): string[] => {
  if (!daysRaw) return []
  const DAY_CODE_MAP: Record<string, string> = {
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
  return daysRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((d) => DAY_CODE_MAP[d] || d)
    .filter(Boolean)
    .map((d) => (DAY_ORDER.includes(d) ? d : null))
    .filter(Boolean) as string[]
}

export const collapseDayRanges = (codes: string[]): string[] => {
  if (!codes || !codes.length) return []
  const idxs = Array.from(new Set(codes.map((c) => DAY_ORDER.indexOf(c)).filter((i) => i >= 0))).sort((a, b) => a - b)
  const ranges: string[] = []
  let start = idxs[0]
  let end = idxs[0]
  for (let i = 1; i < idxs.length; i++) {
    const cur = idxs[i]
    if (cur === end + 1) {
      end = cur
    } else {
      ranges.push(start === end ? DAY_ORDER[start] : `${DAY_ORDER[start]}-${DAY_ORDER[end]}`)
      start = cur
      end = cur
    }
  }
  ranges.push(start === end ? DAY_ORDER[start] : `${DAY_ORDER[start]}-${DAY_ORDER[end]}`)
  return ranges
}

export function buildSchemaFromState(p: BuildParams): any {
  const { type, fields } = p
  const base: any = { "@context": "https://schema.org", "@type": type }

  Object.entries(fields).forEach(([k, v]) => {
    if (v && v.trim()) base[k] = v.trim()
  })

  // Inline the same branching as before, but reading from params
  // For brevity, reuse the original shapes. This mirrors SchemaBuilder logic.

  // Article
  if (type === "Article") {
    base["@type"] = (fields.articleType && fields.articleType.trim()) || "Article"
    const authorName = (fields.authorName || fields.author || "").trim()
    if (authorName) {
      base.author = { "@type": fields.authorType || "Person", name: authorName }
      if (fields.authorUrl && fields.authorUrl.trim()) base.author.url = fields.authorUrl.trim()
    }
    if (p.images && p.images.length) {
      const imgs = p.images.map((s) => s.trim()).filter(Boolean)
      if (imgs.length === 1) base.image = imgs[0]
      else if (imgs.length > 1) base.image = imgs
    } else if (fields.images && fields.images.trim()) {
      const imgs = fields.images.split(",").map((s) => s.trim()).filter(Boolean)
      base.image = imgs.length === 1 ? imgs[0] : imgs
    }
    if (fields.publisherName?.trim() || fields.publisherLogo?.trim()) {
      base.publisher = { "@type": "Organization" }
      if (fields.publisherName?.trim()) base.publisher.name = fields.publisherName.trim()
      if (fields.publisherLogo?.trim()) base.publisher.logo = { "@type": "ImageObject", url: fields.publisherLogo.trim() }
    }
    if (fields.datePublished?.trim()) base.datePublished = fields.datePublished.trim()
    if (fields.dateModified?.trim()) base.dateModified = fields.dateModified.trim()
    if (fields.articleBody?.trim()) base.articleBody = fields.articleBody.trim()
    delete base.articleType
    delete base.authorName
    delete base.authorUrl
    delete base.authorType
    delete base.images
    delete base.publisherName
    delete base.publisherLogo
    delete base.strictHeadlineLimit
    delete base.author
    return base
  }

  // Breadcrumb
  if (type === "Breadcrumb") {
    const items = p.breadcrumbs && p.breadcrumbs.length
      ? p.breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name || `Page ${i + 1}`, item: b.url || "" }))
      : (fields.itemList ? fields.itemList.split("\n").map((line: string, i: number) => ({ "@type": "ListItem", position: i + 1, name: line.split("|")[0] || `Page ${i + 1}`, item: (line.split("|")[1] || "").trim() })) : [])
    return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.filter((it: any) => it.item && it.item.length) }
  }

  // FAQ Page
  if (type === "FAQ Page") {
    const mainEntity = (p.faqItemsState || [])
      .map((f) => ({ "@type": "Question", name: (f.question || "").trim(), acceptedAnswer: { "@type": "Answer", text: (f.answer || "").trim() } }))
      .filter((q) => q.name && q.acceptedAnswer.text)
    return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity }
  }

  // Person
  if (type === "Person") {
    const person: any = { "@context": "https://schema.org", "@type": "Person" }
    if (fields.name?.trim()) person.name = fields.name.trim()
    if (fields.url?.trim()) person.url = fields.url.trim()
    if (fields.pictureUrl?.trim()) person.image = fields.pictureUrl.trim()
    const sa = (p.socialProfiles && p.socialProfiles.length)
      ? p.socialProfiles.map((s) => s.trim()).filter(Boolean)
      : (fields.sameAs?.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (sa.length) person.sameAs = sa
    if (fields.worksFor?.trim()) person.worksFor = { "@type": "Organization", name: fields.worksFor.trim() }
    if (fields.jobTitle?.trim()) person.jobTitle = fields.jobTitle.trim()
    return person
  }

  // Product
  if (type === "Product") {
    if (fields.price?.trim()) {
      const offer: any = { "@type": "Offer", price: fields.price.trim(), priceCurrency: fields.currency || "USD" }
      if (fields.availability?.trim()) {
        const avail = fields.availability.trim()
        offer.availability = avail.startsWith("http") ? avail : `https://schema.org/${avail}`
      }
      if (fields.priceValidUntil?.trim()) offer.priceValidUntil = fields.priceValidUntil.trim()
      if (fields.url?.trim()) offer.url = fields.url.trim()
      if (fields.itemCondition?.trim()) {
        const cond = fields.itemCondition.trim()
        offer.itemCondition = cond.startsWith("http") ? cond : `https://schema.org/${cond}`
      }
      base.offers = offer
    }
    if (fields.ratingValue?.trim()) {
      const rating: any = { "@type": "AggregateRating", ratingValue: fields.ratingValue.trim() }
      if (fields.reviewCount?.trim()) rating.reviewCount = fields.reviewCount.trim()
      base.aggregateRating = rating
    }
    delete base.price
    delete base.currency
    delete base.priceValidUntil
    delete base.availability
    delete base.itemCondition
    delete base.ratingValue
    delete base.reviewCount
  }

  // Event
  if (type === "Event") {
    if (fields.location) base.location = { "@type": "Place", name: fields.location }
    const combineDateTime = (date?: string, time?: string) => {
      if (!date) return undefined
      const d = date.trim()
      const t = time?.trim() ? time.trim() : null
      return t ? `${d}T${t}` : d
    }
    const sdt = combineDateTime(fields.startDate, fields.startTime)
    const edt = combineDateTime(fields.endDate, fields.endTime)
    if (sdt) base.startDate = sdt
    if (edt) base.endDate = edt
    if (fields.performerName?.trim()) base.performer = { "@type": (fields.performerType?.trim()) || "Person", name: fields.performerName.trim() }
    if (fields.eventStatus?.trim()) {
      const status = fields.eventStatus.trim()
      base.eventStatus = status.startsWith("http") ? status : `https://schema.org/${status}`
    }
    if (fields.attendanceMode?.trim()) {
      const mode = fields.attendanceMode.trim()
      base.eventAttendanceMode = mode.startsWith("http") ? mode : `https://schema.org/${mode}`
    }
    if (fields.imageUrl?.trim()) base.image = fields.imageUrl.trim()
    if (p.ticketTypes && p.ticketTypes.length) {
      const offers = p.ticketTypes
        .map((t) => {
          const has = (t.name || "").trim() || (t.price || "").trim()
          if (!has) return null
          const of: any = { "@type": "Offer" }
          if (t.name?.trim()) of.name = t.name.trim()
          if (t.price?.trim()) of.price = t.price.trim()
          of.priceCurrency = (t.currency?.trim()) || (p.ticketDefaultCurrency?.trim()) || undefined
          if (t.url?.trim()) of.url = t.url.trim()
          if (t.availability?.trim()) {
            const raw = t.availability.trim()
            of.availability = raw.startsWith("http") ? raw : `https://schema.org/${raw}`
          }
          if (t.availableFrom?.trim()) of.validFrom = t.availableFrom.trim()
          return Object.keys(of).length > 1 ? of : null
        })
        .filter(Boolean) as any[]
      if (offers.length === 1) base.offers = offers[0]
      else if (offers.length > 1) base.offers = offers
    }
    delete base.location
    delete base.performerName
    delete base.performerType
    delete base.startTime
    delete base.endTime
    delete base.imageUrl
    return base
  }

  // Website Sitelinks Searchbox
  if (type === "Website Sitelinks Searchbox") {
    const site: any = { "@context": "https://schema.org", "@type": "WebSite" }
    if (fields.name?.trim()) site.name = fields.name.trim()
    if (fields.url?.trim()) site.url = fields.url.trim()
    if (fields.description?.trim()) site.description = fields.description.trim()
    if (fields.urlTemplate?.trim()) {
      site.potentialAction = { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: fields.urlTemplate.trim() }, "query-input": "required name=search_term_string" }
    }
    return site
  }

  // Video
  if (type === "Video") {
    const video: any = { "@context": "https://schema.org", "@type": "VideoObject" }
    if (fields.name?.trim()) video.name = fields.name.trim()
    if (fields.description?.trim()) video.description = fields.description.trim()
    const thumbs = (p.videoThumbnails && p.videoThumbnails.length)
      ? p.videoThumbnails.map((s) => (s || "").trim()).filter(Boolean)
      : (fields.thumbnailUrl ? fields.thumbnailUrl.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (thumbs.length === 1) video.thumbnailUrl = thumbs[0]
    else if (thumbs.length > 1) video.thumbnailUrl = thumbs
    if (fields.uploadDate?.trim()) video.uploadDate = fields.uploadDate.trim()
    let durationVal = fields.duration?.trim() ? fields.duration.trim() : ""
    if (!durationVal) {
      const m = parseInt(p.videoMinutes || "0", 10) || 0
      const s = parseInt(p.videoSeconds || "0", 10) || 0
      if (m || s) durationVal = `PT${m}M${s}S`
    }
    if (durationVal) video.duration = durationVal
    if (fields.contentUrl?.trim()) video.contentUrl = fields.contentUrl.trim()
    if (fields.embedUrl?.trim()) video.embedUrl = fields.embedUrl.trim()
    if (fields.seekToTarget?.trim()) {
      video.potentialAction = { "@type": "SeekToAction", target: { "@type": "EntryPoint", urlTemplate: fields.seekToTarget.trim() }, "startOffset-input": "required name=seek_to_second_number" }
    }
    delete video.thumbnailUrl
    delete video.duration
    delete video.seekToTarget
    return video
  }

  // Recipe
  if (type === "Recipe") {
    const recipe: any = { "@context": "https://schema.org", "@type": "Recipe" }
    if (fields.name?.trim()) recipe.name = fields.name.trim()
    if (fields.description?.trim()) recipe.description = fields.description.trim()
    if (fields.authorName?.trim()) {
      recipe.author = { "@type": fields.authorType || "Person", name: fields.authorName.trim() }
      if (fields.authorUrl?.trim()) recipe.author.url = fields.authorUrl.trim()
    }
    if (p.images && p.images.length) {
      const imgs = p.images.map((s) => s.trim()).filter(Boolean)
      if (imgs.length === 1) recipe.image = imgs[0]
      else if (imgs.length > 1) recipe.image = imgs
    } else if (fields.images?.trim()) {
      const imgs = fields.images.split(",").map((s) => s.trim()).filter(Boolean)
      recipe.image = imgs.length === 1 ? imgs[0] : imgs
    }
    if (fields.ingredients?.trim()) {
      const parts = fields.ingredients.includes("\n") ? fields.ingredients.split(/\r?\n/) : fields.ingredients.split(",")
      recipe.recipeIngredient = parts.map((p) => p.trim()).filter(Boolean)
    }
    if (fields.prepTime?.trim()) recipe.prepTime = fields.prepTime.trim()
    if (fields.cookTime?.trim()) recipe.cookTime = fields.cookTime.trim()
    if (fields.totalTime?.trim()) recipe.totalTime = fields.totalTime.trim()
    if (fields.recipeYield?.trim()) recipe.recipeYield = fields.recipeYield.trim()
    if (fields.recipeInstructions?.trim()) {
      const steps = fields.recipeInstructions.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      if (steps.length === 1) recipe.recipeInstructions = steps[0]
      else recipe.recipeInstructions = steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s }))
    }
    delete recipe.images
    delete recipe.ingredients
    delete recipe.authorName
    delete recipe.authorUrl
    delete recipe.authorType
    return recipe
  }

  // How-to
  if (type === "How-to") {
    const howto: any = { "@context": "https://schema.org", "@type": "HowTo" }
    if (fields.name?.trim()) howto.name = fields.name.trim()
    if (fields.description?.trim()) howto.description = fields.description.trim()
    if (fields.totalTime?.trim()) howto.totalTime = fields.totalTime.trim()
    const parseList = (s?: string) => {
      if (!s) return []
      const arr = s.includes("\n") ? s.split(/\r?\n/) : s.split(",")
      return arr.map((x) => x.trim()).filter(Boolean)
    }
    // Prefer repeater state
    const toolsOut = (p as any).howToTools as string[] | undefined
    const suppliesOut = (p as any).howToSupplies as string[] | undefined
    const toolsArr = toolsOut && toolsOut.length ? toolsOut.map((x) => x.trim()).filter(Boolean) : parseList(fields.tools)
    const supplyArr = suppliesOut && suppliesOut.length ? suppliesOut.map((x) => x.trim()).filter(Boolean) : parseList(fields.supply)
    if (toolsArr.length) howto.tool = toolsArr
    if (supplyArr.length) howto.supply = supplyArr
    const stepsState = (p as any).howToSteps as Array<{ instruction: string; imageUrl?: string; name?: string; url?: string }>
    if (stepsState && stepsState.length && stepsState.some((s) => (s.instruction || "").trim())) {
      const steps = stepsState
        .map((s) => ({ "@type": "HowToStep", position: 0, text: s.instruction?.trim() || undefined, name: s.name?.trim() || undefined, image: s.imageUrl?.trim() || undefined, url: s.url?.trim() || undefined }))
        .filter((s) => s.text)
      howto.step = steps.map((s, i) => ({ ...s, position: i + 1 }))
    } else if (fields.steps?.trim()) {
      const steps = fields.steps.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
      howto.step = steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s }))
    }
    delete howto.tools
    delete howto.supply
    delete howto.steps
    return howto
  }

  // Job Posting
  if (type === "Job Posting") {
    const job: any = { "@context": "https://schema.org", "@type": "JobPosting" }
    if (fields.title?.trim()) job.title = fields.title.trim()
    if (fields.jobDescription?.trim()) job.description = fields.jobDescription.trim()
    if (fields.datePosted?.trim()) job.datePosted = fields.datePosted.trim()
    if (fields.validThrough?.trim()) job.validThrough = fields.validThrough.trim()
    if (fields.employmentType?.trim()) job.employmentType = fields.employmentType.trim()
    if (fields.workHours?.trim()) job.workHours = fields.workHours.trim()
    if (fields.hiringOrganization?.trim()) {
      job.hiringOrganization = { "@type": "Organization", name: fields.hiringOrganization.trim() }
      if (fields.hiringOrganizationUrl?.trim()) job.hiringOrganization.sameAs = fields.hiringOrganizationUrl.trim()
      if (fields.companyLogo?.trim()) job.hiringOrganization.logo = fields.companyLogo.trim()
    }
    if (fields.identifier?.trim()) job.identifier = { "@type": "PropertyValue", value: fields.identifier.trim() }
    const hasAddress = fields.street || fields.city || fields.region || fields.postalCode || fields.country
    if (hasAddress) {
      const addr: any = { "@type": "PostalAddress" }
      if (fields.street?.trim()) addr.streetAddress = fields.street.trim()
      if (fields.city?.trim()) addr.addressLocality = fields.city.trim()
      if (fields.region?.trim()) addr.addressRegion = fields.region.trim()
      if (fields.postalCode?.trim()) addr.postalCode = fields.postalCode.trim()
      if (fields.country?.trim()) addr.addressCountry = fields.country.trim()
      job.jobLocation = { "@type": "Place", address: addr }
    }
    if (fields.isRemote === "true") job.jobLocationType = "TELECOMMUTE"
    const minRaw = fields.minSalary?.trim() ? Number(fields.minSalary.trim()) : NaN
    const maxRaw = fields.maxSalary?.trim() ? Number(fields.maxSalary.trim()) : NaN
    const currency = fields.currency?.trim() || "USD"
    const unitText = fields.salaryUnit?.trim() || undefined
    if (Number.isFinite(minRaw) || Number.isFinite(maxRaw)) {
      const value: any = { "@type": "QuantitativeValue" }
      if (Number.isFinite(minRaw)) value.minValue = minRaw
      if (Number.isFinite(maxRaw)) value.maxValue = maxRaw
      if (unitText) value.unitText = unitText
      job.baseSalary = { "@type": "MonetaryAmount", currency, value }
    }
    if (fields.responsibilities?.trim()) job.responsibilities = fields.responsibilities.trim()
    if (fields.skills?.trim()) job.skills = fields.skills.split(/\r?\n|,\s*/).map((s) => s.trim()).filter(Boolean)
    if (fields.qualifications?.trim()) job.qualifications = fields.qualifications.trim()
    if (fields.educationRequirements?.trim()) job.educationRequirements = fields.educationRequirements.trim()
    if (fields.experienceRequirements?.trim()) job.experienceRequirements = fields.experienceRequirements.trim()
    delete job.jobDescription
    delete job.hiringOrganizationUrl
    delete job.companyLogo
    delete job.street
    delete job.city
    delete job.region
    delete job.postalCode
    delete job.country
    delete job.isRemote
    delete job.minSalary
    delete job.maxSalary
    delete job.currency
    delete job.salaryUnit
    return job
  }

  // Local Business
  if (type === "Local Business") {
    const bizType = (fields.moreSpecificType?.trim()) || (fields.localBusinessType?.trim()) || "LocalBusiness"
    const biz: any = { "@context": "https://schema.org", "@type": bizType }
    if (fields.name?.trim()) biz.name = fields.name.trim()
    if (fields.url?.trim()) biz.url = fields.url.trim()
    if (fields.imageUrl?.trim()) biz.image = fields.imageUrl.trim()
    if (fields["@id"]?.trim()) biz["@id"] = fields["@id"].trim()
    if (fields.telephone?.trim()) biz.telephone = fields.telephone.trim()
    if (fields.priceRange?.trim()) biz.priceRange = fields.priceRange.trim()
    const hasAddress = fields.street || fields.city || fields.region || fields.postalCode || fields.country
    if (hasAddress) {
      const addr: any = { "@type": "PostalAddress" }
      if (fields.street?.trim()) addr.streetAddress = fields.street.trim()
      if (fields.city?.trim()) addr.addressLocality = fields.city.trim()
      if (fields.region?.trim()) addr.addressRegion = fields.region.trim()
      if (fields.postalCode?.trim()) addr.postalCode = fields.postalCode.trim()
      if (fields.country?.trim()) addr.addressCountry = fields.country.trim()
      biz.address = addr
    }
    if ((fields.latitude?.trim()) || (fields.longitude?.trim())) {
      const lat = parseFloat((fields.latitude || "").trim())
      const lon = parseFloat((fields.longitude || "").trim())
      if (!isNaN(lat) && !isNaN(lon)) biz.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lon }
    }
    const formatOpeningHoursStrings = (): string[] => {
      if (fields.open24_7 === "true") return ["Mo-Su 00:00-23:59"]
      if (p.openingHoursState && p.openingHoursState.length) {
        const out: string[] = []
        p.openingHoursState.forEach((oh) => {
          const codes = normalizeDaysToCodes(oh.days || "")
          if (!codes.length) return
          const ranges = collapseDayRanges(codes)
          const opens = (oh.opens || "").trim()
          const closes = (oh.closes || "").trim()
          if (opens && closes) {
            const daysPart = ranges.join(",")
            out.push(`${daysPart} ${opens}-${closes}`)
          }
        })
        if (out.length) return out
      }
      if (fields.openingHours?.trim()) return [fields.openingHours.trim()]
      return []
    }
    const openingHoursStrings = formatOpeningHoursStrings()
    if (openingHoursStrings.length === 1) biz.openingHours = openingHoursStrings[0]
    else if (openingHoursStrings.length > 1) biz.openingHours = openingHoursStrings
    const CODE_TO_DAY: Record<string, string> = { Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday" }
    const buildOpeningHoursSpecs = (): any[] => {
      if (fields.open24_7 === "true") {
        return [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" }]
      }
      if (p.openingHoursState && p.openingHoursState.length) {
        const specs: any[] = []
        p.openingHoursState.forEach((oh) => {
          const codes = normalizeDaysToCodes(oh.days || "")
          if (!codes.length) return
          const daysOrdered = DAY_ORDER.filter((c) => codes.includes(c)).map((c) => CODE_TO_DAY[c])
          const opens = (oh.opens || "").trim()
          const closes = (oh.closes || "").trim()
          if (daysOrdered.length && opens && closes) specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: daysOrdered, opens, closes })
        })
        if (specs.length) return specs
      }
      return []
    }
    const openingHoursSpecs = buildOpeningHoursSpecs()
    if (openingHoursSpecs.length) biz.openingHoursSpecification = openingHoursSpecs
    if (p.departments && p.departments.length) {
      const deps = p.departments.map((d) => {
        const deptType = (d.moreSpecificType?.trim()) || (d.localBusinessType?.trim()) || "LocalBusiness"
        const obj: any = { "@type": deptType }
        if (d.name?.trim()) obj.name = d.name.trim()
        if (d.imageUrl?.trim()) obj.image = d.imageUrl.trim()
        if (d.telephone?.trim()) obj.telephone = d.telephone.trim()
        return obj
      })
      if (deps.length) biz.department = deps
    }
    const sa = (p.socialProfiles && p.socialProfiles.length)
      ? p.socialProfiles.map((s) => s.trim()).filter(Boolean)
      : (fields.sameAs?.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (sa.length) biz.sameAs = sa
    delete biz.imageUrl
    delete biz.street
    delete biz.city
    delete biz.region
    delete biz.postalCode
    delete biz.country
    delete biz.latitude
    delete biz.longitude
    delete biz.open24_7
    delete biz.localBusinessType
    delete biz.moreSpecificType
    return biz
  }

  // Organization
  if (type === "Organization") {
    const org: any = { ...base, "@type": "Organization" }
    const sa = (p.socialProfiles && p.socialProfiles.length)
      ? p.socialProfiles.map((s) => s.trim()).filter(Boolean)
      : (fields.sameAs?.trim() ? fields.sameAs.split(",").map((s) => s.trim()).filter(Boolean) : [])
    if (sa.length) org.sameAs = sa
    if (p.contacts && p.contacts.length) {
      const cps = p.contacts
        .map((c) => {
          const cp: any = { "@type": "ContactPoint" }
          if (c.contactType?.trim()) cp.contactType = c.contactType.trim()
          if (c.phone?.trim()) cp.telephone = c.phone.trim()
          if (c.areaServed?.trim()) cp.areaServed = c.areaServed.trim()
          if (c.availableLanguage?.trim()) {
            const langs = c.availableLanguage.includes(",") ? c.availableLanguage.split(",").map((s) => s.trim()).filter(Boolean) : [c.availableLanguage.trim()]
            cp.availableLanguage = langs.length === 1 ? langs[0] : langs
          }
          if (c.options?.trim()) cp.contactOption = c.options.trim()
          return Object.keys(cp).length > 1 ? cp : null
        })
        .filter(Boolean) as any[]
      if (cps.length) org.contactPoint = cps
    }
    return org
  }

  return base
}
