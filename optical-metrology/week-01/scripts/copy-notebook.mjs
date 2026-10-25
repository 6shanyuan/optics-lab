import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(projectRoot, 'notebooks/week1_abcd_optics.ipynb')
const target = resolve(projectRoot, 'public/notebooks/week1_abcd_optics.ipynb')

mkdirSync(dirname(target), { recursive: true })
copyFileSync(source, target)
console.log('Notebook download is ready in public/notebooks/.')
