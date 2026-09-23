import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { CurrencyInput } from '../directives/currency-input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseService } from '../supabase';

interface CommissionPayload {
  name: string;
  email: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: Date;
}

@Component({
  selector: 'app-commissions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    CommonModule,
    MatError,
    MatGridList,
    MatGridTile,
    MatInputModule,
    CurrencyInput,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, provideNativeDateAdapter()],
  templateUrl: './commissions.html',
  styleUrls: ['./commissions.scss'],
})
export class Commissions {
  commissionForm: FormGroup;
  submissionMessage = '';
  readonly minDate: Date = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();
  readonly maxDate: Date = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d;
  })();

  @Output() submitCommission = new EventEmitter<CommissionPayload>();

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
  ) {
    this.commissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      title: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      budget: [null, [Validators.min(0)]],
      deadline: [null],
    });
  }

  async onSubmit() {
    if (this.commissionForm.invalid) {
      this.commissionForm.markAllAsTouched();
      return;
    }

    const value = this.commissionForm.value;
    const payload: CommissionPayload = {
      name: value.name,
      email: value.email,
      title: value.title,
      description: value.description,
      budget: value.budget != null ? Number(value.budget) : undefined,
      deadline: value.deadline,
    };

    await this.handleCommissionOutput(payload);
  }

  /**
   * Handle the outgoing commission payload.
   * - Emits `submitCommission` so a parent can react.
   * - If `window.COMMISSION_ENDPOINT` is defined, attempts to POST the payload as JSON.
   * - Updates `submissionMessage` and resets the form on success.
   */
  async handleCommissionOutput(payload: CommissionPayload) {
    try {
      this.submitCommission.emit(payload);
      // Use SupabaseService to insert; service returns { success, data, error }
      const result = await this.supabase.insertCommissionRequest(payload);
      if (!result || !result.success) {
        console.error('Insert failed', result?.error);
        this.submissionMessage =
          'Submission failed (server). Please try again.';
        return;
      }

      // Default local behavior: show confirmation and reset
      this.reset();
      this.submissionMessage =
        'Thank you for your request! We will contact you about it within 48 hours.';
    } catch (err) {
      // Non-fatal: report to user and keep form data (or clear depending on policy)
      console.error('Failed to send commission payload', err);
      this.submissionMessage =
        'Submission failed (network). Please try again later.';
    }
  }

  reset() {
    this.commissionForm.reset({
      name: '',
      email: '',
      title: '',
      description: '',
      budget: null,
      deadline: null,
    });
    this.commissionForm.markAsPristine();
    this.commissionForm.markAsUntouched();
    this.commissionForm.updateValueAndValidity({ emitEvent: false });
    this.submissionMessage = '';
  }

  checkError(controlName: string, errorName: string): boolean {
    const control = this.commissionForm.get(controlName);
    return (
      control != null &&
      control.hasError(errorName) &&
      (control.dirty || control.touched)
    );
  }
}
