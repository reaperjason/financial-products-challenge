import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateReleaseValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectedDateString = control.value;
    if (!selectedDateString) return null;
    const [year, month, day] = selectedDateString.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    const normalizedSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return normalizedSelectedDate >= normalizedToday ? null : { dateRelease: true };
  };
}

export function dateRevisionValidator(getReleaseDate: () => string | null): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const releaseDate = getReleaseDate();
    if (!releaseDate) return null;
    const revisionDate = new Date(releaseDate);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    return control.value === revisionDate.toISOString().substring(0, 10) ? null : { dateRevision: true };
  };
}
