import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../../../environments/environment';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalDepartments: number;
  totalRoles: number;
  totalPosts: number;
  activePosts: number;
  inactivePosts: number;
  recentActivities: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatListModule,
    DatePipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {
  private apiUrl = `${environment.apiUrl || 'http://localhost:8000/api'}/admin`;

  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalDepartments: 0,
    totalRoles: 0,
    totalPosts: 0,
    activePosts: 0,
    inactivePosts: 0,
    recentActivities: []
  };

  loading = false;
  // Supprimer la propriété systemHealth
  // systemHealth: SystemHealth = {
  //   cpu: 0,
  //   memory: 0,
  //   storage: 0,
  //   status: 'healthy'
  // };

  quickActions = [
    {
      title: 'Gérer les utilisateurs',
      description: 'Ajouter, modifier ou supprimer des utilisateurs',
      icon: 'people',
      route: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Départements',
      description: 'Organiser la structure de l\'entreprise',
      icon: 'business',
      route: '/admin/departments',
      color: 'warn'
    },
    {
      title: 'Gestion des Postes',
      description: 'Gérer les postes et offres d\'emploi',
      icon: 'work',
      route: '/admin/posts',
      color: 'accent'
    }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    // Supprimer l'appel à loadSystemHealth()
    // this.loadSystemHealth();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data: any) => {
        this.stats = {
          totalUsers: data.total_users || 0,
          activeUsers: data.active_users || 0,
          inactiveUsers: data.inactive_users || 0,
          totalDepartments: data.total_departments || 0,
          totalRoles: data.total_roles || 3, // Fallback to 3
          totalPosts: data.total_posts || 0,
          activePosts: data.active_posts || 0,
          inactivePosts: data.inactive_posts || 0,
          recentActivities: data.recent_activities || []
        };
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading = false;
      }
    });
  }

  // Supprimer la méthode loadSystemHealth()
  // loadSystemHealth(): void {
  //   this.adminService.getSystemHealth().subscribe({
  //     next: (health: any) => {
  //       this.systemHealth = {
  //         cpu: health.cpu || 0,
  //         memory: health.memory || 0,
  //         storage: health.storage || 0,
  //         status: health.status || 'healthy'
  //       };
  //     },
  //     error: (error: any) => {
  //       console.error('Erreur lors du chargement de la santé système:', error);
  //     }
  //   });
  // }

  navigateToAction(route: string): void {
    this.router.navigate([route]);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
