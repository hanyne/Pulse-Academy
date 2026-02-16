import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByRole'
})
export class FilterByRolePipe implements PipeTransform {
  transform(users: any[], role: string): any[] {
    return users.filter(user => user.role === role);
  }
}