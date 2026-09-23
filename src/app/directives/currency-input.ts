import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[appCurrencyInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInput),
      multi: true,
    },
  ],
})
export class CurrencyInput implements ControlValueAccessor {
  @Input('appCurrencyInput') currencyCode = 'USD'; // optional: pass currency code like 'USD', 'EUR'

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private focused = false;
  private lastValue: number | null = null;

  constructor(
    private elRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
  ) {}

  // Write value from model -> view
  writeValue(value: any): void {
    this.lastValue = value == null || value === '' ? null : Number(value);
    const display = this.focused
      ? this.rawFor(this.lastValue)
      : this.formatFor(this.lastValue);
    this.setInputValue(display);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elRef.nativeElement, 'disabled', isDisabled);
  }

  // When the host input receives focus, switch to raw numeric value for editing
  @HostListener('focus')
  onFocus(): void {
    this.focused = true;
    this.setInputValue(this.rawFor(this.lastValue));
    // move caret to end
    requestAnimationFrame(() => {
      try {
        const el = this.elRef.nativeElement;
        el.selectionStart = el.selectionEnd = el.value.length;
      } catch (e) {
        // ignore
      }
    });
  }

  // On blur, format the display as currency and mark touched
  @HostListener('blur')
  onBlur(): void {
    this.focused = false;
    this.onTouched();
    this.setInputValue(this.formatFor(this.lastValue));
  }

  // On user input, parse numeric value and propagate model change, but don't format here
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = this.cleanString(input.value);
    const parsed = cleaned === '' || cleaned === '-' ? null : Number(cleaned);
    this.lastValue = parsed == null || isNaN(parsed) ? null : parsed;
    this.onChange(this.lastValue);
  }

  // Helpers
  private setInputValue(value: string): void {
    this.renderer.setProperty(this.elRef.nativeElement, 'value', value);
  }

  // Format a number as currency for display
  private formatFor(value: number | null): string {
    if (value == null || isNaN(value)) return '';
    try {
      // Try narrowSymbol first, fall back to symbol
      const displays: Array<'narrowSymbol' | 'symbol'> = [
        'narrowSymbol',
        'symbol',
      ];
      let formatted: string | null = null;
      for (const disp of displays) {
        try {
          formatted = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: this.currencyCode,
            currencyDisplay: disp as any,
          }).format(value);
          if (formatted) break;
        } catch (inner) {
          // try next
        }
      }

      if (!formatted) {
        // last-resort using default formatting
        formatted = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: this.currencyCode as any,
        }).format(value);
      }

      // Normalize NBSP to space
      formatted = formatted.replace(/\u00A0/g, ' ');

      // Remove any occurrences of the 3-letter currency code (e.g., USD) and patterns like (USD)
      const codeRegex = new RegExp(this.currencyCode, 'ig');
      formatted = formatted.replace(codeRegex, '');
      formatted = formatted.replace(/\(\s*[A-Z]{3}\s*\)/gi, '');

      // Collapse whitespace, remove stray commas/extra spaces at edges
      formatted = formatted.replace(/\s+/g, ' ').trim();
      formatted = formatted.replace(/^[,\s]+|[,\s]+$/g, '');

      return formatted;
    } catch (e) {
      // fallback: simple prefix with two decimals
      return (
        '$' +
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  }

  // Produce a raw numeric string suitable for editing (always show 2 decimals)
  private rawFor(value: number | null): string {
    if (value == null || isNaN(value)) return '';
    // keep exactly two decimal places while editing
    return value.toFixed(2);
  }

  // Clean user-typed string to a parseable numeric string
  private cleanString(value: string): string {
    if (!value) return '';
    // Remove all chars except digits, dot and minus
    // Keep first minus if present and move it to front
    let s = value.replace(/[^0-9.\-]/g, '');
    // If multiple dots, keep first
    const parts = s.split('.');
    if (parts.length > 1) {
      s = parts.shift() + '.' + parts.join('');
    }
    // Handle multiple minus signs
    const minusMatches = s.match(/-/g);
    if (minusMatches && minusMatches.length > 1) {
      s = s.replace(/-/g, '');
      s = '-' + s;
    }
    // Ensure minus is at front
    if (s.indexOf('-') > 0) {
      s = s.replace(/-/g, '');
      s = '-' + s;
    }
    return s;
  }
}
