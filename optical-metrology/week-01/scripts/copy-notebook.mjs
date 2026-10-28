import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(projectRoot, 'notebooks/week1_abcd_optics.ipynb')
const target = resolve(projectRoot, 'public/notebooks/week1_abcd_optics.ipynb')

mkdirSync(dirname(target), { recursive: true })
copyFileSync(source, target)
console.log('Notebook download is ready in public/notebooks/.')

const downloads = [
  ['archive/第一周教学逐字稿.md', '第一周教学逐字稿.md'],
  ['lessons/第1周完整讲义.md', '第1周完整讲义.md'],
  ['docs/逐字稿整理与核对记录.md', '逐字稿整理与核对记录.md'],
  ['docs/题库与解析.md', '题库与解析.md'],
]
mkdirSync(resolve(projectRoot, 'public/course'), { recursive: true })
for (const [from, to] of downloads) {
  const target = resolve(projectRoot, 'public/course', to)
  if (from.startsWith('archive/')) {
    copyFileSync(resolve(projectRoot, from), target)
  } else {
    // 单独下载的 Markdown 也能打开来源和图示链接。
    const repo = 'https://github.com/6shanyuan/optics-lab/blob/main/optical-metrology/week-01/'
    const content = readFileSync(resolve(projectRoot, from), 'utf8')
      .replaceAll('](../public/figures/', '](https://6shanyuan.github.io/optics-lab/figures/')
      .replaceAll('](../archive/', '](' + repo + 'archive/')
      .replaceAll('](../docs/', '](' + repo + 'docs/')
    writeFileSync(target, content)
  }
}
