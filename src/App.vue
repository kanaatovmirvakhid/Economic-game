<script setup lang="ts">
import GameStatistics from './components/GameStatistics.vue';
import GameRanges from './components/GameRanges.vue';

import { useGameStore } from './stores/counter';
const gameStore = useGameStore();
</script>

<template>
 <div class="game">
    <header class="header">
      <GameStatistics :statistics="gameStore.statistics"></GameStatistics>
    </header>
    <main class="main">
      <GameRanges :ranges="gameStore.ranges"></GameRanges>
    </main>
    <footer class="footer">
      <q-btn
        size="22px"
        class="q-px-xl q-py-xs"
        color="secondary"
        label="НАЧАТЬ"
        @click="gameStore.startGame"
      />
    </footer>
  </div>
</template>

<style scoped>
.game{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-self: center;
  justify-content: center;
  gap: 30px;
}
header{
   flex: 0 0 auto;
   display: flex;
   justify-content: center;
}
.main{
   flex: 1 0 auto;
}
footer{
   flex: 0 0 auto;
   display: flex;
   justify-content: center;
}
</style>
