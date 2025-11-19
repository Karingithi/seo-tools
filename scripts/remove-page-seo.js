/*
 Tool: scripts/remove-page-seo.js
 Purpose: Find page files under src/pages that include a <Seo .../> component, show a dry-run, and optionally remove the import + JSX.

 Usage:
  node ./scripts/remove-page-seo.js --dry-run
  node ./scripts/remove-page-seo.js --apply

 The script will back up modified files to .seo-backups/<timestamp>/ before changing anything when --apply is used.
*/

const fs = require('fs')
const path = require('path')

const SRC = path.resolve(__dirname, '..', 'src', 'pages')

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(full))
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) files.push(full)
  }
  return files
}

function previewChanges(filePath, content) {
  const importRegex = /import\s+Seo\s+from\s+['\"](\.\.|\.\/).*components\/Seo['\"];?/g
  const jsxRegex = /<Seo[\s\S]*?\/>\s*\n?/g
  const hasImport = importRegex.test(content)
  const hasJsx = jsxRegex.test(content)
  return { hasImport, hasJsx }
}

function removeSeoInstances(content) {
  // Remove import line for Seo
  const importRegex = /import\s+Seo\s+from\s+['\"](\.\.|\.\/).*components\/Seo['\"];?\n?/g
  content = content.replace(importRegex, '')
  // Remove first Seo JSX occurrence (self-closing or multiline)
  const jsxRegex = /\n?\s*<Seo[\s\S]*?\/>\s*\n?/g
  content = content.replace(jsxRegex, '')
  return content
}

function backupFile(originalPath, backupDir) {
  const rel = path.relative(process.cwd(), originalPath)
  const dest = path.join(backupDir, rel)
  const destDir = path.dirname(dest)
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(originalPath, dest)
}

function main() {
  const args = process.argv.slice(2)
  const apply = args.includes('--apply')
  const dry = args.includes('--dry-run') || !apply

  const files = walk(SRC)
  const matches = []

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8')
    const p = previewChanges(f, content)
    if (p.hasImport || p.hasJsx) {
      matches.push({ file: f, ...p })
    }
  }

  if (!matches.length) {
    console.log('No page-level Seo imports or usage found under src/pages.')
    return
  }

  console.log(`Found ${matches.length} file(s) with Seo usage:`)
  matches.forEach((m) => console.log(` - ${m.file}  import:${m.hasImport} jsx:${m.hasJsx}`))

  if (dry) {
    console.log('\nDry run mode — no files will be changed. Run with --apply to modify files.')
    return
  }

  // apply mode
  const backupDir = path.join(process.cwd(), '.seo-backups', Date.now().toString())
  fs.mkdirSync(backupDir, { recursive: true })

  for (const m of matches) {
    const orig = fs.readFileSync(m.file, 'utf8')
    backupFile(m.file, backupDir)
    const updated = removeSeoInstances(orig)
    fs.writeFileSync(m.file, updated, 'utf8')
    console.log(`Patched ${m.file} (backup -> ${backupDir})`)
  }

  console.log('\nDone. Backups saved under ' + backupDir)
}

main()
