import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-gestionmessages',
  templateUrl: './gestionmessages.component.html',
  styleUrls: ['./gestionmessages.component.css']
})
export class GestionmessagesComponent {
  messages: any[] = [];
  filteredMessages: any[] = [];
  searchQuery: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  editForm: FormGroup;
  selectedMessage: any = null;

  constructor(
    private contactService: ContactService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.contactService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.filteredMessages = messages; // Initialiser la liste filtrée
      },
      error: (err) => {
        this.errorMessage = `Erreur lors de la récupération des messages: ${err.status} - ${err.statusText || 'Erreur inconnue'}`;
        console.error('Erreur complète:', err);
      }
    });
  }

  filterMessages(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredMessages = this.messages.filter(message =>
      message.name.toLowerCase().includes(query) ||
      message.email.toLowerCase().includes(query) ||
      message.subject.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query)
    );
  }

  editMessage(message: any): void {
    this.selectedMessage = message;
    this.editForm.patchValue({
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message
    });
  }

  updateMessage(): void {
    if (this.editForm.invalid || !this.selectedMessage) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const updatedMessage = this.editForm.value;
    this.contactService.updateMessage(this.selectedMessage._id, updatedMessage).subscribe({
      next: (response) => {
        this.successMessage = 'Message mis à jour avec succès !';
        this.errorMessage = '';
        this.selectedMessage = null;
        this.editForm.reset();
        this.loadMessages();
      },
      error: (err) => {
        this.errorMessage = `Erreur lors de la mise à jour du message: ${err.status} - ${err.statusText || 'Erreur inconnue'}`;
        console.error('Erreur complète:', err);
      }
    });
  }

  deleteMessage(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      this.contactService.deleteMessage(id).subscribe({
        next: () => {
          this.successMessage = 'Message supprimé avec succès !';
          this.errorMessage = '';
          this.loadMessages();
        },
        error: (err) => {
          this.errorMessage = `Erreur lors de la suppression du message: ${err.status} - ${err.statusText || 'Erreur inconnue'}`;
          console.error('Erreur complète:', err);
        }
      });
    }
  }

  cancelEdit(): void {
    this.selectedMessage = null;
    this.editForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }
}