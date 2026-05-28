<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animate, stagger } from 'animejs'

type Language = 'zh' | 'fr'

const lang = ref<Language>('zh')

const slideMap: Record<Language, string[]> = {
  zh: Array.from({ length: 12 }, (_, index) => {
    return `/slides/zh/${String(index + 1).padStart(2, '0')}.png`
  }),
  fr: Array.from({ length: 12 }, (_, index) => {
    return `/slides/fr/${String(index + 1).padStart(2, '0')}.png`
  }),
}

const slides = computed(() => slideMap[lang.value])

let observer: IntersectionObserver | null = null

function setLanguage(nextLang: Language) {
  if (lang.value === nextLang) return
  lang.value = nextLang
}

async function createObserver() {
  await nextTick()

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
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    },
  )

  cards.forEach((card) => observer?.observe(card))
}

watch(lang, async () => {
  await createObserver()

  animate('.slide-card', {
    opacity: [0.45, 1],
    translateY: [18, 0],
    scale: [0.985, 1],
    duration: 520,
    delay: stagger(35),
    easing: 'outQuad',
  })
})

onMounted(createObserver)

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

    <section class="slides-section">
      <article v-for="(slide, index) in slides" :key="slide" class="slide-card">
        <div class="slide-meta">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <span>{{ slides.length }}</span>
        </div>

        <img
          class="slide-image"
          :src="slide"
          :alt="`Slide ${index + 1}`"
          loading="lazy"
          decoding="async"
        />
      </article>
    </section>

    <footer class="footer">
      <span>© 2026 Armagnac Project</span>
      <span>{{
        lang === 'zh' ? '滚动浏览完整项目简报' : 'Faites défiler pour consulter la présentation'
      }}</span>
    </footer>
  </main>
</template>
