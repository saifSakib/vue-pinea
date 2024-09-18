<script setup>
  import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header>
    

    <div class="wrapper">
      <!-- <nav>
        <RouterLink to="/">Home</RouterLink> |
        <RouterLink to="/about">About</RouterLink>
      </nav> -->
    </div>
  </header>

  <RouterView />
  </div>
 
</template>

<style>
  #app{
    /* display: flex; */
    /* height: 100vh; */
    /* justify-content: center; */
    /* align-items: center; */
  }
</style>
