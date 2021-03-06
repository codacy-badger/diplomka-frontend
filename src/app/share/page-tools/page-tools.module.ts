import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalModule } from '../modal/modal.module';
import { PageToolsComponent } from './page-tools.component';


@NgModule({
  declarations: [
    PageToolsComponent,
  ],
  exports: [
    PageToolsComponent,
  ],
  imports: [
    CommonModule,
    ModalModule
  ]
})
export class AudioPlayerModule {

}
