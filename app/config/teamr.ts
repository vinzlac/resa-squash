export const TEAMR_CONFIG = {
  BASE_URL: process.env.TEAMR_API_URL || '',
  FACILITY_ID: process.env.TEAMR_FACILITY_ID || '',
  SPORT_ID: process.env.TEAMR_SPORT_ID || 'squash'
} as const; 