"use client";

import { useActionState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";

import type { BookingFormState } from "@/app/catalog/actions";

type BookingFormProps = {
  action: (
    state: BookingFormState,
    formData: FormData,
  ) => Promise<BookingFormState>;
  dailyPrice: number;
};

const initialState: BookingFormState = {};

export function BookingForm({ action, dailyPrice }: BookingFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <>
      <div className="booking-panel-heading">
        <CalendarDays size={18} />
        <span>
          <strong>Plan your rental</strong>
          <small>Choose your pickup and return</small>
        </span>
      </div>

      <form action={formAction} className="booking-form">
        <label className="field-label">
          Pickup date and time
          <input type="datetime-local" name="startAt" required />
        </label>

        <label className="field-label">
          Return date and time
          <input type="datetime-local" name="returnAt" required />
        </label>

        <label className="field-label">
          Project note <span className="optional-label">Optional</span>
          <textarea
            name="projectNote"
            placeholder="What are you working on?"
            rows={3}
            maxLength={1000}
          />
        </label>

        <div className="price-summary">
          <span>
            Daily rental rate
            <small>Final estimate is based on full rental days</small>
          </span>
          <strong>${dailyPrice.toFixed(2)}</strong>
        </div>

        {state.message && (
          <p className="auth-message" role="alert">
            {state.message}
          </p>
        )}

        <button className="booking-submit" type="submit" disabled={pending}>
          {pending ? "Submitting request..." : "Request this equipment"}
          {!pending && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="booking-footnote">
        Requests are reviewed by the campus gear desk. No payment is collected here.
      </p>
    </>
  );
}