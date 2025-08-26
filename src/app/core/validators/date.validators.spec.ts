import { FormControl, AbstractControl } from '@angular/forms';
import { dateReleaseValidator, dateRevisionValidator } from './date.validators';

describe('Validators', () => {

  let control: FormControl;

  describe('dateReleaseValidator', () => {
    let validator: (control: AbstractControl) => { [key: string]: any } | null;

    beforeEach(() => {
      validator = dateReleaseValidator();
    });

    it('should return null for a valid date (today)', () => {
      const today = new Date().toISOString().substring(0, 10);
      control = new FormControl(today);
      expect(validator(control)).toBeNull();
    });

    it('should return null for a valid date (future)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      control = new FormControl(futureDate.toISOString().substring(0, 10));
      expect(validator(control)).toBeNull();
    });

    it('should return { dateRelease: true } for an invalid date (past)', () => {
      const today = new Date();
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;
      control = new FormControl(yesterdayString);
      expect(validator(control)).toEqual({ dateRelease: true });
    });

    it('should return null if the control value is null', () => {
      control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });

    it('should return null if the control value is an empty string', () => {
      control = new FormControl('');
      expect(validator(control)).toBeNull();
    });
  });

  describe('dateRevisionValidator', () => {
    let validator: (control: AbstractControl) => { [key: string]: any } | null;

    it('should return null if revisionDate is exactly one year after releaseDate', () => {
      const releaseDate = '2025-01-01';
      validator = dateRevisionValidator(() => releaseDate);
      control = new FormControl('2026-01-01');
      expect(validator(control)).toBeNull();
    });

    it('should return { dateRevision: true } if revisionDate is not one year after releaseDate', () => {
      const releaseDate = '2025-01-01';
      validator = dateRevisionValidator(() => releaseDate);
      control = new FormControl('2026-01-02');
      expect(validator(control)).toEqual({ dateRevision: true });
    });

    it('should return null if the releaseDate is null', () => {
      validator = dateRevisionValidator(() => null);
      control = new FormControl('2026-01-01');
      expect(validator(control)).toBeNull();
    });
  });

});
