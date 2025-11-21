// Centralized Font Awesome icon registration
// Import this file once (e.g. in `src/main.tsx`) to register icons globally.

import { library } from '@fortawesome/fontawesome-svg-core'
import {
	faFacebookF,
	faInstagram,
	faTwitter,
	faLinkedinIn,
	faYoutube,
	faWhatsapp,
} from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

// Add icons you use across the app so they are available via <FontAwesomeIcon />
library.add(
	faFacebookF,
	faInstagram,
	faTwitter,
	faLinkedinIn,
	faYoutube,
	faWhatsapp,
	faEnvelope,
	faChevronRight
)