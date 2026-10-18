export const NEW_SCREENING = {
  page: "new-screening-page",
  analyzeButton: "analyze-button",
  resetButton: "reset-button",
  errorAlert: "error-alert",
  loadingIndicator: "analyzing-indicator",
  progressBar: "analyzing-progress-bar",
  patientCategorySelect: "patient-category-select",
  ageInput: "age-input",
  genderSelect: "gender-select",
  uploadArea: "xray-upload-area",
  fileInput: "xray-file-input",
  removeImageButton: "remove-image-button",
  sampleScenarioButton: "sample-scenario-button",
};

export const RESULT_PANEL = {
  container: "result-panel",
  tbScore: "result-tb-score",
  severityBadge: "result-severity-badge",
  viewInHistoryLink: "view-in-history-link",
  findingsTab: "findings-tab",
  recommendationsTab: "recommendations-tab",
  pathologyChart: "pathology-chart",
  invalidBanner: "invalid-image-banner",
};

export const DETAIL = {
  page: "screening-detail-page",
  backLink: "back-to-history-link",
  notFound: "screening-not-found",
  downloadPdfButton: "download-pdf-button",
  deleteButton: "delete-screening-button",
  deleteCancelButton: "delete-cancel-button",
  deleteConfirmButton: "delete-confirm-button",
};

export const HISTORY = {
  page: "history-page",
  table: "history-table",
  loadingState: "history-loading",
  emptyState: "history-empty",
  row: (id) => `history-row-${id}`,
  scoreCircle: (id) => `history-score-${id}`,
};

export const SETTINGS = {
  page: "settings-page",
  demoModeToggle: "demo-mode-toggle",
  demoModeBadge: "demo-mode-badge",
};
