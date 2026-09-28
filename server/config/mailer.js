const nodemailer = require('nodemailer');

let transporter = null;
let testAccount = null;

async function initMailer() {
  try {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('IEmail Service] Nodemailer ready with Ethereal test account: ' + testAccount.user);
  } catch (err) {
    console.warn('IEmail Service] Ethereal failover: ', err.message);
  }
}

async function sendTaskNotification({ recipientEmail, recipientName, task, eventType, triggeredBy }) {
  if (!transporter) {
    await initMailer();
  }

  const priorityColors = {
    'Highest': '#e11d48',
    'High': '#ea580c',
    'Medium': '#eab308',
    'Low': '#10b981',
    'Lowest': '#3b82f6'
  };
  const priorityColor = priorityColors[task.priority] || '#6366f1';

  const subject = eventType === 'ESCALATION'
    ? [ ',', 'HIGH PRIORITY ALERT'].join(' ') + ' ' + task.id + ': ' + task.title
    : ['', 'Task Assigned'].join(' ') + ' ' + task.id + ': ' + task.title;

  const labelsHtml = (task.labels && task.labels.length)
    ? task.labels.map(l => '<span style="background: #e9f2ff; color: #0052cc; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-right: 4px;">' + l + '</span>').join('')
    : 'None';

  const html = '<!doctype html><html><head>' +
    '<style>body{family:system-ui,sans-serif;background:#f4f5f7;padding:20px;color:#172b4d;}' +
    '.card{width:100%;max-width:580px;margin:0 auto;background:#ffffff;bborder-radius:8px;border:1px solid #dfe1e6;box-shadow:0 4px 12px rgba(9,30,66,0.08);overflow:hidden;}' +
    '.header{background:#0052cc;color:#fff;padding:18px 24px;font-size:18px;font-weight:600;}' +
    '.body{padding:24px;}' +
    '.badge{display:inline-block;padding:4px 10px;bborder-radius:4px;color:#fff;font-weight:700;font-size:12px;margin-right:8px;}' +
    '.details-box{background:#f4f5f7;padding:12px;border-radius:4px;color:#42526e;margin:12px 0;font-size:14px;line-height:1.5;}' +
    '.meta{margin:16px 0;font-size:14px;}' +
    '.meta div{padding:4px 0;}' +
    '.btn{display:inline-block;background:#0052cc;color:#ffffff !important;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;margin-top:18px;}' +
    '.footer{padding:12px 24px;background:#fafbfc;border-top:1px solid #ebecf0;font-size:12px;color:#6b778c;text-align:center;}' +
    '</style></head><body>' +
    '<div class="card">' +
    '<div class="header">Jira Issue Tracker Notification</div>' +
    '<div class="body">' +
    '<p>Hello <strong>' + (recipientName || 'Team Member') + '</style></strong>,</p>' +
    '<p>' + (triggeredBy ? '<strong>' + triggeredBy + '</strong>s has ' : '') +
    (eventType === 'ESCALATION' ? 'escalated this task priority to High!' : 'assigned you to a task:') + '</p>' +
    '<h2 style="color:#0052cc;font-size:18px;margin:12px 0;">' + task.id + ': ' + task.title + '</h2>' +
    '<div><span class="badge" style="background:' + priorityColor + '">' + task.priority + ' Priority</span>' + 
    '<span class="badge" style="background:#4b5563;">Status: ' + task.status + '</span></div>' +
    '<div class="details-box">' + (task.description || 'No description provided.') + '</div>' +
    '<div class="meta">' +
    '<div><strong>Due Date:</strong> ' + (task.dueDate || 'None') + '</div>' + 
    '<div><strong>Labels:</strong> ' + labelsHtml + '</div>' + 
    '</div>' +
    '<div style="text-align:center;"><a href="http://localhost:3000" class="btn">Open Issue Tracker</a></div>' +
    '</div>' + 
    '<div class="footer">Automated alert from Jira Task Manager & Issue Tracker</div>' + 
    '</div></body></html>';

  try {
    if (!transporter) {
      console.log('[Email Simulation] To: ' + recipientEmail + ' | Subject: ' + subject);
      return { simulated: true, subject, recipientEmail };
    }

    const info = await transporter.sendMail({
      from: '"Jira Project Tracker" <notifications@taskmanager.local>',
      to: recipientEmail,
      subject,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\n======================================================');
    console.log('Email Notification Successfully Sent via Nodemailer!');
    console.log('Recipient: ' + recipientEmail);
    console.log('Subject: ' + subject);
    if (previewUrl) {
      console.log('Preview Real-Time HTML Email: ' + previewUrl);
    }
    console.log('======================================================\n');

    return {
      messageId: info.messageId,
      previewUrl,
      recipientEmail,
      subject
    };
  } catch (err) {
    console.error('[Email Service] Error delivering notification:', err.message);
    return { error: err.message };
  }
}

module.exports = {
  initMailer,
  sendTaskNotification
};
