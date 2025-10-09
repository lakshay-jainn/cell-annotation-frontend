// Application constants
export const USER_ROLES = {
  UPLOADER: "UPLOADER",
  ANNONATOR: "ANNONATOR",
  ADMIN: "ADMIN",
};

export const USER_TYPES = {
  PULMONOLOGIST: "pulmonologist",
  PATHOLOGIST: "pathologist",
  ADMIN: "admin",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PULMONOLOGIST: "/pulmonologist",
  PATHOLOGIST: "/pathologist",
  ADMIN: "/admin",
  SAMPLE: "/sample",
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",
};

export const API_ENDPOINTS = {
  UPLOAD_IMAGE: "/upload_img",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
};

export const CELL_TYPES = [
  "WBC - Lymphocyte",
  "WBC - Others",
  "RBC",
  "Bronchoepithelial cell",
  "Atypical cell",
  "Granuloma",
  "Artifacts",
  "Others",
];

export const MICROSCOPES = [
  "Olympus BX43",
  "Olympus BX53",
  "Olympus CX33",
  "Nikon Eclipse E100",
  "Nikon Eclipse E200",
  "Zeiss Axio Lab.A1",
  "Zeiss Primo Star",
  "Other",
];

export const CAMERAS = [
  "Olympus DP21",
  "Olympus DP26",
  "Olympus DP27",
  "Nikon DS-Fi3",
  "Nikon DS-Ri2",
  "Zeiss Axiocam 105",
  "Zeiss Axiocam 208",
  "Other",
];

export const MAGNIFICATIONS = ["10X", "40X", "100X"];

export const STAINS = ["Toluidine Blue", "H&E", "Dif quick"];

export const NEEDLE_SIZES = ["19G", "21G", "22G", "25G"];

export const SAMPLE_TYPES = ["Lymphnode TBNA", "Lymphnode cryo biopsy"];

export const LYMPH_NODE_STATIONS = [
  "2R",
  "2L",
  "4R",
  "4L",
  "7",
  "10R",
  "10L",
  "11R",
  "11L",
];

export const MICROSCOPE_MANUFACTURERS = [
  "Olympus",
  "Nikon",
  "Zeiss",
  "Leica",
  "Others",
];

export const CAMERA_MANUFACTURERS = [
  "Canon",
  "Nikon",
  "Sony",
  "Olympus",
  "Others",
];
