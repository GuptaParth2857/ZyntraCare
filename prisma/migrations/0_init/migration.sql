-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "avatar" TEXT,
    "city" TEXT,
    "age" INTEGER,
    "bloodGroup" TEXT,
    "conditions" TEXT,
    "role" TEXT NOT NULL DEFAULT 'patient',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" TEXT,
    "ipAddress" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "specialties" TEXT NOT NULL,
    "beds" TEXT NOT NULL,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL DEFAULT '',
    "workingHours" TEXT NOT NULL DEFAULT '24/7',
    "doctors" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FavoriteHospital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    CONSTRAINT "FavoriteHospital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FavoriteHospital_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT NOT NULL DEFAULT '',
    "fee" REAL NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "meetingLink" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL,
    "hospital" TEXT NOT NULL DEFAULT '',
    "doctor" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL DEFAULT '',
    "previousHash" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "medicines" TEXT NOT NULL,
    "instructions" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL,
    "validUntil" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "bloodPressure" TEXT NOT NULL DEFAULT '',
    "heartRate" INTEGER,
    "bloodSugar" REAL,
    "weight" REAL,
    "height" REAL,
    "temperature" REAL,
    "oxygenLevel" REAL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthRiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "overallRisk" TEXT NOT NULL,
    "riskPercent" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "input" TEXT NOT NULL DEFAULT '',
    "factors" TEXT NOT NULL DEFAULT '',
    "diseases" TEXT NOT NULL DEFAULT '',
    "recommendations" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthRiskAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ambulance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverName" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'basic',
    "hospitalId" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AmbulanceBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "ambulanceId" TEXT,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "pickupLat" REAL NOT NULL,
    "pickupLng" REAL NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "dropLat" REAL,
    "dropLng" REAL,
    "dropAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AmbulanceBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AmbulanceBooking_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "Ambulance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AmbulanceLocationUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ambulanceId" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AmbulanceLocationUpdate_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "Ambulance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT NOT NULL DEFAULT '',
    "education" TEXT NOT NULL DEFAULT '',
    "languages" TEXT NOT NULL DEFAULT 'English',
    "consultingFee" REAL NOT NULL DEFAULT 500,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoctorHospital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    CONSTRAINT "DoctorHospital_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoctorHospital_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HospitalAdmin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "permissions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HospitalAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HospitalAdmin_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bloodType" TEXT,
    "allergies" TEXT,
    "medicalHistory" TEXT,
    "emergencyContact" TEXT,
    "emergencyContactPhone" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HospitalBed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospitalId" TEXT NOT NULL,
    "floor" TEXT,
    "ward" TEXT,
    "bedNumber" TEXT,
    "bedType" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "price" REAL NOT NULL DEFAULT 500,
    "amenities" TEXT NOT NULL DEFAULT '',
    "occupiedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HospitalBed_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RealTimeBed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospitalId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "totalBeds" INTEGER NOT NULL DEFAULT 0,
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "occupiedBeds" INTEGER NOT NULL DEFAULT 0,
    "totalICU" INTEGER NOT NULL DEFAULT 0,
    "availableICU" INTEGER NOT NULL DEFAULT 0,
    "occupiedICU" INTEGER NOT NULL DEFAULT 0,
    "icuOccupancy" REAL NOT NULL DEFAULT 0,
    "generalOccupancy" REAL NOT NULL DEFAULT 0,
    "lastUpdatedBy" TEXT,
    "updateSource" TEXT NOT NULL DEFAULT 'auto',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmergencyAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "location" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "alertType" TEXT NOT NULL DEFAULT 'MEDICAL',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TRIGGERED',
    "responders" TEXT,
    "ambulanceId" TEXT,
    "hospitalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmergencyAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Overall Experience',
    "message" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Anonymous',
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BedAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "targetAvailability" INTEGER NOT NULL DEFAULT 1,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BedAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FootfallReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospitalId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "reportDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HealthCamp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "campType" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "services" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "hospitalId" TEXT,
    "registration" TEXT NOT NULL DEFAULT 'Free',
    "spotsAvailable" INTEGER NOT NULL DEFAULT 50,
    "organizedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CampRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "age" INTEGER,
    "city" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MedicineRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "composition" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "batchNumber" TEXT,
    "expiryDate" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WearableData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "heartRate" INTEGER,
    "bloodPressure" TEXT,
    "bloodSugar" REAL,
    "oxygenLevel" REAL,
    "temperature" REAL,
    "steps" INTEGER,
    "calories" INTEGER,
    "sleepHours" REAL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WearableData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DigitalTwin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarData" TEXT,
    "healthSummary" TEXT,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DigitalTwin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Drone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "batteryLevel" REAL NOT NULL DEFAULT 100,
    "lat" REAL,
    "lng" REAL,
    "altitude" REAL,
    "speed" REAL,
    "hospitalId" TEXT,
    "lastMission" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DroneMission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "originLat" REAL NOT NULL,
    "originLng" REAL NOT NULL,
    "destLat" REAL NOT NULL,
    "destLng" REAL NOT NULL,
    "packageDesc" TEXT,
    "recipientName" TEXT,
    "recipientPhone" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DroneMission_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PillRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "imageData" TEXT,
    "pillName" TEXT,
    "description" TEXT,
    "dosage" TEXT,
    "matches" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PillRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganDonor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organs" TEXT NOT NULL,
    "bloodType" TEXT,
    "tissueType" TEXT,
    "age" INTEGER,
    "weight" REAL,
    "height" REAL,
    "city" TEXT,
    "state" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganDonor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organNeeded" TEXT NOT NULL,
    "bloodType" TEXT,
    "tissueType" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "age" INTEGER,
    "city" TEXT,
    "state" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "format" TEXT NOT NULL DEFAULT 'JSON',
    "isAnonymized" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coverage" REAL NOT NULL,
    "premium" REAL NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'monthly',
    "description" TEXT,
    "eligibility" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "premiumPaid" REAL NOT NULL,
    "claimsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InsurancePolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InsurancePolicy_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "employeeCount" INTEGER,
    "services" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CorporateMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CorporateMember_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CorporateProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "lat" REAL,
    "lng" REAL,
    "rating" REAL NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL DEFAULT '',
    "accredited" BOOLEAN NOT NULL DEFAULT false,
    "homeCollection" BOOLEAN NOT NULL DEFAULT true,
    "tests" TEXT NOT NULL DEFAULT '[]',
    "workingHours" TEXT NOT NULL DEFAULT '8:00 AM - 6:00 PM',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "lat" REAL,
    "lng" REAL,
    "rating" REAL NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL DEFAULT '',
    "license" TEXT NOT NULL DEFAULT '',
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "deliveryAvailable" BOOLEAN NOT NULL DEFAULT true,
    "open24Hours" BOOLEAN NOT NULL DEFAULT false,
    "workingHours" TEXT NOT NULL DEFAULT '9:00 AM - 9:00 PM',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "pincode" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "categories" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'overture',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL DEFAULT 'ZyntraCare',
    "image" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'General',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'General',
    "image" TEXT NOT NULL DEFAULT '',
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Anonymous',
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "targetValue" REAL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "goals" TEXT NOT NULL DEFAULT '[]',
    "schedule" TEXT NOT NULL DEFAULT '[]',
    "milestones" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CarePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WellnessMission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "icon" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT 'daily',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WellnessMissionProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WellnessMissionProgress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "WellnessMission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WellnessMissionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "age" INTEGER,
    "bloodGroup" TEXT,
    "gender" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "conditions" TEXT,
    "medications" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WomenHealthCycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "cycleLength" INTEGER NOT NULL DEFAULT 28,
    "periodLength" INTEGER NOT NULL DEFAULT 5,
    "symptoms" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WomenHealthCycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT NOT NULL DEFAULT '',
    "age" INTEGER,
    "weight" REAL,
    "color" TEXT NOT NULL DEFAULT '',
    "microchip" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PetVaccination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateGiven" TEXT NOT NULL,
    "nextDueDate" TEXT,
    "veterinarian" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PetVaccination_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SponsorInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "partnershipType" TEXT NOT NULL,
    "budget" TEXT,
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SponsorInquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "referenceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "HealthWallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coinsRequired" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'labs',
    "icon" TEXT NOT NULL DEFAULT '????',
    "discount" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coinsSpent" INTEGER NOT NULL DEFAULT 0,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'redeemed',
    "redeemedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardRedemption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RewardItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RewardRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GenomicData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" TEXT,
    "summary" TEXT,
    "rawFileUrl" TEXT,
    "provider" TEXT NOT NULL DEFAULT '',
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenomicData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicineReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicine" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "times" TEXT NOT NULL,
    "days" TEXT NOT NULL DEFAULT '[]',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MedicineReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicineOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "pharmacy" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "payment" TEXT NOT NULL DEFAULT 'cod',
    "status" TEXT NOT NULL DEFAULT 'placed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicineOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeshMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL DEFAULT 'Anonymous',
    "content" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "deviceId" TEXT,
    "hopCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeshMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "repeatType" TEXT NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VoiceReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicineSupply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "medicine" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "distributor" TEXT NOT NULL,
    "hospitalId" TEXT,
    "quantity" INTEGER NOT NULL,
    "manufacturingDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "currentLocation" TEXT,
    "supplyStatus" TEXT NOT NULL DEFAULT 'MANUFACTURED',
    "blockchainHash" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MedicineSupply_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthTimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hospital" TEXT NOT NULL DEFAULT '',
    "doctor" TEXT NOT NULL DEFAULT '',
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthTimelineEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospitalId" TEXT NOT NULL,
    "userId" TEXT,
    "patientName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "queueNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "estimatedWait" INTEGER NOT NULL DEFAULT 15,
    "actualWait" INTEGER,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "servedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "MedicalID" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL DEFAULT '',
    "allergies" TEXT NOT NULL DEFAULT '',
    "conditions" TEXT NOT NULL DEFAULT '',
    "medications" TEXT NOT NULL DEFAULT '',
    "emergencyContact1" TEXT NOT NULL DEFAULT '',
    "emergencyPhone1" TEXT NOT NULL DEFAULT '',
    "emergencyContact2" TEXT NOT NULL DEFAULT '',
    "emergencyPhone2" TEXT NOT NULL DEFAULT '',
    "organDonor" BOOLEAN NOT NULL DEFAULT false,
    "insuranceProvider" TEXT NOT NULL DEFAULT '',
    "insuranceNumber" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MedicalID_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppointmentReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "title" TEXT NOT NULL,
    "dateTime" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "reminderBefore" INTEGER NOT NULL DEFAULT 60,
    "type" TEXT NOT NULL DEFAULT 'appointment',
    "notes" TEXT NOT NULL DEFAULT '',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppointmentReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InsuranceClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "policyId" TEXT,
    "hospitalName" TEXT NOT NULL,
    "treatmentType" TEXT NOT NULL,
    "claimAmount" REAL NOT NULL,
    "approvedAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "documents" TEXT NOT NULL DEFAULT '[]',
    "diagnosis" TEXT NOT NULL DEFAULT '',
    "treatmentDate" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InsuranceClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "targetValue" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "icon" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChallengeParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progress" REAL NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ChallengeParticipation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "HealthChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
    "dailyGoal" TEXT NOT NULL DEFAULT '',
    "target" REAL NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 7,
    "daysLeft" INTEGER NOT NULL DEFAULT 7,
    "reward" INTEGER NOT NULL DEFAULT 500,
    "maxMembers" INTEGER NOT NULL DEFAULT 5,
    "progress" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamChallenge_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamChallengeMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL DEFAULT '',
    "contribution" REAL NOT NULL DEFAULT 0,
    "avatar" TEXT NOT NULL DEFAULT '',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamChallengeMember_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "TeamChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamChallengeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoctorReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL DEFAULT 'Anonymous',
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "comment" TEXT NOT NULL,
    "visitType" TEXT NOT NULL DEFAULT 'in_person',
    "wouldRecommend" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClinicalTrial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "intervention" TEXT NOT NULL,
    "sponsor" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL DEFAULT '',
    "eligibility" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'recruiting',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PillDispenser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'online',
    "batteryLevel" INTEGER NOT NULL DEFAULT 100,
    "compartments" TEXT NOT NULL DEFAULT '[]',
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PillDispenser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PillSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispenserId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "compartment" INTEGER NOT NULL,
    "times" TEXT NOT NULL,
    "daysOfWeek" TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PillSchedule_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "PillDispenser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispenseLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispenserId" TEXT NOT NULL,
    "medicine" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "compartment" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dispensedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DispenseLog_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "PillDispenser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispenserAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispenserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DispenserAlert_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "PillDispenser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "totalCalories" REAL NOT NULL DEFAULT 0,
    "totalProtein" REAL NOT NULL DEFAULT 0,
    "totalCarbs" REAL NOT NULL DEFAULT 0,
    "totalFat" REAL NOT NULL DEFAULT 0,
    "dietType" TEXT NOT NULL DEFAULT 'balanced',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentalHealthEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "anxiety" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" REAL,
    "sleepQuality" INTEGER,
    "stressLevel" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "activities" TEXT NOT NULL DEFAULT '[]',
    "screeningType" TEXT NOT NULL DEFAULT '',
    "screeningScore" INTEGER,
    "screeningAnswers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentalHealthEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicineInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicine1" TEXT NOT NULL,
    "medicine2" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MedicationAdherence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT '',
    "times" TEXT NOT NULL DEFAULT '[]',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "remainingDoses" INTEGER NOT NULL DEFAULT 0,
    "totalDoses" INTEGER NOT NULL DEFAULT 0,
    "stockLevel" INTEGER NOT NULL DEFAULT 0,
    "autoReorder" BOOLEAN NOT NULL DEFAULT false,
    "reorderThreshold" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicationAdherence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicationDoseLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adherenceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "doses" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicationDoseLog_adherenceId_fkey" FOREIGN KEY ("adherenceId") REFERENCES "MedicationAdherence" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MedicationDoseLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteHospital_userId_hospitalId_key" ON "FavoriteHospital"("userId", "hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Ambulance_vehicleNumber_key" ON "Ambulance"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ambulance_phone_key" ON "Ambulance"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Ambulance_email_key" ON "Ambulance"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorHospital_doctorId_hospitalId_key" ON "DoctorHospital"("doctorId", "hospitalId");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalAdmin_userId_key" ON "HospitalAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientRecord_userId_key" ON "PatientRecord"("userId");

-- CreateIndex
CREATE INDEX "RealTimeBed_hospitalId_idx" ON "RealTimeBed"("hospitalId");

-- CreateIndex
CREATE INDEX "RealTimeBed_updatedAt_idx" ON "RealTimeBed"("updatedAt");

-- CreateIndex
CREATE INDEX "BedAlert_userId_idx" ON "BedAlert"("userId");

-- CreateIndex
CREATE INDEX "BedAlert_hospitalId_idx" ON "BedAlert"("hospitalId");

-- CreateIndex
CREATE INDEX "FootfallReport_hospitalId_idx" ON "FootfallReport"("hospitalId");

-- CreateIndex
CREATE INDEX "FootfallReport_reportDate_idx" ON "FootfallReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "HealthCamp_city_idx" ON "HealthCamp"("city");

-- CreateIndex
CREATE INDEX "HealthCamp_date_idx" ON "HealthCamp"("date");

-- CreateIndex
CREATE INDEX "CampRegistration_campId_idx" ON "CampRegistration"("campId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineRecord_code_key" ON "MedicineRecord"("code");

-- CreateIndex
CREATE INDEX "MedicineRecord_code_idx" ON "MedicineRecord"("code");

-- CreateIndex
CREATE INDEX "MedicineRecord_manufacturer_idx" ON "MedicineRecord"("manufacturer");

-- CreateIndex
CREATE INDEX "WearableData_userId_idx" ON "WearableData"("userId");

-- CreateIndex
CREATE INDEX "WearableData_recordedAt_idx" ON "WearableData"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalTwin_userId_key" ON "DigitalTwin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Drone_droneId_key" ON "Drone"("droneId");

-- CreateIndex
CREATE INDEX "Drone_status_idx" ON "Drone"("status");

-- CreateIndex
CREATE INDEX "DroneMission_droneId_idx" ON "DroneMission"("droneId");

-- CreateIndex
CREATE INDEX "DroneMission_status_idx" ON "DroneMission"("status");

-- CreateIndex
CREATE INDEX "PillRecord_userId_idx" ON "PillRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganDonor_userId_key" ON "OrganDonor"("userId");

-- CreateIndex
CREATE INDEX "OrganDonor_bloodType_idx" ON "OrganDonor"("bloodType");

-- CreateIndex
CREATE INDEX "OrganDonor_organs_idx" ON "OrganDonor"("organs");

-- CreateIndex
CREATE UNIQUE INDEX "OrganRecipient_userId_key" ON "OrganRecipient"("userId");

-- CreateIndex
CREATE INDEX "OrganRecipient_organNeeded_idx" ON "OrganRecipient"("organNeeded");

-- CreateIndex
CREATE INDEX "OrganRecipient_bloodType_idx" ON "OrganRecipient"("bloodType");

-- CreateIndex
CREATE INDEX "DataListing_dataType_idx" ON "DataListing"("dataType");

-- CreateIndex
CREATE INDEX "DataListing_status_idx" ON "DataListing"("status");

-- CreateIndex
CREATE INDEX "InsurancePlan_type_idx" ON "InsurancePlan"("type");

-- CreateIndex
CREATE INDEX "InsurancePolicy_userId_idx" ON "InsurancePolicy"("userId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_status_idx" ON "InsurancePolicy"("status");

-- CreateIndex
CREATE INDEX "CorporateMember_programId_idx" ON "CorporateMember"("programId");

-- CreateIndex
CREATE INDEX "Lab_city_idx" ON "Lab"("city");

-- CreateIndex
CREATE INDEX "Lab_state_idx" ON "Lab"("state");

-- CreateIndex
CREATE INDEX "Pharmacy_city_idx" ON "Pharmacy"("city");

-- CreateIndex
CREATE INDEX "Pharmacy_state_idx" ON "Pharmacy"("state");

-- CreateIndex
CREATE INDEX "NearbyPlace_lat_lng_idx" ON "NearbyPlace"("lat", "lng");

-- CreateIndex
CREATE INDEX "NearbyPlace_type_idx" ON "NearbyPlace"("type");

-- CreateIndex
CREATE INDEX "NearbyPlace_city_idx" ON "NearbyPlace"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_category_idx" ON "Blog"("category");

-- CreateIndex
CREATE INDEX "Blog_createdAt_idx" ON "Blog"("createdAt");

-- CreateIndex
CREATE INDEX "Community_category_idx" ON "Community"("category");

-- CreateIndex
CREATE INDEX "CommunityPost_communityId_idx" ON "CommunityPost"("communityId");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "HealthGoal_userId_idx" ON "HealthGoal"("userId");

-- CreateIndex
CREATE INDEX "HealthGoal_status_idx" ON "HealthGoal"("status");

-- CreateIndex
CREATE INDEX "CarePlan_userId_idx" ON "CarePlan"("userId");

-- CreateIndex
CREATE INDEX "CarePlan_condition_idx" ON "CarePlan"("condition");

-- CreateIndex
CREATE INDEX "WellnessMissionProgress_userId_idx" ON "WellnessMissionProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WellnessMissionProgress_missionId_userId_key" ON "WellnessMissionProgress"("missionId", "userId");

-- CreateIndex
CREATE INDEX "FamilyMember_userId_idx" ON "FamilyMember"("userId");

-- CreateIndex
CREATE INDEX "WomenHealthCycle_userId_idx" ON "WomenHealthCycle"("userId");

-- CreateIndex
CREATE INDEX "WomenHealthCycle_startDate_idx" ON "WomenHealthCycle"("startDate");

-- CreateIndex
CREATE INDEX "Pet_userId_idx" ON "Pet"("userId");

-- CreateIndex
CREATE INDEX "PetVaccination_petId_idx" ON "PetVaccination"("petId");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "SponsorInquiry_status_idx" ON "SponsorInquiry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HealthWallet_userId_key" ON "HealthWallet"("userId");

-- CreateIndex
CREATE INDEX "HealthTransaction_walletId_idx" ON "HealthTransaction"("walletId");

-- CreateIndex
CREATE INDEX "HealthTransaction_createdAt_idx" ON "HealthTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Reward_userId_idx" ON "Reward"("userId");

-- CreateIndex
CREATE INDEX "Reward_source_idx" ON "Reward"("source");

-- CreateIndex
CREATE INDEX "Reward_createdAt_idx" ON "Reward"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardRedemption_code_key" ON "RewardRedemption"("code");

-- CreateIndex
CREATE INDEX "RewardRedemption_userId_idx" ON "RewardRedemption"("userId");

-- CreateIndex
CREATE INDEX "RewardRedemption_itemId_idx" ON "RewardRedemption"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "GenomicData_userId_key" ON "GenomicData"("userId");

-- CreateIndex
CREATE INDEX "MedicineReminder_userId_idx" ON "MedicineReminder"("userId");

-- CreateIndex
CREATE INDEX "MedicineReminder_isActive_idx" ON "MedicineReminder"("isActive");

-- CreateIndex
CREATE INDEX "MedicineOrder_userId_idx" ON "MedicineOrder"("userId");

-- CreateIndex
CREATE INDEX "MeshMessage_createdAt_idx" ON "MeshMessage"("createdAt");

-- CreateIndex
CREATE INDEX "VoiceReminder_userId_idx" ON "VoiceReminder"("userId");

-- CreateIndex
CREATE INDEX "VoiceReminder_scheduledAt_idx" ON "VoiceReminder"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineSupply_batchId_key" ON "MedicineSupply"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineSupply_blockchainHash_key" ON "MedicineSupply"("blockchainHash");

-- CreateIndex
CREATE INDEX "HealthTimelineEvent_userId_idx" ON "HealthTimelineEvent"("userId");

-- CreateIndex
CREATE INDEX "HealthTimelineEvent_date_idx" ON "HealthTimelineEvent"("date");

-- CreateIndex
CREATE INDEX "QueueEntry_hospitalId_idx" ON "QueueEntry"("hospitalId");

-- CreateIndex
CREATE INDEX "QueueEntry_status_idx" ON "QueueEntry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalID_userId_key" ON "MedicalID"("userId");

-- CreateIndex
CREATE INDEX "MedicalID_userId_idx" ON "MedicalID"("userId");

-- CreateIndex
CREATE INDEX "AppointmentReminder_userId_idx" ON "AppointmentReminder"("userId");

-- CreateIndex
CREATE INDEX "AppointmentReminder_dateTime_idx" ON "AppointmentReminder"("dateTime");

-- CreateIndex
CREATE INDEX "InsuranceClaim_userId_idx" ON "InsuranceClaim"("userId");

-- CreateIndex
CREATE INDEX "InsuranceClaim_status_idx" ON "InsuranceClaim"("status");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_userId_idx" ON "ChallengeParticipation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeParticipation_challengeId_userId_key" ON "ChallengeParticipation"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "TeamChallenge_createdBy_idx" ON "TeamChallenge"("createdBy");

-- CreateIndex
CREATE INDEX "TeamChallengeMember_challengeId_idx" ON "TeamChallengeMember"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamChallengeMember_challengeId_userId_key" ON "TeamChallengeMember"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "DoctorReview_doctorId_idx" ON "DoctorReview"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorReview_rating_idx" ON "DoctorReview"("rating");

-- CreateIndex
CREATE INDEX "ClinicalTrial_condition_idx" ON "ClinicalTrial"("condition");

-- CreateIndex
CREATE INDEX "ClinicalTrial_status_idx" ON "ClinicalTrial"("status");

-- CreateIndex
CREATE INDEX "PillDispenser_userId_idx" ON "PillDispenser"("userId");

-- CreateIndex
CREATE INDEX "PillSchedule_dispenserId_idx" ON "PillSchedule"("dispenserId");

-- CreateIndex
CREATE INDEX "DispenseLog_dispenserId_idx" ON "DispenseLog"("dispenserId");

-- CreateIndex
CREATE INDEX "DispenserAlert_dispenserId_idx" ON "DispenserAlert"("dispenserId");

-- CreateIndex
CREATE INDEX "MealPlan_userId_idx" ON "MealPlan"("userId");

-- CreateIndex
CREATE INDEX "MentalHealthEntry_userId_idx" ON "MentalHealthEntry"("userId");

-- CreateIndex
CREATE INDEX "MentalHealthEntry_date_idx" ON "MentalHealthEntry"("date");

-- CreateIndex
CREATE INDEX "MedicineInteraction_medicine1_idx" ON "MedicineInteraction"("medicine1");

-- CreateIndex
CREATE INDEX "MedicineInteraction_medicine2_idx" ON "MedicineInteraction"("medicine2");

-- CreateIndex
CREATE INDEX "MedicationAdherence_userId_idx" ON "MedicationAdherence"("userId");

-- CreateIndex
CREATE INDEX "MedicationDoseLog_adherenceId_idx" ON "MedicationDoseLog"("adherenceId");

-- CreateIndex
CREATE INDEX "MedicationDoseLog_userId_idx" ON "MedicationDoseLog"("userId");

-- CreateIndex
CREATE INDEX "MedicationDoseLog_date_idx" ON "MedicationDoseLog"("date");

