export function applyProductOffersAndRatings(base: any, fields: Record<string, string>) {
  // Offers (optional for Product) — respect selected offerType
  const hasOfferData = (fields.price && fields.price.trim()) || (fields.lowPrice && fields.lowPrice.trim()) || (fields.highPrice && fields.highPrice.trim()) || (fields.offerCount && fields.offerCount.trim())
  if (hasOfferData) {
    const offer: any = {
      "@type": "Offer",
    }
    if (fields.price && fields.price.trim()) offer.price = fields.price.trim()
    offer.priceCurrency = fields.currency || "USD"
    if (fields.availability && fields.availability.trim()) {
      const avail = fields.availability.trim()
      offer.availability = avail.startsWith("http") ? avail : `https://schema.org/${avail}`
    }
    if (fields.priceValidUntil && fields.priceValidUntil.trim()) {
      offer.priceValidUntil = fields.priceValidUntil.trim()
    }
    if (fields.url && fields.url.trim()) {
      offer.url = fields.url.trim()
    }
    if (fields.itemCondition && fields.itemCondition.trim()) {
      const cond = fields.itemCondition.trim()
      offer.itemCondition = cond.startsWith("http") ? cond : `https://schema.org/${cond}`
    }

    const offerType = (fields.offerType || "Offer").trim()
    if (offerType === "AggregateOffer") {
      const agg: any = { "@type": "AggregateOffer" }
      if (fields.lowPrice && fields.lowPrice.trim()) agg.lowPrice = fields.lowPrice.trim()
      if (fields.highPrice && fields.highPrice.trim()) agg.highPrice = fields.highPrice.trim()
      if (fields.offerCount && fields.offerCount.trim()) {
        const n = Number(fields.offerCount.trim())
        if (!isNaN(n)) agg.offerCount = n
        else agg.offerCount = fields.offerCount.trim()
      }
      // include an example Offer entry under 'offers' when available
      agg.offers = offer
      base.offers = agg
    } else if (offerType === "Offer" || offerType === "") {
      // If explicitly set to empty string, treat as None (do not emit offers)
      if (offerType === "Offer") base.offers = offer
    }
  }

  // AggregateRating (if rating provided)
  if (fields.ratingValue && fields.ratingValue.trim()) {
    const rating: any = {
      "@type": "AggregateRating",
      ratingValue: fields.ratingValue.trim(),
    }
    // ratingCount is preferred for AggregateRating; fall back to reviewCount if present
    if (fields.ratingCount && fields.ratingCount.trim()) {
      const n = Number(fields.ratingCount.trim())
      rating.ratingCount = !isNaN(n) ? n : fields.ratingCount.trim()
    } else if (fields.reviewCount && fields.reviewCount.trim()) {
      const n = Number(fields.reviewCount.trim())
      rating.ratingCount = !isNaN(n) ? n : fields.reviewCount.trim()
    }
    if (fields.reviewCount && fields.reviewCount.trim()) {
      const n = Number(fields.reviewCount.trim())
      rating.reviewCount = !isNaN(n) ? n : fields.reviewCount.trim()
    }
    if (fields.bestRating && fields.bestRating.trim()) {
      rating.bestRating = fields.bestRating.trim()
    }
    if (fields.worstRating && fields.worstRating.trim()) {
      rating.worstRating = fields.worstRating.trim()
    }
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
