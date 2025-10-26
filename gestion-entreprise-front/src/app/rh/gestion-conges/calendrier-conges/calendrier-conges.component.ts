import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Ajout de DatePipe
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CongeService } from '../../services/conge.service';
import { DemandeConge, StatutConge, CongeFilter } from '../../models/demande-conge.model';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-calendrier-conges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CalendarModule,
    DatePipe // Ajout de DatePipe dans les imports
  ],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
  ],
  templateUrl: './calendrier-conges.component.html',
  styleUrls: ['./calendrier-conges.component.css'] // Changé de .css à .css
})
export class CalendrierCongesComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;
  
  conges: DemandeConge[] = [];
  loading = false;
  
  // Filtres
  filters = {
    departement: '',
    statut: 'approuve' as StatutConge
  };
  
  departements: string[] = [];
  
  constructor(private congeService: CongeService) {}
  
  ngOnInit(): void {
    this.loadConges();
    this.loadDepartements();
  }
  
  loadConges(): void {
    this.loading = true;
    const startDate = startOfDay(subDays(this.viewDate, 30));
    const endDate = endOfDay(addDays(endOfMonth(this.viewDate), 30));
    
    const filter: CongeFilter = {
      dateDebut: startDate.toISOString().split('T')[0],
      dateFin: endDate.toISOString().split('T')[0],
      statut: this.filters.statut
    };
    
    this.congeService.getDemandes(filter).subscribe({
      next: (conges: DemandeConge[]) => {
        this.conges = conges;
        this.updateCalendarEvents();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des congés:', error);
        this.loading = false;
      }
    });
  }
  
  loadDepartements(): void {
    this.departements = ['IT', 'RH', 'Finance', 'Marketing', 'Ventes'];
  }
  
  updateCalendarEvents(): void {
    this.events = this.conges.map(conge => ({
      id: conge.id,
      start: new Date(conge.dateDebut),
      end: new Date(conge.dateFin),
      title: `${conge.employe?.prenom} ${conge.employe?.nom} - ${conge.typeConge}`,
      color: this.getEventColor(conge.statut),
      meta: conge
    }));
    this.refresh.next(null);
  }
  
  getEventColor(statut: StatutConge): any {
    switch (statut) {
      case 'approuve':
        return { primary: '#28a745', secondary: '#d4edda' };
      case 'en_attente':
        return { primary: '#ffc107', secondary: '#fff3cd' };
      case 'refuse':
        return { primary: '#dc3545', secondary: '#f8d7da' };
      default:
        return { primary: '#6c757d', secondary: '#e2e3e5' };
    }
  }
  
  dayClicked(event: any): void {
    const { date, events } = event;
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }
  
  eventClicked(event: CalendarEvent): void {
    const conge = event.meta as DemandeConge;
    if (conge) {
      console.log('Congé sélectionné:', conge);
    }
  }
  
  setView(view: CalendarView): void {
    this.view = view;
  }
  
  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }
  
  onFiltersChange(): void {
    this.loadConges();
  }
  
  exportCalendrier(): void {
    const dataStr = JSON.stringify(this.events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `calendrier-conges-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  getStatistiques(): any {
    const total = this.conges.length;
    const approuves = this.conges.filter(c => c.statut === 'approuve').length;
    const enAttente = this.conges.filter(c => c.statut === 'en_attente').length;
    const refuses = this.conges.filter(c => c.statut === 'refuse').length;
    
    return {
      total,
      approuves,
      enAttente,
      refuses
    };
  }

  // Méthodes de navigation pour le template
  previousPeriod(): void {
    const days = this.view === CalendarView.Month ? 30 : this.view === CalendarView.Week ? 7 : 1;
    this.viewDate = subDays(this.viewDate, days);
    this.loadConges();
  }
  
  nextPeriod(): void {
    const days = this.view === CalendarView.Month ? 30 : this.view === CalendarView.Week ? 7 : 1;
    this.viewDate = addDays(this.viewDate, days);
    this.loadConges();
  }
}
