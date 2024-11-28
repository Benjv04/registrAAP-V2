import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage-angular';

import { QrScannerService } from './services/qr-scanner.service';

export function initQrScannerService(qrScannerService: QrScannerService) {
  return () => qrScannerService.init();
}

export function qrScannerService() {
  return {
    provide: APP_INITIALIZER,
    useFactory: initQrScannerService,
    deps: [QrScannerService],
    multi: true,
  };
}


@NgModule({
  declarations: [AppComponent],

  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,IonicStorageModule.forRoot()],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },provideHttpClient(),QrScannerService,qrScannerService()],

  bootstrap: [AppComponent],
})
export class AppModule {}


