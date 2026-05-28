import fs from 'node:fs/promises'
import path from 'node:path'
import { convert } from 'pdf-poppler'

const ROOT = process.cwd()

const tasks = [
  {
    input: 'public/pdf/zh.pdf',
    outputDir: 'public/slides/zh',
  },
  {
    input: 'public/pdf/fr.pdf',
    outputDir: 'public/slides/fr',
  },
]

async function cleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
}

async function convertPdfToSlides(input, outputDir) {
  const inputPath = path.resolve(ROOT, input)
  const outputPath = path.resolve(ROOT, outputDir)

  await cleanDir(outputPath)

  console.log(`\n📄 ${input}`)

  await convert(inputPath, {
    format: 'png',
    out_dir: outputPath,
    out_prefix: 'slide',
    page: null,
    resolution: 180,
  })

  const files = await fs.readdir(outputPath)

  const pngFiles = files
    .filter((file) => file.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  for (let i = 0; i < pngFiles.length; i++) {
    const oldPath = path.join(outputPath, pngFiles[i])
    const newPath = path.join(outputPath, `${String(i + 1).padStart(2, '0')}.png`)

    await fs.rename(oldPath, newPath)
    console.log(`✅ ${newPath}`)
  }
}

async function main() {
  for (const task of tasks) {
    await convertPdfToSlides(task.input, task.outputDir)
  }

  console.log('\n🎉 Slides generated')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
