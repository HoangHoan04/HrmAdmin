import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { getRouteByPath } from 'src/app/core/constants/common';

interface BreadcrumbItem {
  label: string;
  url: string;
  isLast: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private sub = new Subscription();

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.buildBreadcrumbs(this.router.url);

    this.sub.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.buildBreadcrumbs((event as NavigationEnd).urlAfterRedirects);
        }),
    );

    this.sub.add(
      this.translate.onLangChange.subscribe(() => {
        this.buildBreadcrumbs(this.router.url);
      }),
    );

    this.sub.add(
      this.translate.onTranslationChange.subscribe(() => {
        this.buildBreadcrumbs(this.router.url);
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private buildBreadcrumbs(url: string): void {
    const list: BreadcrumbItem[] = [];

    const homeRoute = getRouteByPath('/');
    list.push({
      label: homeRoute
        ? this.translate.instant(homeRoute.translationKey)
        : this.translate.instant('routes.home'),
      url: '/',
      isLast: url === '/',
    });

    const segments = url.split('/').filter(Boolean);
    let currentUrl = '';

    segments.forEach((segment, idx) => {
      currentUrl += `/${segment}`;
      if (currentUrl === '/') return;

      const route = getRouteByPath(currentUrl);
      if (route) {
        list.push({
          label: this.translate.instant(route.translationKey),
          url: route.path,
          isLast: idx === segments.length - 1,
        });
      }
    });

    this.breadcrumbs = list;
  }
}
