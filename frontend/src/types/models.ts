export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface Sport {
  id: string;
  name: string;
  gender: string;
  category: string;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { teams: number; matches: number };
}

export interface Team {
  id: string;
  name: string;
  shortName: string | null;
  sportId: string;
  seasonId: string | null;
  gender: string;
  logoUrl: string | null;
  homeVenue: string | null;
  foundingYear: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sport?: Sport;
  season?: { id: string; name: string };
  _count?: { squadEntries: number; homeMatches: number; awayMatches: number };
}

export interface Athlete {
  id: string;
  userId: string | null;
  fullName: string;
  registrationNumber: string;
  gender: string;
  dateOfBirth: string | null;
  email: string | null;
  phoneNumber: string | null;
  yearOfStudy: number | null;
  programme: string | null;
  faculty: string | null;
  athleteType: string;
  status: string;
  profilePhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  affiliations?: SportAffiliation[];
  academicRecords?: AcademicRecord[];
  scholarships?: Scholarship[];
  contracts?: AthleteContract[];
}

export interface SportAffiliation {
  id: string;
  athleteId: string;
  sportId: string;
  teamId: string | null;
  position: string | null;
  jerseyNumber: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  joinedDate: string | null;
  status: string;
  sport?: Sport;
  team?: Team;
}

export interface AcademicRecord {
  id: string;
  athleteId: string;
  academicYear: string;
  semester: string;
  yearOfStudy: number | null;
  gpa: number | null;
  cgpa: number | null;
  totalCreditUnitsTaken: number | null;
  totalCreditUnitsPassed: number | null;
  failedUnits: number;
  attendancePercentage: number | null;
  academicStanding: string;
  notes: string | null;
  createdAt: string;
  athlete?: Athlete;
  courseResults?: AcademicCourseResult[];
}

export interface AcademicCourseResult {
  id: string;
  academicRecordId: string;
  courseCode: string;
  courseName: string;
  creditUnits: number;
  marks: number | null;
  grade: string | null;
  result: string;
  retake: boolean;
}

export interface Scholarship {
  id: string;
  athleteId: string;
  scholarshipType: string;
  sponsorName: string | null;
  coverageDescription: string | null;
  coveragePercentage: number | null;
  startDate: string;
  endDate: string;
  renewable: boolean;
  renewalCount: number;
  status: string;
  academicRequirementGpa: number | null;
  sportsRequirement: string | null;
  notes: string | null;
  createdAt: string;
  athlete?: Athlete;
  renewals?: ScholarshipRenewal[];
}

export interface ScholarshipRenewal {
  id: string;
  scholarshipId: string;
  previousEndDate: string;
  newEndDate: string;
  renewedAt: string;
  gpaAtRenewal: number | null;
  notes: string | null;
  renewalNumber: number;
}

export interface AthleteContract {
  id: string;
  athleteId: string;
  contractType: string;
  startDate: string;
  endDate: string;
  termsSummary: string | null;
  hasAccompanyingScholarship: boolean;
  scholarshipId: string | null;
  signedByAthlete: boolean;
  signedAt: string | null;
  status: string;
  terminationDate: string | null;
  terminationReason: string | null;
  notes: string | null;
  createdAt: string;
  athlete?: Athlete;
}

export interface Prospect {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  gender: string;
  dateOfBirth: string | null;
  schoolOrInstitution: string | null;
  programmeApplied: string | null;
  sportId: string;
  position: string | null;
  previousLevel: string | null;
  previousClubs: string | null;
  previousAchievements: string | null;
  referredBy: string | null;
  source: string;
  status: string;
  notes: string | null;
  createdAt: string;
  sport?: Sport;
}

export interface Trial {
  id: string;
  sportId: string;
  teamId: string | null;
  trialDate: string;
  startTime: string | null;
  venue: string | null;
  conductedBy: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  sport?: Sport;
  team?: Team;
  participants?: TrialParticipant[];
  assessments?: TrialAssessment[];
}

export interface TrialParticipant {
  id: string;
  trialId: string;
  prospectId: string;
  attended: boolean;
  prospect?: Prospect;
}

export interface TrialAssessment {
  id: string;
  trialId: string;
  prospectId: string;
  scoreTechnical: number | null;
  scorePhysical: number | null;
  scoreSpeed: number | null;
  scoreTactical: number | null;
  scoreTeamwork: number | null;
  scoreDiscipline: number | null;
  scoreAcademic: number | null;
  overallScore: number | null;
  recommendedPosition: string | null;
  recommendation: string;
  selectionOutcome: string;
  coachNotes: string | null;
  prospect?: Prospect;
}

export interface Event {
  id: string;
  name: string;
  type: string;
  level: string;
  sportId: string | null;
  seasonId: string | null;
  organizer: string | null;
  hostInstitution: string | null;
  venue: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  status: string;
  format: string;
  maxTeams: number | null;
  maxParticipants: number | null;
  registrationDeadline: string | null;
  createdAt: string;
  sport?: Sport;
  _count?: { participants: number; matches: number };
}

export interface Match {
  id: string;
  eventId: string;
  sportId: string;
  seasonId: string | null;
  matchNumber: number | null;
  round: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  venue: string | null;
  scheduledDate: string;
  scheduledTime: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  matchType: string;
  notes: string | null;
  createdAt: string;
  sport?: Sport;
  event?: { id: string; name: string };
  homeTeam?: Team;
  awayTeam?: Team;
  results?: MatchResult;
}

export interface MatchResult {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  winnerTeamId: string | null;
  resultType: string;
  homePenalties: number | null;
  awayPenalties: number | null;
  walkover: boolean;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number | null;
  ownerType: string;
  athleteId: string | null;
  teamId: string | null;
  eventId: string | null;
  matchId: string | null;
  trialId: string | null;
  expiryDate: string | null;
  status: string;
  isVerified: boolean;
  verifiedAt: string | null;
  uploadedBy: string;
  uploadedAt: string;
  notes: string | null;
  createdAt: string;
  athlete?: Athlete;
  team?: Team;
}

export interface Notification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  recipientUserId: string;
  relatedAthleteId: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  assetNumber: string | null;
  serialNumber: string | null;
  quantity: number;
  condition: string;
  status: string;
  sportId: string | null;
  storageLocation: string | null;
  purchasedDate: string | null;
  purchaseCost: string | null;
  notes: string | null;
  sport?: Sport;
  assignments?: EquipmentAssignment[];
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  assignedToType: 'ATHLETE' | 'TEAM';
  athleteId: string | null;
  teamId: string | null;
  quantity: number;
  assignedAt: string;
  dueDate: string | null;
  returnedAt: string | null;
  conditionOnReturn: string | null;
  notes: string | null;
  athlete?: { id: string; fullName: string };
  team?: { id: string; name: string };
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string | null;
  featured: boolean;
  status: string;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string };
}

export interface SliderSlide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
}
