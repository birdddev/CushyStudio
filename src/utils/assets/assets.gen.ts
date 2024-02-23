import * as fs from 'fs'
import { writeFileSync } from 'fs'
import * as path from 'pathe'
import { join } from 'pathe'
import { cwd } from 'process'

// import { getRepoRoot } from 'src/back/reusable/getRepoFilePath'
// import { variableNameify } from 'src/back/reusable/variableNameify'

export const variableNameify = (name: string) => name.replaceAll(/[*\-+~.()'"!:@/]/g, '_').replace(/^\_/, '')

async function* walk(dir: string): AsyncGenerator<string, void, void> {
    for await (const leaf of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, leaf.name)
        if (leaf.isDirectory()) yield* walk(entry)
        else if (leaf.isFile()) yield entry
    }
}

const root = cwd()
const assetFolder = join(root, 'public')
const assets: { relPath: string; baseName: string; path: string }[] = []

for await (const p of walk(assetFolder)) {
    if (p.endsWith('minipaint')) continue
    // ignore code files
    if (p.endsWith('.ts')) continue
    if (p.endsWith('.js')) continue
    if (p.endsWith('.tsx')) continue
    // ignore icns
    if (p.endsWith('.icns')) continue
    // ignore test files
    if (p.endsWith('.md')) continue
    if (p.endsWith('.txt')) continue
    if (p.endsWith('.json')) continue
    if (p.endsWith('.html')) continue
    // ignore misc
    if (p.endsWith('.DS_Store')) continue
    if (p.includes('@')) continue
    const relPath = p.replace(assetFolder, '')
    const baseName = variableNameify(relPath)
    assets.push({ relPath, baseName, path: p })
}

assets.sort(({ relPath: b1 }, { relPath: b2 }) => b1.localeCompare(b2))

const moduleExports = [
    `// file generated by ./assetList.codegen.ts`,
    `import { cwd } from 'process'`,
    `const mkFile = (relPath: string) => \`file://\${cwd()}/public/\${relPath}\``,
    'export const assets = {',
    ...assets.map((i) => `    ${i.baseName}: mkFile('${i.relPath}'),`),
    '}\n',
].join('\n')

// prettier-ignore
// const imports      = assets.map((i) => `import ${i.baseName}_ from '.${i.base}'`).join('\n')
// const namedExports = assets.map((i) => ).join('\n')

const targetPath = `src/utils/assets/assets.ts`

const prevContent = fs.readFileSync(targetPath, 'utf-8')
if (prevContent === moduleExports) {
    console.log(`✅ no change to make to ${targetPath}`)
    process.exit(0)
} else {
    console.log(`🚹 changes detected`)
    writeFileSync(targetPath, moduleExports, 'utf-8')
    console.log(`🟢 done, ${targetPath}`)
    process.exit(0)
}
