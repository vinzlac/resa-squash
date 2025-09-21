// URL de base TeamR
export const TEAMR_BASE_URL = "https://app.teamr.eu";

// URLs TeamR construites à partir de la base URL
export const GET_LICENSEE_URL = `${TEAMR_BASE_URL}/users/licensees`;
export const BOOKING_URL = `${TEAMR_BASE_URL}/sessions/book/twoLicenseesFromClub`;
export const TEAMR_AUTH_URL = `${TEAMR_BASE_URL}/users/custom/authenticate/v2`;
export const GET_SESSION_URL = `${TEAMR_BASE_URL}/nearfilters/clubId`;
export const GET_BOOKINGS_URL = `${TEAMR_BASE_URL}/bookings/user/{userId}`;
export const QR_CODE_URL = `${TEAMR_BASE_URL}/bookings/qrCode/{bookingId}`;

export const COURT_CLUB_IDS: { [key: string]: string } = {
  "1": "60b754170ebdd0002094521b",
  "2": "60b76ff51b45be0020f0e985",
  "3": "60b77145e704970027492488",
  "4": "60b771610ebdd0002094562d"
};

// Map inversée calculée automatiquement à partir de COURT_CLUB_IDS
export const CLUB_ID_TO_COURT_NUMBER: { [key: string]: string } = Object.fromEntries(
  Object.entries(COURT_CLUB_IDS).map(([courtNumber, clubId]) => [clubId, courtNumber])
);

// Fonction pour obtenir le numéro de court à partir du clubId
export function getCourtNumberFromClubId(clubId: string): string {
  return CLUB_ID_TO_COURT_NUMBER[clubId] || "Inconnu";
}

// Fonction utilitaire pour interpoler les variables dans les URLs
export function interpolateUrl(url: string, variables: Record<string, string>): string {
  return url.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
}
export const CUSTOM_ID = "5dd6b3961510c91d353b0833";
export const COORDINATES = [2.5864862369264747, 48.869659697477495];

