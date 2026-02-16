export interface Enrollment {
  _id: string;
  user: any;
  course: any;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  enrollmentDate: string;
  status: 'en attente' | 'confirme' | 'paye' | 'refuse';
}