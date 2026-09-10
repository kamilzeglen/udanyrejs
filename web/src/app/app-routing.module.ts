import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './layout/error/error.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'error', component: ErrorComponent },
      {
        path: '',
        loadChildren: () => import('./layout-user/layout-user.module').then((m) => m.LayoutUserModule),
      },
      {
        path: 'admin',
        loadChildren: () => import('./layout-admin/layout-admin.module').then((m) => m.LayoutAdminModule),
      },
      { path: '**', redirectTo: 'offers' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
