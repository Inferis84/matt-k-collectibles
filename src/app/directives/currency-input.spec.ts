import { CurrencyInput } from './currency-input';

describe('CurrencyInput', () => {
  it('should create an instance', () => {
    const mockEl: any = { nativeElement: { value: '', selectionStart: 0, selectionEnd: 0 } };
    const mockRenderer: any = { setProperty: jasmine.createSpy('setProperty') };
    const directive = new CurrencyInput(mockEl, mockRenderer);
    expect(directive).toBeTruthy();
  });
});
