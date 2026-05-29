<template>
  <q-dialog v-model="gameStore.showWelcomeModal" persistent maximized>
    <q-card class="welcome-modal">
      <q-card-section class="bg-primary text-white">
        <div class="text-h4">Добро пожаловать в экономический симулятор!</div>
      </q-card-section>

      <q-card-section class="q-pa-md scroll">
        <div class="text-h5 q-mb-md">📌 Контекст и цель игры</div>
        <p>
          Вы берете управление страной в момент тяжелейшего кризиса.
          Ваша задача: за 10 лет стабилизировать экономику, используя реальные рычаги управления четырех групп:
        </p>

        <div class="row q-col-gutter-md q-mt-lg">
          <!-- Блок Центробанк -->
          <div class="col-md-6 col-12">
            <div class="text-h6 q-mb-sm">🏦 Центробанк</div>
            <ul>
              <li><b>Ключевая ставка:</b> основной инструмент борьбы с инфляцией</li>
              <li><b>Денежная масса:</b> регулирование объема ликвидности в системе</li>
              <li><b>Кредитование:</b> стимулирование частного сектора</li>
            </ul>
          </div>

          <!-- Блок Бизнес -->
          <div class="col-md-6 col-12">
            <div class="text-h6 q-mb-sm">🏭 Бизнес</div>
            <ul>
              <li><b>Инвестиции:</b> главный драйвер роста ВВП</li>
              <li><b>Затраты на зарплаты:</b> влияние на уровень жизни и безработицу</li>
              <li><b>Индекс цен (ИПЦ):</b> ценовая политика компаний</li>
            </ul>
          </div>

          <!-- Блок Потребители -->
          <div class="col-md-6 col-12">
            <div class="text-h6 q-mb-sm">👨‍👩‍👧‍👦 Потребители</div>
            <ul>
              <li><b>Протестная активность:</b> рост акций протеста обрушивает экономику</li>
              <li><b>Потребление:</b> внутренний спрос домохозяйств</li>
              <li><b>Сбережения:</b> ресурс для будущих инвестиций</li>
            </ul>
          </div>

          <!-- Блок Правительство -->
          <div class="col-md-6 col-12">
            <div class="text-h6 q-mb-sm">🏛️ Правительство</div>
            <ul>
              <li><b>Налоговая политика:</b> пополнение бюджета и развитие инфраструктуры</li>
              <li><b>Госрасходы:</b> социальная поддержка и влияние на безработицу</li>
              <li><b>Рынок труда:</b> стимулирование участия населения в экономике</li>
            </ul>
          </div>
        </div>

        <div class="text-h5 q-mt-xl q-mb-sm">🎯 Показатели успеха</div>
        <ul>
          <li><b>Рост ВВП:</b> выход из рецессии 1998 года (-5.30%) в зону роста</li>
          <li><b>Стабилизация цен:</b> снижение инфляции с экстремальных 84.44%</li>
          <li><b>Рынок труда:</b> сокращение безработицы ниже уровня 13.26%</li>
          <li><b>Бюджет:</b> управление гигантским дефицитом и сохранение резервов</li>
        </ul>

        <div class="text-h5 q-mt-lg q-mb-sm text-negative">⚠️ Условия поражения</div>
        <ul>
          <li><b>Гиперинфляция:</b> выход инфляции за предел 100%</li>
          <li><b>Финансовый крах:</b> падение Золотовалютных резервов до 0 млн $</li>
          <li><b>Социальный взрыв:</b> критический рост протестной активности</li>
        </ul>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-3 q-pa-md">
        <q-checkbox v-model="dontShowAgain" label="Больше не показывать" />
        <q-btn flat label="Начать спасение экономики" color="primary" @click="startGame" />
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
