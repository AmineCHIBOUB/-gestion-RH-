import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Calendar imports
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Routing
import { RhRoutingModule } from './rh-routing.module';

// Services RH - Imports corrigés
import { EmployeService } from './services/employe.service';
import { CongeService } from './services/conge.service';
import { PresenceService } from './services/presence.service';
import { PointageService } from './services/pointage.service';
import { RhService } from './services/rh.service';
import { RapportService } from './services/rapport.service';
import { PaieService } from './services/paie.service';
import { RecrutementService } from './services/recrutement.service';
import { DepartementService } from './services/departement.service';
import { PosteService } from './services/poste.service';
import { CandidatureService } from './services/candidature.service';
import { AuthService } from './services/auth.service';
// Ajout du service manquant
import { RapportsService } from './services/rapports.service';

@NgModule({
  declarations: [
    // VIDE - Tous les composants sont standalone
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    RhRoutingModule,
    
    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatStepperModule,
    MatSlideToggleModule,
    
    // Calendar
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    })
  ],
  providers: [
    // Services RH principaux
    EmployeService,
    CongeService,
    PresenceService,
    PointageService,
    RhService,
    RapportService,
    RapportsService, // Ajout du service manquant
    PaieService,
    RecrutementService,
    
    // Services auxiliaires
    DepartementService,
    PosteService,
    CandidatureService,
    AuthService
  ]
})
export class RhModule { }
