import { normalizeUrl, toNumber } from "./utils"

export function applyProductOffersAndRatings(base: any, fields: Record<string, string>) {
  // Offers (optional for Product)
  const hasOfferData = Boolean((fields.price || "").trim() || (fields.lowPrice || "").trim() || (fields.highPrice || "").trim() || (fields.offerCount || "").trim())
  if (hasOfferData) {
    const offer: any = { "@type": "Offer" }
    if ((fields.price || "").trim()) offer.price = (fields.price || "").trim()
    offer.priceCurrency = (fields.currency && fields.currency.trim()) || "USD"
    if ((fields.availability || "").trim()) {
      const avail = (fields.availability || "").trim()
      offer.availability = avail.startsWith("http") ? avail : `https://schema.org/${avail}`
    }
    const validUntil = normalizeUrl((fields.priceValidUntil || "").trim())
    // priceValidUntil expects a date (yyyy-mm-dd) but users sometimes paste urls — keep original trimmed value if valid date
    if ((fields.priceValidUntil || "").trim()) offer.priceValidUntil = (fields.priceValidUntil || "").trim()
    if ((fields.url || "").trim()) {
      const u = normalizeUrl(fields.url.trim())
      if (u) offer.url = u
      else offer.url = fields.url.trim()
    }
    if ((fields.itemCondition || "").trim()) {
      const cond = (fields.itemCondition || "").trim()
      offer.itemCondition = cond.startsWith("http") ? cond : `https://schema.org/${cond}`
    }

    const offerType = ((fields.offerType || "Offer") as string).trim()
    if (offerType === "AggregateOffer") {
      const agg: any = { "@type": "AggregateOffer" }
      if ((fields.lowPrice || "").trim()) agg.lowPrice = (fields.lowPrice || "").trim()
      if ((fields.highPrice || "").trim()) agg.highPrice = (fields.highPrice || "").trim()
      if ((fields.offerCount || "").trim()) {
        const n = toNumber(fields.offerCount.trim())
        agg.offerCount = n != null ? n : (fields.offerCount || "").trim()
      }
      agg.offers = offer
      base.offers = agg
    } else if (offerType === "Offer") {
      base.offers = offer
    }
  }

  // AggregateRating
  if ((fields.ratingValue || "").trim()) {
    const rating: any = { "@type": "AggregateRating", ratingValue: (fields.ratingValue || "").trim() }
    const ratingCountNum = toNumber((fields.ratingCount || "").trim())
    if (ratingCountNum != null) rating.ratingCount = ratingCountNum
    else if ((fields.reviewCount || "").trim()) {
      const rc = toNumber((fields.reviewCount || "").trim())
      rating.ratingCount = rc != null ? rc : (fields.reviewCount || "").trim()
    }
    if ((fields.reviewCount || "").trim()) {
      const rc2 = toNumber((fields.reviewCount || "").trim())
      rating.reviewCount = rc2 != null ? rc2 : (fields.reviewCount || "").trim()
    }
    if ((fields.bestRating || "").trim()) rating.bestRating = (fields.bestRating || "").trim()
    if ((fields.worstRating || "").trim()) rating.worstRating = (fields.worstRating || "").trim()
    base.aggregateRating = rating
  }

  // Clean up helper keys
  delete base.price
  delete base.currency
  delete base.priceValidUntil
  delete base.availability
  delete base.itemCondition
  delete base.ratingValue
  delete base.ratingCount
  delete base.bestRating
  delete base.worstRating
  delete base.reviewCount

  return base
}
