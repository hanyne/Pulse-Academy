export interface User {
  _id: string;
  email: string;
  role: 'apprenant' | 'formateur' | 'admin';
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string;
  photo?: string;
  bio?: string;
}