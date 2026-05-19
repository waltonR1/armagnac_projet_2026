<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animate, stagger } from 'animejs'

type Language = 'zh' | 'fr'

const lang = ref<Language>('zh')
const totalPages = 12

let observer: IntersectionObserver | null = null

const slides = computed(() =>
  Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1

    return {
      page,
      src: `/slides/${lang.value}/${String(page).padStart(2, '0')}.PNG`,
    }
  }),
)

function setLanguage(nextLang: Language) {
  if (lang.value === nextLang) return
  lang.value = nextLang
}

function createObserver() {
  if (observer) {
    observer.disconnect()
  }

  const cards = document.querySelectorAll<HTMLElement>('.slide-card')

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        const target = entry.target as HTMLElement

        animate(target, {
          opacity: [0, 1],
          translateY: [70, 0],
          scale: [0.965, 1],
          duration: 950,
          easing: 'outExpo',
        })

        observer?.unobserve(target)
      })
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px',
    },
  )

  cards.forEach((card) => observer?.observe(card))
}

async function animateLanguageChange() {
  await nextTick()

  animate('.slide-card', {
    opacity: [0.45, 1],
    translateY: [18, 0],
    scale: [0.985, 1],
    duration: 520,
    delay: stagger(35),
    easing: 'outQuad',
  })
}

watch(lang, animateLanguageChange)

onMounted(async () => {
  await nextTick()
  createObserver()
})

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
          type="button"
          class="language-button"
          :class="{ active: lang === 'zh' }"
          @click="setLanguage('zh')"
        >
          中文
        </button>

        <button
          type="button"
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
      <article v-for="slide in slides" :key="`${lang}-${slide.page}`" class="slide-card">
        <div class="slide-meta">
          <span>{{ String(slide.page).padStart(2, '0') }}</span>
          <span>{{ totalPages }}</span>
        </div>

        <img
          class="slide-image"
          :src="slide.src"
          :alt="`Slide ${slide.page}`"
          loading="lazy"
          draggable="false"
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
