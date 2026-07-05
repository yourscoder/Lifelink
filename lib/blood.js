export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// For a recipient of a given group, which donor groups are safe.
const COMPATIBLE_DONORS = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

export function compatibleDonorGroups(recipientGroup) {
  return COMPATIBLE_DONORS[recipientGroup] || [];
}

export function eligibilityDays() {
  return Number(process.env.DONOR_ELIGIBILITY_DAYS || 90);
}

// Mirrors the SQL condition used in queries — kept here for any
// client-side or unit-test use.
export function isActiveDonor(lastDonationDate) {
  if (!lastDonationDate) return true;
  const days =
    (Date.now() - new Date(lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
  return days >= eligibilityDays();
}
