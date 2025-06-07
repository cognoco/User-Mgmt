import { sendEmail } from '@/src/lib/email/sendEmail'0;

interface TeamInviteEmailParams {
  to: string;
  inviteToken: string;
  invitedByEmail: string;
  teamName: string;
  role: string;
}

export async function sendTeamInviteEmail({
  to,
  inviteToken,
  invitedByEmail,
  teamName,
  role,
}: TeamInviteEmailParams) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/join?token=${inviteToken}`;
  
  const html = `
    <h2>You've been invited to join ${teamName}</h2>
    <p>${invitedByEmail} has invited you to join their team as a ${role}.</p>
    <p>Click the button below to accept the invitation:</p>
    <a href="${inviteUrl}" style="display: inline-block; padding: 12px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
      Accept Invitation
    </a>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${inviteUrl}</p>
    <p>This invitation will expire in 7 days.</p>
  `;

  await sendEmail({
    to,
    subject: `Invitation to join ${teamName}`,
    html,
  });
} 