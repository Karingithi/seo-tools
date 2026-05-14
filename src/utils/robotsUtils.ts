export const buildRobotsTxt = (directives: { 
  userAgent?: string
  allow?: string
  disallow?: string
  sitemap?: string
}): string => {
  const lines = [`User-agent: ${directives.userAgent || "*"}`]

  if (directives.disallow) {
    lines.push(`Disallow: ${directives.disallow}`)
  }

  if (directives.allow) {
    lines.push(`Allow: ${directives.allow}`)
  }

  if (directives.sitemap) {
    lines.push(`Sitemap: ${directives.sitemap}`)
  }

  return lines.join("\n")
}

export const validateDirective = (value: string): boolean => {
  const regex = /^(User-agent:|Allow:|Disallow:)\s.*/i
  return regex.test(value)
}

export type RobotsRule = {
  directive: "allow" | "disallow"
  pattern: string
  lineNumber: number
  rawLine: string
}

export type RobotsCheckResult = {
  allowed: boolean
  message: string
  details: string[]
}

export const GENERIC_USER_AGENT = "-- Generic User-Agent (* Default) --"

function stripInlineComment(line: string): string {
  const hashIndex = line.indexOf("#")
  return (hashIndex === -1 ? line : line.slice(0, hashIndex)).trim()
}

function normalizePathForRobots(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "/"

  try {
    const parsed = new URL(trimmed)
    return `${parsed.pathname || "/"}${parsed.search || ""}`
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
}

function robotsPatternToRegex(pattern: string): RegExp {
  const anchoredEnd = pattern.endsWith("$")
  const body = anchoredEnd ? pattern.slice(0, -1) : pattern
  const regexBody = body.split("*").map(escapeRegex).join(".*")
  return new RegExp(`^${regexBody}${anchoredEnd ? "$" : ".*"}`)
}

export function parseRobotsTxt(content: string): Array<{ agents: string[]; rules: RobotsRule[] }> {
  const groups: Array<{ agents: string[]; rules: RobotsRule[] }> = []
  let currentAgents: string[] = []
  let currentRules: RobotsRule[] = []
  let hasStartedRules = false

  const commitGroup = () => {
    if (currentAgents.length === 0 && currentRules.length === 0) return
    groups.push({ agents: currentAgents.map((agent) => agent.toLowerCase()), rules: currentRules })
    currentAgents = []
    currentRules = []
    hasStartedRules = false
  }

  content.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = stripInlineComment(rawLine)
    if (!line) return
    const match = line.match(/^([a-z-]+)\s*:\s*(.*)$/i)
    if (!match) return
    const directive = match[1].toLowerCase()
    const value = match[2].trim()

    if (directive === "user-agent") {
      if (hasStartedRules) commitGroup()
      if (value) currentAgents.push(value)
      return
    }

    if (directive !== "allow" && directive !== "disallow") return
    if (currentAgents.length === 0) return
    hasStartedRules = true
    currentRules.push({ directive, pattern: value, lineNumber, rawLine: line })
  })

  commitGroup()
  return groups.filter((group) => group.agents.length > 0)
}

function agentMatchLength(ruleAgent: string, selectedAgent: string): number | null {
  if (ruleAgent === "*") return 0
  return selectedAgent.includes(ruleAgent) ? ruleAgent.length : null
}

function findApplicableGroups(groups: Array<{ agents: string[]; rules: RobotsRule[] }>, userAgent: string) {
  const selectedAgent = userAgent === GENERIC_USER_AGENT ? "*" : userAgent.toLowerCase()
  const candidates: Array<{ group: { agents: string[]; rules: RobotsRule[] }; matchLength: number; matchedAgent: string }> = []

  groups.forEach((group) => {
    group.agents.forEach((agent) => {
      const length = agentMatchLength(agent, selectedAgent)
      if (length !== null) candidates.push({ group, matchLength: length, matchedAgent: agent })
    })
  })

  if (candidates.length === 0) return { groups: [], matchedAgent: "" }
  const bestLength = Math.max(...candidates.map((candidate) => candidate.matchLength))
  const best = candidates.filter((candidate) => candidate.matchLength === bestLength)
  return {
    groups: Array.from(new Set(best.map((candidate) => candidate.group))),
    matchedAgent: bestLength === 0 ? "*" : best[0].matchedAgent,
  }
}

function getPatternLength(pattern: string): number {
  return pattern.replace(/\*|\$/g, "").length
}

export function evaluateRobotsAccess(content: string, userAgent: string, rawPath: string): RobotsCheckResult {
  const groups = parseRobotsTxt(content)
  const path = normalizePathForRobots(rawPath)

  if (groups.length === 0) {
    return { allowed: true, message: "Allowed. No valid User-agent groups were found.", details: [`Tested path: ${path}`] }
  }

  const applicable = findApplicableGroups(groups, userAgent)
  if (applicable.groups.length === 0) {
    return { allowed: true, message: "Allowed. No matching User-agent group was found.", details: [`Selected user-agent: ${userAgent}`, `Tested path: ${path}`] }
  }

  const matchingRules = applicable.groups
    .flatMap((group) => group.rules)
    .filter((rule) => rule.pattern && robotsPatternToRegex(rule.pattern).test(path))

  if (matchingRules.length === 0) {
    return {
      allowed: true,
      message: "Allowed. Matching group found, but no Allow or Disallow rule matches this path.",
      details: [`Matched user-agent group: ${applicable.matchedAgent}`, `Tested path: ${path}`],
    }
  }

  matchingRules.sort((a, b) => {
    const lengthDiff = getPatternLength(b.pattern) - getPatternLength(a.pattern)
    if (lengthDiff !== 0) return lengthDiff
    if (a.directive === b.directive) return a.lineNumber - b.lineNumber
    return a.directive === "allow" ? -1 : 1
  })

  const winningRule = matchingRules[0]
  const allowed = winningRule.directive === "allow"
  return {
    allowed,
    message: `${allowed ? "Allowed" : "Blocked"} by line ${winningRule.lineNumber}: ${winningRule.rawLine}`,
    details: [
      `Matched user-agent group: ${applicable.matchedAgent}`,
      `Tested path: ${path}`,
      `Winning rule length: ${getPatternLength(winningRule.pattern)}`,
      "Rule precedence: longest matching path wins; Allow wins ties.",
    ],
  }
}
