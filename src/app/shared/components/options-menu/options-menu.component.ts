import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss'],
  host: {
    '(document:click)': 'onClickOutside($event)'
  }
})
export class OptionsMenuComponent {
  isOpen = false;
  menuStyles: { [key: string]: string } = {};

  @Input() options: { label: string, value: string }[] = [];
  @Output() optionSelected = new EventEmitter<string>();

  @ViewChild('menuButton') menuButton!: ElementRef;
  @ViewChild('menuList') menuList!: ElementRef;

  constructor(private elementRef: ElementRef) { }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation(); // Evita que el clic se propague
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      const buttonRect = this.menuButton.nativeElement.getBoundingClientRect();

      this.menuStyles = {
        top: `${buttonRect.bottom + window.scrollY}px`,
        left: `${buttonRect.left + window.scrollX}px`
      };
    }
  }

  onSelect(option: { label: string, value: string }) {
    this.optionSelected.emit(option.value);
    this.isOpen = false;
  }

  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

}
