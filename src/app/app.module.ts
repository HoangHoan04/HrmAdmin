import { registerLocaleData } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import vi from '@angular/common/locales/vi';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { StaticTranslateService } from './core/services/static-translate.service';
import { AdminLayoutModule } from './layout/admin-layout/admin-layout.module';
import { OtherModule } from './pages/other/other.module';
import { SharedModule } from './shared/shared.module';

registerLocaleData(vi);

const antDesignIcons: IconDefinition[] = Object.values(AllIcons);

function deepMerge(target: any, source: any): any {
  if (!target) return source;
  if (!source) return target;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get<string[]>('/i18n/manifest.json').pipe(
      catchError(() => {
        console.error('Failed to load i18n manifest.json, falling back to empty translation.');
        return of([]);
      }),
      switchMap((files: string[]) => {
        if (!files || files.length === 0) {
          return of({});
        }
        const requests = files.map((file) =>
          this.http.get(`/i18n/${lang}/${file}`).pipe(
            catchError(() => {
              console.warn(`Translation file not found: /i18n/${lang}/${file}`);
              return of({});
            }),
          ),
        );
        return forkJoin(requests).pipe(
          map((responses) => responses.reduce((acc, res) => deepMerge(acc, res), {})),
        );
      }),
    );
  }
}

export function initStaticTranslateFactory(injector: Injector) {
  return () => {
    injector.get(StaticTranslateService);
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, SharedModule, AdminLayoutModule, OtherModule, AppRoutingModule],
  providers: [
    { provide: NZ_I18N, useValue: vi_VN },
    { provide: NZ_ICONS, useValue: antDesignIcons },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    provideTranslateService({
      lang: 'vi',
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new CustomTranslateLoader(http),
        deps: [HttpClient],
      },
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initStaticTranslateFactory,
      deps: [Injector],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
