export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface CvProjectItem {
  id: string;
  projectId?: string; // ref to DB project if linked
  title: string;
  role?: string;
  period?: string;
  tools: string[];
  link?: string;
  bullets: string[];
  selected: boolean;
}

export interface CvSkillGroup {
  id: string;
  categoryName: string; // e.g. "Frontend & Frameworks", "UI/UX & Design Tools"
  skills: string[];
}

export interface CvProfileData {
  id: string;
  profileName: string; // e.g. "UI/UX Designer", "Fullstack Web Developer", "Default"
  targetRole: string; // e.g. "Lead UI/UX Designer & Product Specialist"
  
  // Personal & Contact Info
  fullName: string;
  email: string;
  phone: string;
  location: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  
  // Photo toggle & URL
  showPhoto: boolean;
  photoUrl: string;
  
  // Professional Summary
  summary: string;
  
  // Sections
  experiences: CvExperience[];
  education: CvEducation[];
  projects: CvProjectItem[];
  skillGroups: CvSkillGroup[];
  achievements: string[]; // bullets of achievements/awards
  
  // Formatting Preferences
  fontFamily: "Inter" | "Geist" | "Arial" | "Times New Roman" | "Calibri";
  fontSize: "sm" | "md" | "lg";
  spacingDensity: "compact" | "normal" | "spacious";
  accentColor: string; // Subtle header line or bullet accent (e.g. #09090b, #2563eb, #7c3aed)
  showDividers: boolean;
}
