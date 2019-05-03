import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'agenda', loadChildren: './agenda/agenda.module#AgendaPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'syncronization', loadChildren: './syncronization/syncronization.module#SyncronizationPageModule' },
  { path: 'more', loadChildren: './more/more.module#MorePageModule' },
  { path: 'evaluation', loadChildren: './evaluation/evaluation.module#EvaluationPageModule' },
  { path: 'aspiration', loadChildren: './aspiration/aspiration.module#AspirationPageModule' },
  { path: 'aspiration-detail', loadChildren: './aspiration/aspiration-detail.module#AspirationDetailPageModule' },
  { path: 'transfer', loadChildren: './transfer/transfer.module#TransferPageModule' },
  { path: 'diagnostic', loadChildren: './diagnostic/diagnostic.module#DiagnosticPageModule' },
  { path: 'sexage', loadChildren: './sexage/sexage.module#SexagePageModule' },  { path: 'pdf-viewer-aspiration', loadChildren: './pdf-viewer-aspiration/pdf-viewer-aspiration.module#PdfViewerAspirationPageModule' }

  ///{ path: 'signature-draw-pad', loadChildren: './signature-draw-pad/signature-draw-pad.module#SignatureDrawPadPageModule' }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
