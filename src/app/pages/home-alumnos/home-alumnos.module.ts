import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HomeAlumnosPageRoutingModule } from './home-alumnos-routing.module';

import { HomeAlumnosPage } from './home-alumnos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeAlumnosPageRoutingModule
  ],
  declarations: [HomeAlumnosPage],
  providers: [
  ],
})
export class HomeAlumnosPageModule {}
