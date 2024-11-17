<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import imgUrl from './assets/vue.svg'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img aria-label="logo-assets" src="/shared/images/vite.svg"
           alt="Vite logo"/>
      <img aria-label="img-base" src="/images/settings.png"/>
      <img aria-label="img-base-with-parent" src="/public2/images/settings.png"
           alt="Vite logo"/>
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img :src="imgUrl" class="logo vue" alt="Vue logo"/>
    </a>
  </div>
  <HelloWorld msg="Vite + Vue"/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
