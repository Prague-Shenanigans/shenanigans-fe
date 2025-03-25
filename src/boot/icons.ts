import { boot } from 'quasar/wrappers';
import { getIconComponent } from 'src/utils/services/icons';

export default boot(({ app }) => {
  // Make the getIconComponent function globally accessible
  app.config.globalProperties.$getIconComponent = getIconComponent;
});
