import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ActionLogComponent } from './components/action-log/action-log.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FilterCustomComponent } from './components/filter-custom/filter-custom.component';
import { TableCustomComponent } from './components/table-custom/table-custom.component';

@NgModule({
  declarations: [
    FilterCustomComponent,
    TableCustomComponent,
    ActionLogComponent,
    FileUploadComponent,
  ],
  imports: [
    TranslatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzLayoutModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzMenuModule,
    NzCardModule,
    NzDrawerModule,
    NzSwitchModule,
    NzSelectModule,
    NzSliderModule,
    NzInputModule,
    NzInputNumberModule,
    NzDividerModule,
    NzButtonModule,
    NzTooltipModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzGridModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzSpinModule,
    NzPaginationModule,
    NzTabsModule,
    NzUploadModule,
    NzDescriptionsModule,
    NzTimelineModule,
    NzCheckboxModule,
    NzTagModule,
  ],
  exports: [
    FilterCustomComponent,
    TableCustomComponent,
    ActionLogComponent,
    FileUploadComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    NzLayoutModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzMenuModule,
    NzCardModule,
    NzDrawerModule,
    NzSwitchModule,
    NzSelectModule,
    NzSliderModule,
    NzInputModule,
    NzInputNumberModule,
    NzDividerModule,
    NzButtonModule,
    NzTooltipModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzGridModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzSpinModule,
    NzPaginationModule,
    NzTabsModule,
    NzUploadModule,
    NzDescriptionsModule,
    NzTimelineModule,
    NzCheckboxModule,
    NzTagModule,
  ],
})
export class SharedModule {}
