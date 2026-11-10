// Vercel serverless function: receives contact-form submissions and
// emails them to Asset Track via the Resend API.
// Requires the RESEND_API_KEY environment variable (set in Vercel).

const TO = 'MrTiger@assettracktelematics.com';
const FROM = 'Asset Track Website <noreply@fleetxchange.africa>';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  // Fallback: read the raw stream
  return await new Promise(function (resolve) {
    var raw = '';
    req.on('data', function (c) { raw += c; });
    req.on('end', function () { try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email is not configured' });
    return;
  }

  const body = await readBody(req);
  const company = (body.company || '').trim();
  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const interest = (body.interest || '').trim();
  const fleet = (body.fleet || '').trim();
  const message = (body.message || '').trim();

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const rows = [
    ['Company', company],
    ['Contact', name],
    ['Phone', phone],
    ['Email', email],
    ['Interested in', interest],
    ['Fleet size', fleet]
  ].filter(function (r) { return r[1]; })
   .map(function (r) {
     return '<tr><td style="padding:6px 14px 6px 0;color:#5e6880;white-space:nowrap;vertical-align:top">' +
       esc(r[0]) + '</td><td style="padding:6px 0;color:#14162a;font-weight:600">' + esc(r[1]) + '</td></tr>';
   }).join('');

  const html =
    '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto">' +
      '<div style="background:#14162a;padding:20px 24px;border-radius:12px 12px 0 0">' +
        '<h2 style="color:#fff;margin:0;font-size:18px">New website inquiry</h2>' +
        '<p style="color:#E31E24;margin:4px 0 0;font-size:13px;font-weight:600">assettrack.africa</p>' +
      '</div>' +
      '<div style="border:1px solid #e6e8ef;border-top:none;border-radius:0 0 12px 12px;padding:20px 24px">' +
        '<table style="border-collapse:collapse;font-size:14px;width:100%">' + rows + '</table>' +
        (message
          ? '<div style="margin-top:16px"><div style="color:#5e6880;font-size:13px;margin-bottom:4px">Message</div>' +
            '<div style="color:#14162a;font-size:14px;line-height:1.6;white-space:pre-wrap">' + esc(message) + '</div></div>'
          : '') +
        '<p style="margin:18px 0 0;color:#8892a8;font-size:12px">Reply directly to this email to respond to ' + esc(name) + '.</p>' +
      '</div>' +
    '</div>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: 'New inquiry — ' + (company || name),
        html: html
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(502).json({ error: 'Email send failed', detail: detail.slice(0, 300) });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
