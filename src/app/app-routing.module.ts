import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'launchpad',
    pathMatch: 'full'
  },
  {
    path: 'launchpad',
    loadChildren: () => import('./launchpad/launchpad.module').then( m => m.LaunchpadPageModule)
  },
  {
    path: 'dao',
    loadChildren: () => import('./dao/dao.module').then( m => m.DaoPageModule)
  },
  {
    path: 'smart-nodes',
    loadChildren: () => import('./smart-nodes/smart-nodes.module').then( m => m.SmartNodesPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
