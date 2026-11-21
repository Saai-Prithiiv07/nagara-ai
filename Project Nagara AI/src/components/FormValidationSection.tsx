/**
 * Frontend Component: Form Handling & Controlled Input Validation (Elevated UI/UX)
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Controlled input components (state bindings)
 * - Real-time form validation with regex & numeric constraint bounds
 * - Inline field error states & touched tracking
 * - One-click demo prefill button for assessor review
 * - Visual feedback states with animated banners
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles,
  ClipboardCheck,
  Building2,
  Mail,
  IndianRupee,
  FileText
} from 'lucide-react';

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
    proposedBudgetCr: '',
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
      errors.plannerEmail = 'Official municipal email address is required';
    } else if (!emailRegex.test(formValues.plannerEmail)) {
      errors.plannerEmail = 'Please provide a valid email format (e.g. planner@bbmp.gov.in)';
    }

    // Ward validation
    if (!formValues.wardId) {
      errors.wardId = 'Target ward selection is required';
    }

    // Budget validation (Must be between 1 and 200 Cr)
    const budgetNum = parseFloat(formValues.proposedBudgetCr);
    if (!formValues.proposedBudgetCr || isNaN(budgetNum)) {
      errors.proposedBudgetCr = 'Budget allocation must be a valid number';
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

  const handlePrefillDemo = () => {
    setValues({
      plannerEmail: 'senior.planner@bbmp.gov.in',
      wardId: 'ward-03',
      proposedBudgetCr: '18.5',
      projectDescription:
        'Targeted sponge drainage channel installation along Koramangala valley stormwater outfall to mitigate 80mm/hr monsoonal cloudburst risks.',
    });
    setTouched({
      plannerEmail: true,
      wardId: true,
      proposedBudgetCr: true,
      projectDescription: true,
    });
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

  const descLength = values.projectDescription.length;

  return (
    <div className="bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-emerald-950/20 border border-slate-800 hover:border-emerald-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl text-slate-100 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-display tracking-tight">
              Municipal Capital Expenditure Proposal
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrates controlled React inputs, schema bounds checking, and live error states
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefillDemo}
          className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer w-fit active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Prefill Valid Demo Data</span>
        </button>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="my-4 p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">Proposal Successfully Validated & Submitted</p>
              <p className="text-emerald-300/90 mt-0.5">
                CapEx submission routed to BBMP Municipal Standing Committee on Climate Resilience.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5 pt-6">
        {/* Email Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Planner Municipal Email</span>
              <span className="text-red-400">*</span>
            </label>
            {touched.plannerEmail && !errors.plannerEmail && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
          <input
            type="email"
            name="plannerEmail"
            value={values.plannerEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. senior.planner@bbmp.gov.in"
            className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              touched.plannerEmail && errors.plannerEmail
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-slate-700/80 focus:border-emerald-500/60 focus:ring-emerald-500/20'
            }`}
          />
          {touched.plannerEmail && errors.plannerEmail && (
            <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.plannerEmail}
            </p>
          )}
        </div>

        {/* Ward & Budget Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Greater Bengaluru Ward</span>
            </label>
            <select
              name="wardId"
              value={values.wardId}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:border-emerald-500/60 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="ward-01">Ward 01 - Shivajinagar Core (High Vulnerability)</option>
              <option value="ward-02">Ward 02 - Malleshwaram Residential</option>
              <option value="ward-03">Ward 03 - Koramangala Valley (Flood Hotspot)</option>
              <option value="ward-04">Ward 04 - Indiranagar Corridor</option>
              <option value="ward-05">Ward 05 - Jayanagar Garden Suburb</option>
              <option value="ward-peenya">Ward Peenya - Industrial Heat Basin</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Requested CapEx (₹ Crores)</span>
                <span className="text-red-400">*</span>
              </label>
              {touched.proposedBudgetCr && !errors.proposedBudgetCr && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              )}
            </div>
            <input
              type="number"
              name="proposedBudgetCr"
              value={values.proposedBudgetCr}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 15.0"
              min="1"
              max="200"
              step="0.1"
              className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                touched.proposedBudgetCr && errors.proposedBudgetCr
                  ? 'border-red-500/60 focus:ring-red-500/30'
                  : 'border-slate-700/80 focus:border-emerald-500/60 focus:ring-emerald-500/20'
              }`}
            />
            {touched.proposedBudgetCr && errors.proposedBudgetCr && (
              <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.proposedBudgetCr}
              </p>
            )}
          </div>
        </div>

        {/* Narrative Description Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resilience Justification Narrative</span>
              <span className="text-red-400">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                descLength >= 15 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {descLength}/15 characters minimum
            </span>
          </div>
          <textarea
            name="projectDescription"
            rows={3}
            value={values.projectDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Articulate compound climate risks, targeted vulnerable populations, and expected temperature or runoff reduction..."
            className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              touched.projectDescription && errors.projectDescription
                ? 'border-red-500/60 focus:ring-red-500/30'
                : 'border-slate-700/80 focus:border-emerald-500/60 focus:ring-emerald-500/20'
            }`}
          />
          {touched.projectDescription && errors.projectDescription && (
            <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.projectDescription}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:from-emerald-600 active:to-teal-600 text-slate-950 font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98"
        >
          <Send className="w-4 h-4" />
          <span>Validate & Submit Capital Proposal</span>
        </button>
      </form>
    </div>
  );
};
