<template>
  <q-dialog v-model="gameStore.showWelcomeModal" persistent maximized>
    <q-card class="welcome-modal">
      <q-card-section class="bg-primary text-white">
        <div class="text-h4">Добро пожаловать в экономический симулятор!</div>
      </q-card-section>

      <q-card-section class="q-pa-md scroll">
        <div class="text-h5 q-mb-md">📌 Цель игры</div>
        <p>Вы управляете экономикой страны, используя рычаги четырех ключевых групп:</p>

        <div class="q-mt-lg">
         <div class="text-h6 q-mb-sm">🏦 Центробанк</div>
<ul>
  <li>Управление <b>Ключевой ставкой</b> для контроля инфляции</li>
  <li>Регулирование <b>Денежной массы</b> и кредитования</li>
</ul>
        </div>

        <div class="q-mt-md">
          <div class="text-h6 q-mb-sm">🏭 Бизнес</div>
          <ul>
            <li>Инвестиции в производство</li>
            <li>Управление зарплатами и ценами</li>
          </ul>
        </div>

        <div class="q-mt-md">
          <div class="text-h6 q-mb-sm">👨‍👩‍👧‍👦 Потребители</div>
          <ul>
            <li>Недовольство граждан</li>
            <li>Требования к зарплатам и ценам</li>
          </ul>
        </div>

        <div class="q-mt-md">
   <div class="text-h6 q-mb-sm">🏛️ Правительство</div>
<ul>
  <li>Изменение уровня <b>Налогов</b></li>
  <li>Управление <b>Государственными расходами</b></li>
  <li>Стимулирование <b>Участия в рабочей силе</b></li>
</ul>
        </div>

        <div class="text-h5 q-mt-lg q-mb-sm">🎯 Показатели успеха</div>
        <ul>
          <li>Рост ВВП</li>
          <li>Низкая инфляция (2-3%)</li>
          <li>Низкая безработица</li>
          <li>Стабильный бюджет</li>
        </ul>

        <div class="text-h5 q-mt-lg q-mb-sm">⚠️ Условия поражения</div>
        <ul>
          <li>Гиперинфляция (>60%)</li>
          <li>Дефолт (госдолг >120% ВВП)</li>
          <li>Социальный кризис (недовольство >90)</li>
        </ul>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-3 q-pa-md">
        <q-checkbox v-model="dontShowAgain" label="Больше не показывать" />
        <q-btn flat label="Начать игру" color="primary" @click="startGame" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/counter';
import { ref } from 'vue';

const gameStore = useGameStore();
const dontShowAgain = ref(false);

function startGame() {
  if (dontShowAgain.value) {
    gameStore.closeWelcome();
  } else {
    gameStore.showWelcomeModal = false;
  }
}
</script>

<style scoped lang="scss">
.welcome-modal {
  max-width: 800px;
  max-height: 90vh;
  color: #333;
  ul {
    padding-left: 20px;
    li {
      margin-bottom: 8px;
    }
  }

  .scroll {
    max-height: 60vh;
    overflow-y: auto;
  }
}
</style>
