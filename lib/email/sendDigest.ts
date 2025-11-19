import nodemailer from 'nodemailer';
import { UserProfile, NormalizedJob } from '@/types';

type JobWithScore = NormalizedJob & { score?: number };

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateEmailHtml = (profile: UserProfile, jobs: JobWithScore[]): string => {
  return `
    <h1>Your Top 10 Job Matches</h1>
    <p>Hi there, here are your top 10 job matches based on your profile as a ${profile.job_title}.</p>
    <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Title</th>
          <th>Company</th>
          <th>Location</th>
          <th>Score</th>
          <th>Apply</th>
        </tr>
      </thead>
      <tbody>
        ${jobs.map(job => `
          <tr>
            <td>${job.title}</td>
            <td>${job.company}</td>
            <td>${job.locations?.join(', ')}</td>
            <td>${(job.score || 0).toFixed(2)}</td>
            <td><a href="${job.apply_url}">Apply</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}">View more jobs on OneSearch</a>
    </p>
  `;
};

export async function sendDigestEmail(userEmail: string, profile: UserProfile, jobs: JobWithScore[]) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Your Daily Job Digest from OneSearch',
    html: generateEmailHtml(profile, jobs),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Digest email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send digest to ${userEmail}:`, error);
  }
}
