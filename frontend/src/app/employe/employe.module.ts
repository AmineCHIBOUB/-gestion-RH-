import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

// Routing
import { EmployeRoutingModule } from './employe-routing.module';

// Components - Importer le bon composant (celui qui n'est PAS standalone)
// Supprimer ces imports car les composants sont maintenant standalone :
// import { EmployeDashboardComponent } from './components/employe-dashboard/employe-dashboard.component';
// import { ProfilComponent } from './components/profil/profil.component';
// import { ProfilEditComponent } from './components/profil-edit/profil-edit.component';

// Services
import { EmployeService } from './services/employe.service';
import { CongeEmployeService } from './services/conge-employe.service';
import { BulletinPaieService } from './services/bulletin-paie.service';
import { FeuilleTempsService } from './services/feuille-temps.service';
import { DocumentService } from './services/document.service';
import { AnnonceService } from './services/annonce.service';

@NgModule({
  declarations: [
    // Tous les composants ont été convertis en standalone
    // Ils ne doivent plus être déclarés ici
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EmployeRoutingModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  providers: [
    EmployeService,
    CongeEmployeService,
    BulletinPaieService,
    FeuilleTempsService,
    DocumentService,
    AnnonceService
  ]
})
export class EmployeModule { }
