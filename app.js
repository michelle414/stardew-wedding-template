import rsvpConfig from './rsvp-config.js'

const weddingConfig = {
  groom: '邓天澍',
  bride: '邹涛',
  groomLatin: 'TIANSHU',
  brideLatin: 'TAO',
  weddingDate: '2026-10-25T00:00:00+08:00',
  dateDot: '2026 · 10 · 25',
  dateCn: '2026年10月25日 · 星期日',
  calendarMonth: 'OCT',
  calendarDay: '25',
  calendarYear: '2026',
  venue: '江西省吉安市吉州区沿江路99号 · 吉安宾馆',
  venueShort: '吉安宾馆·礼堂',
  navigationUrl: 'https://surl.amap.com/1qtd9gB5ti',
  schedule: [
    { label: '签到', time: '11：30', description: '领取今日任务，与老朋友相见' },
    { label: '仪式', time: '12：08', description: '见证拥抱、誓言与交换戒指' },
    { label: '喜宴', time: '12：18', description: '共享一场丰盛的秋日宴席' },
    { label: '合影', time: '待确认', description: '保存这一份快乐存档' },
  ],
}

const contentValues = {
  couple: `${weddingConfig.groom} × ${weddingConfig.bride}`,
  coupleAmp: `${weddingConfig.groom} & ${weddingConfig.bride}`,
  groomLatin: weddingConfig.groomLatin,
  brideLatin: weddingConfig.brideLatin,
  dateDot: weddingConfig.dateDot,
  dateCn: weddingConfig.dateCn,
  calendarMonth: weddingConfig.calendarMonth,
  calendarDay: weddingConfig.calendarDay,
  calendarYear: weddingConfig.calendarYear,
  venue: weddingConfig.venue,
  venueShort: weddingConfig.venueShort,
}

document.querySelectorAll('[data-content]').forEach((element) => {
  const key = element.dataset.content
  if (key in contentValues) element.textContent = contentValues[key]
  if (key === 'navigationLink') element.href = weddingConfig.navigationUrl
})

const scheduleGrid = document.querySelector('[data-content="schedule"]')
weddingConfig.schedule.forEach((item, index) => {
  const article = document.createElement('article')
  article.className = 'schedule-item'

  const number = document.createElement('span')
  number.className = 'schedule-index'
  number.textContent = String(index + 1).padStart(2, '0')

  const heading = document.createElement('b')
  heading.textContent = item.label
  const time = document.createElement('small')
  time.textContent = item.time
  heading.append(time)

  const description = document.createElement('p')
  description.textContent = item.description
  article.append(number, heading, description)
  scheduleGrid.append(article)
})

const weddingDate = new Date(weddingConfig.weddingDate)
const days = Math.max(0, Math.ceil((weddingDate.getTime() - Date.now()) / 86400000))
document.querySelector('#days-count').textContent = String(days)

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

if (rsvpConfig.enabled) {
  document.querySelectorAll('[data-rsvp-ui], [data-rsvp-shortcut]').forEach((element) => {
    element.hidden = false
  })
  import('./rsvp-client.js').then(({ initializeRsvp }) => initializeRsvp(rsvpConfig))
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const revealElements = document.querySelectorAll('.reveal')

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    }),
    { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
  )
  revealElements.forEach((element) => observer.observe(element))

  const animationObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      entry.target.classList.toggle('animations-paused', !entry.isIntersecting)
    }),
    { rootMargin: '25% 0px' },
  )
  document.querySelectorAll('.hero, .story-section, .ending').forEach((region) => animationObserver.observe(region))
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'))
}

const stars = document.querySelector('.sky-stars')
for (let index = 0; index < 34; index += 1) {
  const star = document.createElement('i')
  star.style.left = `${(index * 37 + 11) % 97}%`
  star.style.top = `${(index * 53 + 7) % 82}%`
  star.style.setProperty('--twinkle', `${1.4 + (index % 5) * 0.35}s`)
  star.style.animationDelay = `${-(index % 7) * 0.27}s`
  stars.append(star)
}

document.querySelectorAll('.pixel-petals').forEach((petalField, fieldIndex) => {
  for (let index = 0; index < 12; index += 1) {
    const petal = document.createElement('i')
    petal.style.left = `${5 + ((index * 19 + fieldIndex * 11) % 91)}%`
    petal.style.setProperty('--fall', `${4.8 + (index % 4) * 0.8}s`)
    petal.style.setProperty('--delay', `${-(index * 0.63)}s`)
    petalField.append(petal)
  }
})

if (!reducedMotion.matches) {
  const heroMountains = document.querySelector('.hero-mountains')
  let parallaxFrame
  let lastParallaxOffset
  const updateParallax = () => {
    const offset = Math.min(window.scrollY * 0.055, 30)
    if (offset !== lastParallaxOffset) {
      heroMountains.style.setProperty('--parallax-y', `${offset}px`)
      lastParallaxOffset = offset
    }
    parallaxFrame = undefined
  }
  window.addEventListener('scroll', () => {
    if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax)
  }, { passive: true })
}

const music = document.querySelector('#wedding-music')
const musicButton = document.querySelector('#music-toggle')
const audioStatus = document.querySelector('#audio-status')

let fadeFrame
let resumeAfterVisibility = false
let fileUnavailable = false
let currentMusicMode
let synthContext
let synthMaster
let synthTimer
let synthStopTimer
let noteIndex = 0

// 星露谷风格的备用像素旋律
const synthMelody = [
  261.63, 329.63, 392, 523.25,
  392, 329.63, 293.66, 349.23,
  440, 587.33, 440, 349.23,
]

function setMusicState(playing) {
  musicButton.classList.toggle('playing', playing)
  musicButton.setAttribute('aria-pressed', String(playing))
  musicButton.setAttribute(
    'aria-label',
    playing ? '暂停背景音乐' : '播放背景音乐',
  )

  audioStatus.textContent = playing
    ? '背景音乐正在播放'
    : '背景音乐已暂停'
}

function fadeVolume(target, duration = 650) {
  window.cancelAnimationFrame(fadeFrame)

  const start = music.volume
  const startedAt = performance.now()

  return new Promise((resolve) => {
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)

      music.volume = start + (target - start) * progress

      if (progress < 1) {
        fadeFrame = window.requestAnimationFrame(step)
      } else {
        resolve()
      }
    }

    fadeFrame = window.requestAnimationFrame(step)
  })
}

function ensureSynth() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) {
    throw new Error('Web Audio API is unavailable')
  }

  synthContext ||= new AudioContextClass()

  if (!synthMaster) {
    synthMaster = synthContext.createGain()
    synthMaster.gain.value = 0.0001
    synthMaster.connect(synthContext.destination)
  }
}

function playSynthNote(frequency) {
  const oscillator = synthContext.createOscillator()
  const gain = synthContext.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = frequency

  gain.gain.setValueAtTime(0.8, synthContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    synthContext.currentTime + 0.22,
  )

  oscillator.connect(gain).connect(synthMaster)

  oscillator.start()
  oscillator.stop(synthContext.currentTime + 0.23)
}

async function startSynthMusic() {
  if (synthTimer) return

  try {
    ensureSynth()

    window.clearTimeout(synthStopTimer)

    await synthContext.resume()

    synthMaster.gain.cancelScheduledValues(
      synthContext.currentTime,
    )

    synthMaster.gain.setValueAtTime(
      Math.max(0.0001, synthMaster.gain.value),
      synthContext.currentTime,
    )

    synthMaster.gain.linearRampToValueAtTime(
      0.2,
      synthContext.currentTime + 0.55,
    )

    playSynthNote(synthMelody[noteIndex])

    synthTimer = window.setInterval(() => {
      noteIndex = (noteIndex + 1) % synthMelody.length
      playSynthNote(synthMelody[noteIndex])
    }, 310)

    currentMusicMode = 'synth'

    setMusicState(true)

    audioStatus.textContent =
      '正在播放星露谷像素旋律'
  } catch {
    currentMusicMode = undefined
    setMusicState(false)

    audioStatus.textContent =
      '请点击页面开启背景音乐'
  }
}

function stopSynthMusic() {
  window.clearInterval(synthTimer)
  synthTimer = undefined

  if (!synthContext || !synthMaster) return

  synthMaster.gain.cancelScheduledValues(
    synthContext.currentTime,
  )

  synthMaster.gain.setValueAtTime(
    Math.max(0.0001, synthMaster.gain.value),
    synthContext.currentTime,
  )

  synthMaster.gain.exponentialRampToValueAtTime(
    0.0001,
    synthContext.currentTime + 0.28,
  )

  synthStopTimer = window.setTimeout(
    () => synthContext.suspend(),
    320,
  )
}

function isMusicPlaying() {
  if (currentMusicMode === 'synth') {
    return Boolean(synthTimer)
  }

  return (
    currentMusicMode === 'file' &&
    !music.paused
  )
}

async function playMusic() {
  if (isMusicPlaying()) return

  if (fileUnavailable) {
    await startSynthMusic()
    return
  }

  try {
    music.volume = 0

    await music.play()

    currentMusicMode = 'file'

    setMusicState(true)

    await fadeVolume(0.2)
  } catch (error) {
    // 如果 MP3 文件本身不可用，使用备用像素音乐
    if (
      music.error ||
      error?.name === 'NotSupportedError'
    ) {
      fileUnavailable = true
      await startSynthMusic()
      return
    }

    // 微信/浏览器因为自动播放策略拦截
    setMusicState(false)

    audioStatus.textContent =
      '点击屏幕开启背景音乐'
  }
}

async function pauseMusic() {
  if (currentMusicMode === 'synth') {
    stopSynthMusic()
    setMusicState(false)
    return
  }

  if (!music.paused) {
    await fadeVolume(0, 320)
    music.pause()
  }

  setMusicState(false)
}

music.addEventListener(
  'canplay',
  () => {
    fileUnavailable = false
  },
  { once: true },
)

music.addEventListener('error', () => {
  fileUnavailable = true

  if (currentMusicMode === 'file') {
    startSynthMusic()
  }
})

// 右下角音乐按钮
musicButton.addEventListener('click', (event) => {
  event.stopPropagation()

  if (isMusicPlaying()) {
    pauseMusic()
  } else {
    playMusic()
  }
})

// ========================================
// 自动播放
// ========================================

// 页面打开后立即尝试播放
window.setTimeout(() => {
  playMusic()
}, 100)

// 微信第一次触摸页面时立即播放
const unlockMusic = () => {
  if (!isMusicPlaying()) {
    playMusic()
  }

  // 只需要第一次触摸
  document.removeEventListener(
    'touchstart',
    unlockMusic,
  )

  document.removeEventListener(
    'pointerdown',
    unlockMusic,
  )

  document.removeEventListener(
    'click',
    unlockMusic,
  )
}

// 微信手机端最重要
document.addEventListener(
  'touchstart',
  unlockMusic,
  { passive: true },
)

// 兼容部分微信环境
document.addEventListener(
  'pointerdown',
  unlockMusic,
  { passive: true },
)

// 兼容电脑浏览器
document.addEventListener(
  'click',
  unlockMusic,
  { passive: true },
)

// 页面从后台回来
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resumeAfterVisibility = isMusicPlaying()

    if (resumeAfterVisibility) {
      music.pause()
      stopSynthMusic()
      setMusicState(false)
    }
  } else if (resumeAfterVisibility) {
    resumeAfterVisibility = false
    playMusic()
  }
})

// 离开页面
window.addEventListener('pagehide', () => {
  music.pause()
  stopSynthMusic()
  window.cancelAnimationFrame(fadeFrame)
})
