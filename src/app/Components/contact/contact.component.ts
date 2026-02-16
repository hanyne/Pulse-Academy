import { Component } from '@angular/core';
import { ContactService } from '../../services/contact.service'
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contact = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private contactService: ContactService, public authService: AuthService) {}

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';
    
    this.contactService.sendMessage(this.contact).subscribe({
      next: (response) => {
        this.successMessage = 'Message envoyé avec succès !';
        this.contact = { name: '', email: '', subject: '', message: '' }; // Réinitialiser le formulaire
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Erreur lors de l\'envoi du message';
        console.error('Erreur:', err);
      }
    });
  }
}