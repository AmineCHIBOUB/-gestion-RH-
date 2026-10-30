import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DepartmentService } from '../../../services/department.service';
import { Post } from '../../../models/department.model';

// Add this import at the top
import { PostFormComponent } from './post-form/post-form.component';

@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './post-management.component.html',
  styleUrls: ['./post-management.component.css']
})
export class PostManagementComponent implements OnInit {
  posts: Post[] = []; // This is correct
  loading = false;
  selectedDepartment: string = '';
  departments: any[] = [];
  displayedColumns: string[] = ['titre', 'department', 'salaire_range', 'niveau', 'statut', 'actions'];
  
  constructor(
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
        this.snackBar.open('Erreur lors du chargement des départements', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.departmentService.getPosts().subscribe({
      next: (posts: Post[]) => {
        console.log('Posts received:', posts); // Debug log
        this.posts = Array.isArray(posts) ? posts : []; // Ensure it's always an array
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.posts = []; // Ensure it's always an array
        this.snackBar.open('Erreur lors du chargement des postes', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getSalaryRange(post: Post): string {
    if (post.salaire_min && post.salaire_max) {
      return `${post.salaire_min}€ - ${post.salaire_max}€`;
    } else if (post.salaire_min) {
      return `À partir de ${post.salaire_min}€`;
    } else if (post.salaire_max) {
      return `Jusqu'à ${post.salaire_max}€`;
    }
    return 'Non spécifié';
  }

  getDepartmentName(post: Post): string {
    if (post.department) {
      return post.department.name;
    }
    const dept = this.departments.find(d => d.id === post.department_id);
    return dept ? dept.name : 'Département inconnu';
  }

  togglePostStatus(post: Post): void {
    const newStatus = post.statut === 'actif' ? 'inactif' : 'actif';
    this.departmentService.updatePost(post.id, { statut: newStatus }).subscribe({
      next: (updatedPost) => {
        post.statut = updatedPost.statut;
        this.snackBar.open('Statut du poste mis à jour', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating post status:', error);
        this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  editPost(post: Post): void {
    this.snackBar.open('Fonctionnalité en développement', 'Fermer', { duration: 3000 });
  }

  deletePost(post: Post): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) {
      this.departmentService.deletePost(post.id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.snackBar.open('Poste supprimé', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
  
  filterByDepartment(): void {
    this.loadPosts();
  }

  refreshData(): void {
    this.loadPosts();
  }

  // Add this method to the PostManagementComponent class
  openPostForm(post?: Post): void {
    const dialogRef = this.dialog.open(PostFormComponent, {
      width: '600px',
      data: post
    });
  
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadPosts(); // Reload the posts list
      }
    });
  }
}
