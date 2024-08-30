import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'time',
        loadComponent: () =>
          import('../time/time.page').then((m) => m.TimePage),
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('../analysis/analysis.page').then((m) => m.AnalysisPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/time',
    pathMatch: 'full',
  },
];
