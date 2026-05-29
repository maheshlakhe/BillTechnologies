export interface IndustryPOSWidgetProps {
  // Global / General States
  activeIndustrySlug: string;
  selectedWarehouse: string;
  setSelectedWarehouse: (val: string) => void;
  selectedBatch: string;
  setSelectedBatch: (val: string) => void;

  // Electronics
  imeiInput: string;
  setImeiInput: (val: string) => void;
  serialInput: string;
  setSerialInput: (val: string) => void;
  warrantyPeriod: string;
  setWarrantyPeriod: (val: string) => void;
  technicianAssigned: string;
  setTechnicianAssigned: (val: string) => void;

  // Textile/Clothing (Apparel)
  selectedSize: string;
  setSelectedSize: (val: string) => void;
  selectedColor: string;
  setSelectedColor: (val: string) => void;
  trialRoomStatus: string;
  setTrialRoomStatus: (val: string) => void;

  // Grocery
  simulatedWeight: number;
  readSimulatedWeight: () => void;
  barcodeMode: boolean;
  setBarcodeMode: (val: boolean) => void;

  // Pharmacy
  doctorName: string;
  setDoctorName: (val: string) => void;
  doctorLicense: string;
  setDoctorLicense: (val: string) => void;
  prescriptionVerified: boolean;
  setPrescriptionVerified: (val: boolean) => void;

  // Restaurant
  selectedTable: string;
  setSelectedTable: (val: string) => void;
  cookingInstructions: string;
  setCookingInstructions: (val: string) => void;
  selectedWaiter: string;
  setSelectedWaiter: (val: string) => void;

  // Jewellery
  goldWeightGrams: number;
  setGoldWeightGrams: (val: number) => void;
  goldPurityKarat: number;
  setGoldPurityKarat: (val: number) => void;
  makingChargesPercent: number;
  setMakingChargesPercent: (val: number) => void;
  liveGoldRate: number;
  syncLiveGoldRate: () => void;

  // Automobile
  chassisNumber: string;
  setChassisNumber: (val: string) => void;
  serviceAdvisor: string;
  setServiceAdvisor: (val: string) => void;

  // Education
  studentIdInput: string;
  setStudentIdInput: (val: string) => void;
  educationBatch: string;
  setEducationBatch: (val: string) => void;

  // SaaS / Digital
  digitalLicenseKey: string;
  setDigitalLicenseKey: (val: string) => void;

  // Gym / Fitness
  simulatedBMI: string;
  setSimulatedBMI: (val: string) => void;
  fitnessPlanType: string;
  setFitnessPlanType: (val: string) => void;

  // General helpers
  showSuccess: (msg: string) => void;
  showWarning: (msg: string) => void;
  showError: (msg: string) => void;
  formatCurrency: (val: number) => string;
}
