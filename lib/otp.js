import { query } from "./db";

const twilioConfigured =
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_VERIFY_SERVICE_SID;

async function getTwilioClient() {
  const twilio = (await import("twilio")).default;
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendOtp(phone) {
  if (twilioConfigured) {
    const client = await getTwilioClient();
    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });
    return { mode: "twilio" };
  }

  // Demo mode: generate a code ourselves, store it, and log it instead of
  // texting it out. Anyone can read the server log during local testing.
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await query(
    "INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)",
    [phone, code, expiresAt]
  );
  console.log(`[DEMO MODE] OTP for ${phone}: ${code}`);
  return { mode: "demo", code };
}

export async function verifyOtp(phone, code) {
  if (twilioConfigured) {
    const client = await getTwilioClient();
    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });
    return result.status === "approved";
  }

  const rows = await query(
    `SELECT id FROM otp_codes
     WHERE phone = ? AND code = ? AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [phone, code]
  );
  if (rows.length === 0) return false;
  await query("DELETE FROM otp_codes WHERE phone = ?", [phone]);
  return true;
}
