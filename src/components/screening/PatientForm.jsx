import { Label } from "@/components/ui/label";
import { PATIENT_CATEGORIES, GENDER_OPTIONS } from "@/constants/screening";
import { NEW_SCREENING } from "@/constants/testIds";

const PatientForm = ({ form, onChange, disabled }) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Patient Demographics & Clinical Category
        </h3>
        <p className="text-xs text-muted-foreground">
          Enter patient details to calibrate CAD threshold based on clinical risk profile.
        </p>
      </div>

      <div className="space-y-4">
        {/* Patient Category */}
        <div className="space-y-1.5">
          <Label htmlFor="patient-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Screening Category / Kategori Saringan
          </Label>
          <select
            id="patient-category"
            data-testid={NEW_SCREENING.patientCategorySelect}
            value={form.patient_category}
            onChange={(e) => onChange("patient_category", e.target.value)}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {PATIENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Age Input */}
          <div className="space-y-1.5">
            <Label htmlFor="patient-age" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Age / Umur (Years)
            </Label>
            <input
              id="patient-age"
              type="number"
              min="1"
              max="120"
              placeholder="e.g. 45"
              data-testid={NEW_SCREENING.ageInput}
              value={form.age}
              onChange={(e) => onChange("age", e.target.value)}
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Gender Select */}
          <div className="space-y-1.5">
            <Label htmlFor="patient-gender" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gender / Jantina
            </Label>
            <select
              id="patient-gender"
              data-testid={NEW_SCREENING.genderSelect}
              value={form.gender}
              onChange={(e) => onChange("gender", e.target.value)}
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
