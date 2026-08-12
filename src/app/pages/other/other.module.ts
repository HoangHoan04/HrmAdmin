import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ServerErrorComponent } from './server-error/server-error.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [ServerErrorComponent, ComingSoonComponent, NotFoundComponent],
  exports: [ServerErrorComponent, ComingSoonComponent, NotFoundComponent],
  imports: [SharedModule],
})
export class OtherModule {}
