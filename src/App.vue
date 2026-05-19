<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animate, stagger } from 'animejs'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

type Language = 'zh' | 'fr'

const lang = ref<Language>('zh')
const totalPages = ref(0)

const containerRef = ref<HTMLElement | null>(null)

const pdfMap: Record<Language, string> = {
  zh: '/pdf/zh.pdf',
  fr: '/pdf/fr.pdf',
}

let observer: IntersectionObserver | null = null
let renderToken = 0

function setLanguage(nextLang: Language) {
  if (lang.value === nextLang) return
  lang.value = nextLang
}

async function renderPdf() {
  if (!containerRef.value) return

  const token = ++renderToken
  const container = containerRef.value

  observer?.disconnect()
  container.innerHTML = ''

  const pdf = await pdfjsLib.getDocument(pdfMap[lang.value]).promise
  totalPages.value = pdf.numPages

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    if (token !== renderToken) return

    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 2.2 })
    const dpr = window.devicePixelRatio || 1

    const wrapper = document.createElement('article')
    wrapper.className = 'slide-card'

    const meta = document.createElement('div')
    meta.className = 'slide-meta'

    const current = document.createElement('span')
    current.innerText = String(pageNumber).padStart(2, '0')

    const total = document.createElement('span')
    total.innerText = String(pdf.numPages)

    meta.appendChild(current)
    meta.appendChild(total)

    const canvas = document.createElement('canvas')
    canvas.className = 'slide-image slide-canvas'

    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = Math.floor(viewport.width * dpr)
    canvas.height = Math.floor(viewport.height * dpr)
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    await page.render({
      canvas,
      canvasContext: context,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
    }).promise

    wrapper.appendChild(meta)
    wrapper.appendChild(canvas)
    container.appendChild(wrapper)
  }

  await nextTick()
  createObserver()
}

function createObserver() {
  observer?.disconnect()

  const cards = document.querySelectorAll<HTMLElement>('.slide-card')

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        animate(entry.target, {
          opacity: [0, 1],
          translateY: [70, 0],
          scale: [0.965, 1],
          duration: 950,
          easing: 'outExpo',
        })

        observer?.unobserve(entry.target)
      })
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px',
    },
  )

  cards.forEach((card) => observer?.observe(card))
}

watch(lang, async () => {
  await renderPdf()

  animate('.slide-card', {
    opacity: [0.45, 1],
    translateY: [18, 0],
    scale: [0.985, 1],
    duration: 520,
    delay: stagger(35),
    easing: 'outQuad',
  })
})

onMounted(renderPdf)

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <main class="presentation-page">
    <div class="background-glow background-glow-left" />
    <div class="background-glow background-glow-right" />

    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" />
        <span>Armagnac Project 2026</span>
      </div>

      <nav class="language-switch" aria-label="Language switch">
        <button
          class="language-button"
          :class="{ active: lang === 'zh' }"
          @click="setLanguage('zh')"
        >
          中文
        </button>

        <button
          class="language-button"
          :class="{ active: lang === 'fr' }"
          @click="setLanguage('fr')"
        >
          Français
        </button>
      </nav>
    </header>

    <section class="hero">
      <p class="hero-kicker">Gascony · Armagnac · AOC</p>
      <h1>
        {{ lang === 'zh' ? '加斯科涅之金' : 'L’or de Gascogne' }}
      </h1>
      <p class="hero-subtitle">
        {{
          lang === 'zh'
            ? '高端雅文邑酒庄项目 · 纵向网页简报'
            : 'Projet de domaine d’Armagnac haut de gamme · Présentation web'
        }}
      </p>
    </section>

    <section ref="containerRef" class="slides-section" />

    <footer class="footer">
      <span>© 2026 Armagnac Project</span>
      <span>{{
        lang === 'zh' ? '滚动浏览完整项目简报' : 'Faites défiler pour consulter la présentation'
      }}</span>
    </footer>
  </main>
</template>
