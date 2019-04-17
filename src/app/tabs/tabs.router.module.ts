import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'agenda',
        children: [
          {
            path: '',
            //loadChildren: '../agenda/agenda.module#AgendaPageModule'
            loadChildren: '../syncronization/syncronization.module#SyncronizationPageModule'
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            //loadChildren: '../agenda/agenda.module#AgendaPageModule'
            loadChildren: '../syncronization/syncronization.module#SyncronizationPageModule'
          }
        ]
      },
      {
        path: 'syncronization',
        children: [
          {
            path: '',
            loadChildren: '../syncronization/syncronization.module#SyncronizationPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/syncronization',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/syncronization',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
