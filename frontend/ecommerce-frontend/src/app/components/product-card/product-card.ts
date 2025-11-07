import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
})
export class ProductCardComponent {
  @Input() imageSrc = '';           
  @Input() imageAlt = '';           
  @Input() title = '';             
  @Input() description = '';        
  @Input() price: number | string = 0;  
  @Input() currency = 'EUR';        
  @Input() category = '';   

  @Output() cardClick = new EventEmitter<void>();

  onClick() { this.cardClick.emit(); }
  isNumber(v: any): v is number { return typeof v === 'number'; }
}
