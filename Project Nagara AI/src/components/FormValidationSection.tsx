/**
 * Frontend Component: Form Handling & Controlled Input Validation
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Controlled input components (value + onChange)
 * - Real-time form validation with custom regex rules & constraints
 * - Inline field error states & touched tracking
 * - Safe submission handling
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

export interface ProposalFormValues {
  plannerEmail: string;
  wardId: string;
  proposedBudgetCr: string;
  projectDescription: string;
}

export interface ProposalFormErrors {
  plannerEmail?: string;
  wardId?: string;
  proposedBudgetCr?: string;
  projectDescription?: string;
}

export const FormValidationSection: React.FC = () => {
  const [values, setValues] = useState<ProposalFormValues>({
    plannerEmail: '',
    wardId: 'ward-01',
    proposedBudgetCr: '10',
    projectDescription: '',
  });

  const [touched, setTouched] = useState<Record<keyof ProposalFormValues, boolean>>({
    plannerEmail: false,
    wardId: false,
    proposedBudgetCr: false,
    projectDescription: false,
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  // Form Validation Logic
  const validate = (formValues: ProposalFormValues): ProposalFormErrors => {
    const errors: ProposalFormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formValues.plannerEmail) {
      errors.plannerEmail = 'Official planner email is required';
    } else if (!emailRegex.test(formValues.plannerEmail)) {
      errors.plannerEmail = 'Please provide a valid municipal email address (e.g. planner@bbmp.gov.in)';
    }

    // Ward validation
    if (!formValues.wardId) {
      errors.wardId = 'Target ward selection is required';
    }

    // Budget validation (Must be between 1 and 200 Cr)
    const budgetNum = parseFloat(formValues.proposedBudgetCr);
    if (isNaN(budgetNum)) {
      errors.proposedBudgetCr = 'Budget allocation must be a numeric value';
    } else if (budgetNum < 1 || budgetNum > 200) {
      errors.proposedBudgetCr = 'Budget CapEx must be between ₹1 Cr and ₹200 Cr';
    }

    // Description validation
    if (!formValues.projectDescription || formValues.projectDescription.trim().length < 15) {
      errors.projectDescription = 'Justification narrative must be at least 15 characters';
    }

    return errors;
  };

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      plannerEmail: true,
      wardId: true,
      proposedBudgetCr: true,
      projectDescription: true,
    });

    if (isValid) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Municipal CapEx Proposal Submission</h3>
          <p className="text-xs text-slate-400">Strict Client-Side Controlled Input Validation</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Form Validation Engine
        </span>
      </div>

      {submitted && (
        <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Proposal successfully validated and submitted to BBMP Municipal Review Board.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Planner Email Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Planner Official Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="plannerEmail"
            value={values.plannerEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. planner@bbmp.gov.in"
            className={`w-full px-3 py-2 bg-slate-800/80 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              touched.plannerEmail && errors.plannerEmail
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-slate-700 focus:ring-emerald-500/30'
            }`}
          />
          {touched.plannerEmail && errors.plannerEmail && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.plannerEmail}
            </p>
          )}
        </div>

        {/* Target Ward & Budget Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Ward</label>
            <select
              name="wardId"
              value={values.wardId}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ward-01">Ward 01 - Shivajinagar</option>
              <option value="ward-02">Ward 02 - Malleshwaram</option>
              <option value="ward-03">Ward 03 - Koramangala</option>
              <option value="ward-04">Ward 04 - Indiranagar</option>
              <option value="ward-05">Ward 05 - Jayanagar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Proposed Budget (₹ Cr) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="proposedBudgetCr"
              value={values.proposedBudgetCr}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              max="200"
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-lg text-sm text-white focus:outline-none focus:ring-2 ${
                touched.proposedBudgetCr && errors.proposedBudgetCr
                  ? 'border-red-500/60 focus:ring-red-500/30'
                  : 'border-slate-700 focus:ring-emerald-500/30'
              }`}
            />
            {touched.proposedBudgetCr && errors.proposedBudgetCr && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.proposedBudgetCr}
              </p>
            )}
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Resilience Justification Narrative <span className="text-red-400">*</span>
          </label>
          <textarea
            name="projectDescription"
            rows={3}
            value={values.projectDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Describe ecological impact, targeted micro-climate hazards, and equity considerations..."
            className={`w-full px-3 py-2 bg-slate-800/80 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              touched.projectDescription && errors.projectDescription
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-slate-700 focus:ring-emerald-500/30'
            }`}
          />
          {touched.projectDescription && errors.projectDescription && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.projectDescription}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-medium rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
          Validate & Submit Proposal
        </button>
      </form>
    </div>
  );
};
