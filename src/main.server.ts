import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app.config.server';

//export default bootstrapApplication(AppComponent, config);
// export default function bootstrap() {
//   return bootstrapApplication(AppComponent, config);
// }

// export default function bootstrap(context: any) {
//   return bootstrapApplication(AppComponent, config, context);
// }

export default function bootstrap(context?: any) {
  return bootstrapApplication(AppComponent, config, context);
}
