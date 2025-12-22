import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import router from './router';
import { SafeAnimationController } from './utils/animationUtils';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

// Override Ionic's animation handling with our safe version
const originalPlay = Animation.prototype.play;
Animation.prototype.play = function() {
    return SafeAnimationController.play(this) ? this : null;
};

const originalPause = Animation.prototype.pause;
Animation.prototype.pause = function() {
    return SafeAnimationController.pause(this) ? this : null;
};

const app = createApp(App)
  .use(IonicVue, {
    mode: 'ios',
    animated: true,
    rippleEffect: true
  })
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});