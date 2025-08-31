import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Commissions } from './commissions/commissions';
import { Gallery } from './gallery/gallery';
import { Store } from './store/store';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home, title: 'Matt K Collectibles' },
  { path: 'commissions', component: Commissions, title: 'Commissions' },
  { path: 'gallery', component: Gallery, title: 'Gallery' },
  { path: 'store', component: Store, title: 'Store' },
];
