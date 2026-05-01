"use client";

import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown } from "lucide-react";

// ── Schema & Types ────────────────────────────────────────────────────────────

const schema = z.object({
  caseNumber: z
    .string()
    .min(1, "Case number is required")
    .regex(/^[A-Za-z0-9\/\-\.]+$/, "Invalid case number format"),
  incidentDate: z
    .string()
    .min(1, "Incident date is required")
    .regex(/^\d{2}\/\d{2}\/\d{2}$/, "Must be mm/dd/yy"),
  investigatingOfficer: z.string().min(1, "Officer name is required"),
  incidentLocation: z.string().min(1, "Location is required"),
  incidentType: z.string().min(1, "Select an incident type"),
  threatLevel: z
    .string()
    .min(1, "Threat level is required")
    .regex(/^\d{2}\/\d{2}\/\d{2}$/, "Must be mm/dd/yy"),
  victimAction: z.string().min(1, "Select a victim action"),
  suspectCondition: z.string().min(1, "Select suspect condition"),
  victimCondition: z.string().min(1, "Select victim condition"),
  context: z.string().min(10, "Context must be at least 10 characters"),
});

export type LegalCaseFormValues = z.infer<typeof schema>;

// ── Options ───────────────────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  "Assault",
  "Robbery",
  "Burglary",
  "Fraud",
  "Homicide",
  "Kidnapping",
  "Drug Offense",
  "Cybercrime",
  "Vandalism",
  "Other",
] as const;

const VICTIM_ACTIONS = [
  "Fled the scene",
  "Resisted",
  "Complied",
  "Called for help",
  "Fought back",
  "Unconscious",
  "Unknown",
] as const;

const SUSPECT_CONDITIONS = [
  "Arrested",
  "At large",
  "Deceased",
  "Injured",
  "Unknown",
] as const;

const VICTIM_CONDITIONS = [
  "Unharmed",
  "Minor injuries",
  "Serious injuries",
  "Critical",
  "Deceased",
  "Unknown",
] as const;

// ── Shared class strings ──────────────────────────────────────────────────────

const inputBase = [
  "w-full h-11 px-3.5",
  "border border-gray-200 rounded-[10px]",
  "text-[13.5px] text-gray-900 bg-white",
  "outline-none transition-all duration-150",
  "placeholder:text-gray-300",
  "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10",
].join(" ");

const inputErrorCls =
  "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-400/10";

// ── Sub-components ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-medium tracking-[0.12em] text-gray-400 whitespace-nowrap font-mono">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

interface FieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FieldWrapper({
  label,
  error,
  children,
  className = "",
}: FieldWrapperProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[13px] font-semibold text-gray-900 tracking-tight">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 font-mono mt-0.5 leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: { message?: string } | boolean;
}

function TextInput({ error, ...props }: TextInputProps) {
  return (
    <input
      className={`${inputBase} ${error ? inputErrorCls : ""}`}
      {...props}
    />
  );
}

interface SelectInputProps {
  name: string;
  placeholder: string;
  options: readonly string[];
  error?: { message?: string };
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

function SelectInput({
  name,
  placeholder,
  options,
  error,
  value,
  onChange,
  onBlur,
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={[
          inputBase,
          "pr-9 cursor-pointer appearance-none",
          value ? "text-gray-900" : "text-gray-300",
          error ? inputErrorCls : "",
        ].join(" ")}
      >
        <option value="" disabled className="text-gray-300">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-gray-900">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
      />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface LegalCaseFormProps {
  onSubmit?: (data: LegalCaseFormValues) => void | Promise<void>;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LegalCaseForm({ onSubmit }: LegalCaseFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LegalCaseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caseNumber: "",
      incidentDate: "",
      investigatingOfficer: "",
      incidentLocation: "",
      incidentType: "",
      threatLevel: "",
      victimAction: "",
      suspectCondition: "",
      victimCondition: "",
      context: "",
    },
  });

  const handleFormSubmit: SubmitHandler<LegalCaseFormValues> = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
      return;
    }
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const { caseId } = await res.json();
    router.push(`/analysis?caseId=${caseId}`);
  };

  return (
    <div className="w-full mx-auto mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        {/* ── METADATA ────────────────────────────────────────── */}
        <SectionHeader title="METADATA" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <FieldWrapper label="Case Number" error={errors.caseNumber?.message}>
            <TextInput
              placeholder="e.g B/123/III/2026/Satreskrim"
              error={errors.caseNumber}
              {...register("caseNumber")}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Incident Date"
            error={errors.incidentDate?.message}
          >
            <TextInput
              placeholder="mm/dd/yy"
              error={errors.incidentDate}
              {...register("incidentDate")}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Investigating officer"
            error={errors.investigatingOfficer?.message}
          >
            <TextInput
              placeholder="Enter officer name"
              error={errors.investigatingOfficer}
              {...register("investigatingOfficer")}
            />
          </FieldWrapper>

          <FieldWrapper
            label="incident Location"
            error={errors.incidentLocation?.message}
          >
            <TextInput
              placeholder="Enter incident location"
              error={errors.incidentLocation}
              {...register("incidentLocation")}
            />
          </FieldWrapper>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* ── CASE DETAILS ────────────────────────────────────── */}
        <SectionHeader title="CASE DETAILS" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
          <FieldWrapper
            label="Select Incident Type"
            error={errors.incidentType?.message}
          >
            <Controller
              name="incidentType"
              control={control}
              render={({ field }) => (
                <SelectInput
                  placeholder="Select one of the options"
                  options={INCIDENT_TYPES}
                  error={errors.incidentType}
                  {...field}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Select Threat Level"
            error={errors.threatLevel?.message}
          >
            <TextInput
              placeholder="mm/dd/yy"
              error={errors.threatLevel}
              {...register("threatLevel")}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Select Victim Action"
            error={errors.victimAction?.message}
          >
            <Controller
              name="victimAction"
              control={control}
              render={({ field }) => (
                <SelectInput
                  placeholder="Select one of the options"
                  options={VICTIM_ACTIONS}
                  error={errors.victimAction}
                  {...field}
                />
              )}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Select Outcome"
            error={
              errors.suspectCondition?.message ||
              errors.victimCondition?.message
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="suspectCondition"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    placeholder="Suspect Condition"
                    options={SUSPECT_CONDITIONS}
                    error={errors.suspectCondition}
                    {...field}
                  />
                )}
              />
              <Controller
                name="victimCondition"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    placeholder="Victim Condition"
                    options={VICTIM_CONDITIONS}
                    error={errors.victimCondition}
                    {...field}
                  />
                )}
              />
            </div>
          </FieldWrapper>
        </div>

        {/* ── CONTEXT ─────────────────────────────────────────── */}
        <FieldWrapper
          label="Context"
          error={errors.context?.message}
          className="mb-6"
        >
          <textarea
            rows={4}
            placeholder="Jl. Sudirman No. 45, RT 02/RW 05, Menteng, Jakarta"
            className={[
              "w-full px-3.5 py-3",
              "border border-gray-200 rounded-[10px]",
              "text-[13.5px] text-gray-900 bg-white",
              "outline-none resize-y transition-all duration-150",
              "placeholder:text-gray-300 leading-relaxed",
              "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10",
              errors.context
                ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-400/10"
                : "",
            ].join(" ")}
            {...register("context")}
          />
        </FieldWrapper>

        {/* ── SUBMIT ──────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "w-full h-[50px] rounded-xl",
            "bg-blue-500 text-white text-[15px] font-semibold",
            "shadow-[0_2px_12px_rgba(59,130,246,0.35)]",
            "transition-all duration-150",
            "hover:bg-blue-600 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(59,130,246,0.45)]",
            "active:bg-blue-700 active:translate-y-0 active:shadow-[0_1px_6px_rgba(59,130,246,0.25)]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0",
          ].join(" ")}
        >
          {isSubmitting ? "Generating…" : "Generate Legal Analysis"}
        </button>
      </form>
    </div>
  );
}
