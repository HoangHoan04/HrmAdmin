import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

const getRelativePath = (p: string) => {
  const clean = p.startsWith('/') ? p.substring(1) : p;
  const prefix = 'payroll/';
  return clean.startsWith(prefix) ? clean.substring(prefix.length) : clean;
};

const routes: Routes = [];

@NgModule({
  declarations: [],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PayrollModule {}
