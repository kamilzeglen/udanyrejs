import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () => import('./layout-user/layout-user.module').then(m => m.LayoutUserModule),
      },
      {
        path: 'admin',
        loadChildren: () => import('./layout-admin/layout-admin.module').then(m => m.LayoutAdminModule),
      },
      { path: 'sitemap.xml', redirectTo: '', pathMatch: 'full' },
      { path: 'robots.txt', redirectTo: '', pathMatch: 'full' },
      {path: '**', redirectTo: 'offers'},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
