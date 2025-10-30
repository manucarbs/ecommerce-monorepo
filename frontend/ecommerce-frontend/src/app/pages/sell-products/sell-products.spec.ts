import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellProducts } from './sell-products';

describe('SellProducts', () => {
  let component: SellProducts;
  let fixture: ComponentFixture<SellProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
