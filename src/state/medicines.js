// Presets for what can live in a case. `limit` is the alert threshold in °F
// taken from the storage guidance on each product's label.
export const MEDICINES = {
  epipen: { label: 'EpiPen', icon: 'pen', limit: 86, schedule: [] },
  insulin: { label: 'Insulin', icon: 'syringe', limit: 86, schedule: ['8:00 AM', '6:30 PM'] },
  inhaler: { label: 'Inhaler', icon: 'inhaler', limit: 77, schedule: ['7:30 AM', '9:00 PM'] },
}

export const MEDICINE_ORDER = ['epipen', 'insulin', 'inhaler']
