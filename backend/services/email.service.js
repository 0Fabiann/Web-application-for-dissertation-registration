/**
 * Email Service
 * Handles sending email notifications via SendGrid
 * External API integration for the dissertation registration system
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@dissertation.app';
const APP_NAME = 'Dissertation Registration System';

/**
 * Send an email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<boolean>} - Success status
 */
async function sendEmail({ to, subject, text, html }) {
  // Skip if SendGrid is not configured
  if (!process.env.SENDGRID_API_KEY) {
    console.log('[Email] SendGrid not configured, skipping email to:', to);
    return false;
  }

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: APP_NAME
      },
      subject,
      text,
      html
    };

    await sgMail.send(msg);
    console.log(`[Email] Sent successfully to: ${to}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error.message);
    if (error.response) {
      console.error('[Email] Error details:', error.response.body);
    }
    return false;
  }
}

/**
 * Notify professor when a student submits a coordination request
 */
async function sendRequestSubmittedEmail(professorEmail, studentName, dissertationTopic, sessionTitle) {
  return sendEmail({
    to: professorEmail,
    subject: `New Coordination Request from ${studentName}`,
    text: `
Hello,

You have received a new dissertation coordination request.

Student: ${studentName}
Session: ${sessionTitle}
Dissertation Topic: ${dissertationTopic}

Please log in to the Dissertation Registration System to review this request.

Best regards,
${APP_NAME}
    `,
    html: `
<h2>New Coordination Request</h2>
<p>Hello,</p>
<p>You have received a new dissertation coordination request.</p>
<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Student</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${studentName}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Session</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${sessionTitle}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dissertation Topic</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${dissertationTopic}</td>
  </tr>
</table>
<p>Please log in to the system to review this request.</p>
<p>Best regards,<br>${APP_NAME}</p>
    `
  });
}

/**
 * Notify student when their request is approved
 */
async function sendRequestApprovedEmail(studentEmail, professorName, dissertationTopic) {
  return sendEmail({
    to: studentEmail,
    subject: `Your Coordination Request has been Approved!`,
    text: `
Hello,

Great news! Your dissertation coordination request has been approved.

Professor: ${professorName}
Dissertation Topic: ${dissertationTopic}

Next Steps:
1. Log in to the Dissertation Registration System
2. Upload the signed dissertation coordination request document
3. Wait for the professor to review your document

Best regards,
${APP_NAME}
    `,
    html: `
<h2>Request Approved!</h2>
<p>Hello,</p>
<p>Great news! Your dissertation coordination request has been <strong style="color: green;">approved</strong>.</p>
<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Professor</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${professorName}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dissertation Topic</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${dissertationTopic}</td>
  </tr>
</table>
<h3>Next Steps:</h3>
<ol>
  <li>Log in to the Dissertation Registration System</li>
  <li>Upload the signed dissertation coordination request document</li>
  <li>Wait for the professor to review your document</li>
</ol>
<p>Best regards,<br>${APP_NAME}</p>
    `
  });
}

/**
 * Notify student when their request is rejected
 */
async function sendRequestRejectedEmail(studentEmail, professorName, dissertationTopic, reason) {
  return sendEmail({
    to: studentEmail,
    subject: `Your Coordination Request Status Update`,
    text: `
Hello,

We regret to inform you that your dissertation coordination request has not been approved.

Professor: ${professorName}
Dissertation Topic: ${dissertationTopic}
Reason: ${reason}

You may submit requests to other professors during their active registration sessions.

Best regards,
${APP_NAME}
    `,
    html: `
<h2>Request Not Approved</h2>
<p>Hello,</p>
<p>We regret to inform you that your dissertation coordination request has <strong style="color: red;">not been approved</strong>.</p>
<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Professor</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${professorName}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dissertation Topic</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${dissertationTopic}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Reason</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${reason}</td>
  </tr>
</table>
<p>You may submit requests to other professors during their active registration sessions.</p>
<p>Best regards,<br>${APP_NAME}</p>
    `
  });
}

/**
 * Notify professor when student uploads a document
 */
async function sendDocumentUploadedEmail(professorEmail, studentName, dissertationTopic) {
  return sendEmail({
    to: professorEmail,
    subject: `Document Uploaded by ${studentName}`,
    text: `
Hello,

A student has uploaded their signed dissertation coordination document.

Student: ${studentName}
Dissertation Topic: ${dissertationTopic}

Please log in to the Dissertation Registration System to review the document.

Best regards,
${APP_NAME}
    `,
    html: `
<h2>Document Uploaded</h2>
<p>Hello,</p>
<p>A student has uploaded their signed dissertation coordination document.</p>
<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Student</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${studentName}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dissertation Topic</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${dissertationTopic}</td>
  </tr>
</table>
<p>Please log in to the system to review the document.</p>
<p>Best regards,<br>${APP_NAME}</p>
    `
  });
}

/**
 * Notify student when their document is accepted
 */
async function sendDocumentAcceptedEmail(studentEmail, professorName, dissertationTopic) {
  return sendEmail({
    to: studentEmail,
    subject: `Your Document has been Accepted - Coordination Complete!`,
    text: `
Hello,

Congratulations! Your signed dissertation coordination document has been accepted.

Professor: ${professorName}
Dissertation Topic: ${dissertationTopic}

Your dissertation coordination process is now complete. You are officially coordinated by ${professorName}.

Best regards,
${APP_NAME}
    `,
    html: `
<h2>Document Accepted - Coordination Complete!</h2>
<p>Hello,</p>
<p>Congratulations! Your signed dissertation coordination document has been <strong style="color: green;">accepted</strong>.</p>
<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Professor</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${professorName}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dissertation Topic</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${dissertationTopic}</td>
  </tr>
</table>
<p>Your dissertation coordination process is now <strong>complete</strong>. You are officially coordinated by ${professorName}.</p>
<p>Best regards,<br>${APP_NAME}</p>
    `
  });
}

/**
 * Notify student when their document is rejected
 */
async function sendDocumentRejectedEmail(studentEmail, professorName, dissertationTopic, reason) {
  return sendEmail({
    to: studentEmail,
    subject: `Document Review - Action Required`,
    text: `
Hello,

Your uploaded document requires revision.

Professor: ${professorName}
Dissertation Topic: ${dissertationTopic}
Feedback: ${reason}

Please log in to the Dissertation Registration System and upload a corrected document.

Best regards,
${APP_NAME}
    `,
    html: `
<h2>Document Requires Revision</h2>
<p>Hello,</p>
<p>Your uploaded document requires revision.</p>
<table style="border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Professor</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${professorName}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dissertation Topic</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${dissertationTopic}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Feedback</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${reason}</td>
  </tr>
</table>
<p>Please log in to the system and upload a corrected document.</p>
<p>Best regards,<br>${APP_NAME}</p>
    `
  });
}

module.exports = {
  sendEmail,
  sendRequestSubmittedEmail,
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
  sendDocumentUploadedEmail,
  sendDocumentAcceptedEmail,
  sendDocumentRejectedEmail
};
