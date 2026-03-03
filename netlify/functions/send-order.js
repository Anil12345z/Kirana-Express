const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Secret code validation
  const validCode = process.env.SECRET_CODE || 'ORDER2026';
  if (data.secretCode !== validCode) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Invalid secret code. Please ask the store owner for the correct code.' }) };
  }

  const orderNumber = `KE${Date.now().toString().slice(-6)}`;
  const orderDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });

  // Build items rows for email
  const itemsRows = data.cart.map(item => `
    <tr>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:14px; color:#1a1a1a;">${item.emoji || '📦'} ${item.name}</td>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:14px; color:#555; text-align:center;">${item.unit}</td>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:14px; color:#555; text-align:center;">×${item.qty}</td>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:14px; font-weight:700; color:#1a1a1a; text-align:right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const ownerPhone = process.env.OWNER_PHONE || '8529488194';
  const storeName = process.env.STORE_NAME || 'Kirana Express';
  const storeAddress = process.env.STORE_ADDRESS || 'Your Baiman , kiraoli, Agra , Uttar pradesh 283122';

  // ---- OWNER EMAIL HTML ----
  const ownerEmailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:'Segoe UI', Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:30px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.10);">
      
      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding:36px 40px; text-align:center;">
          <div style="font-size:40px; margin-bottom:8px;">🛒</div>
          <h1 style="margin:0; color:#fff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">${storeName}</h1>
          <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">नया ऑर्डर आया है! • New Order Received</p>
        </td>
      </tr>

      <!-- ORDER ALERT BADGE -->
      <tr>
        <td style="background:#fff7ed; padding:16px 40px; border-bottom:2px solid #fed7aa;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="background:#ea580c; color:#fff; font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; letter-spacing:1px;">🔔 ORDER #${orderNumber}</span>
              </td>
              <td align="right" style="color:#9a3412; font-size:13px; font-weight:600;">📅 ${orderDate}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CUSTOMER INFO -->
      <tr>
        <td style="padding:28px 40px 0;">
          <h2 style="margin:0 0 16px; font-size:16px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:1px; border-left:4px solid #ea580c; padding-left:12px;">Customer Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; width:120px; color:#6b7280; font-size:13px; font-weight:600;">👤 Name</td>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#111827; font-size:14px; font-weight:700;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#6b7280; font-size:13px; font-weight:600;">📱 Phone</td>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;"><a href="tel:+91${data.phone}" style="color:#ea580c; font-size:15px; font-weight:800; text-decoration:none;">+91 ${data.phone}</a> &nbsp;<a href="https://wa.me/91${data.phone}" style="background:#25D366; color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; text-decoration:none;">💬 WhatsApp</a></td>
            </tr>
            ${data.email ? `<tr><td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#6b7280; font-size:13px; font-weight:600;">✉️ Email</td><td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#111827; font-size:14px;">${data.email}</td></tr>` : ''}
            <tr>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#6b7280; font-size:13px; font-weight:600;">🚚 Delivery</td>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0;">
                <span style="background:${data.deliveryType === 'Home Delivery' ? '#dbeafe' : '#dcfce7'}; color:${data.deliveryType === 'Home Delivery' ? '#1d4ed8' : '#15803d'}; font-size:12px; font-weight:800; padding:4px 12px; border-radius:20px;">
                  ${data.deliveryType === 'Home Delivery' ? '🚚' : '🏪'} ${data.deliveryType || 'Home Delivery'}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#6b7280; font-size:13px; font-weight:600;">📍 Area</td>
              <td style="padding:14px 20px; border-bottom:1px solid #f0f0f0; color:#111827; font-size:14px;">${data.area}</td>
            </tr>
            <tr>
              <td style="padding:14px 20px; border-bottom:${data.message ? '1px solid #f0f0f0' : 'none'}; color:#6b7280; font-size:13px; font-weight:600; vertical-align:top;">🏠 Address</td>
              <td style="padding:14px 20px; border-bottom:${data.message ? '1px solid #f0f0f0' : 'none'}; color:#111827; font-size:14px; line-height:1.6;">
                ${data.address}
                ${data.coordinates ? `
                <br><br>
                <a href="https://www.google.com/maps?q=${data.coordinates}" style="display:inline-block; background:#ea580c; color:#fff; font-size:12px; font-weight:700; padding:6px 14px; border-radius:8px; text-decoration:none; margin-top:4px;">📌 Open in Google Maps</a>
                <br><span style="font-size:11px; color:#9ca3af; margin-top:4px; display:block;">GPS: ${data.coordinates}</span>
                ` : ''}
              </td>
            </tr>
            ${data.message ? `<tr><td style="padding:14px 20px; color:#6b7280; font-size:13px; font-weight:600; vertical-align:top;">💬 Message</td><td style="padding:14px 20px; color:#111827; font-size:14px; line-height:1.6; font-style:italic;">"${data.message}"</td></tr>` : ''}
          </table>
        </td>
      </tr>

      <!-- ORDER ITEMS -->
      <tr>
        <td style="padding:28px 40px 0;">
          <h2 style="margin:0 0 16px; font-size:16px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:1px; border-left:4px solid #ea580c; padding-left:12px;">Order Items</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px; overflow:hidden; border:1px solid #f0f0f0;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:12px 16px; text-align:left; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Product</th>
                <th style="padding:12px 16px; text-align:center; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Size</th>
                <th style="padding:12px 16px; text-align:center; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Qty</th>
                <th style="padding:12px 16px; text-align:right; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- TOTAL -->
      <tr>
        <td style="padding:20px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, #ea580c 0%, #f97316 100%); border-radius:12px; padding:20px;">
            <tr>
              <td style="color:rgba(255,255,255,0.9); font-size:14px; padding:4px 0;">Items: ${data.cart.length} | Qty: ${data.cart.reduce((s, i) => s + i.qty, 0)}</td>
              <td></td>
            </tr>
            <tr>
              <td style="color:#fff; font-size:18px; font-weight:800;">💰 Total (COD)</td>
              <td style="color:#fff; font-size:28px; font-weight:900; text-align:right;">₹${data.total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ACTION BUTTONS -->
      <tr>
        <td style="padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:8px;">
                <a href="tel:+91${data.phone}" style="display:block; background:#16a34a; color:#fff; text-align:center; padding:14px; border-radius:12px; font-size:15px; font-weight:700; text-decoration:none;">📞 Call Customer</a>
              </td>
              <td style="padding-left:8px;">
                <a href="https://wa.me/91${data.phone}?text=Hello%20${encodeURIComponent(data.name)}%2C%20your%20order%20%23${orderNumber}%20at%20${storeName}%20is%20confirmed!%20Total%3A%20%E2%82%B9${data.total}%20COD.%20%F0%9F%9B%92" style="display:block; background:#25D366; color:#fff; text-align:center; padding:14px; border-radius:12px; font-size:15px; font-weight:700; text-decoration:none;">💬 WhatsApp Customer</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f9fafb; padding:20px 40px; text-align:center; border-top:1px solid #f0f0f0;">
          <p style="margin:0; color:#9ca3af; font-size:12px;">Order received via ${storeName} • COD Only • No Online Payment<br>
          <strong style="color:#6b7280;">${storeAddress}</strong></p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  // ---- CUSTOMER EMAIL HTML ----
  const customerEmailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:'Segoe UI', Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:30px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.10);">
      
      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding:40px; text-align:center;">
          <div style="font-size:56px; margin-bottom:12px;">✅</div>
          <h1 style="margin:0; color:#fff; font-size:30px; font-weight:900;">Order Confirmed!</h1>
          <p style="margin:8px 0 0; color:rgba(255,255,255,0.9); font-size:16px;">शुक्रिया ${data.name} जी! आपका ऑर्डर बुक हो गया है।</p>
        </td>
      </tr>

      <!-- ORDER NUMBER BADGE -->
      <tr>
        <td style="background:#f0fdf4; padding:20px 40px; text-align:center; border-bottom:2px solid #bbf7d0;">
          <p style="margin:0; color:#15803d; font-size:14px; font-weight:600;">Order Number</p>
          <p style="margin:4px 0 0; color:#14532d; font-size:28px; font-weight:900; letter-spacing:2px;">#${orderNumber}</p>
          <p style="margin:4px 0 0; color:#6b7280; font-size:12px;">${orderDate}</p>
        </td>
      </tr>

      <!-- HOW IT WORKS -->
      <tr>
        <td style="padding:28px 40px 0;">
          <h2 style="margin:0 0 16px; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:1px;">What happens next?</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0; vertical-align:top; width:40px; font-size:20px;">📦</td>
              <td style="padding:10px 0; font-size:13px; color:#374151; line-height:1.5;"><strong>We pack your order</strong> — Our team will carefully pack all your items fresh.</td>
            </tr>
            <tr>
              <td style="padding:10px 0; vertical-align:top; font-size:20px;">📞</td>
              <td style="padding:10px 0; font-size:13px; color:#374151; line-height:1.5;"><strong>We will call you</strong> at <strong style="color:#ea580c;">+91 ${data.phone}</strong> to confirm your order and pickup/delivery details.</td>
            </tr>
            <tr>
              <td style="padding:10px 0; vertical-align:top; font-size:20px;">💵</td>
              <td style="padding:10px 0; font-size:13px; color:#374151; line-height:1.5;"><strong>Pay Cash on Delivery</strong> — No online payment needed. Total: <strong style="color:#16a34a; font-size:15px;">₹${data.total.toLocaleString('en-IN')}</strong></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- YOUR ORDER -->
      <tr>
        <td style="padding:24px 40px 0;">
          <h2 style="margin:0 0 16px; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:1px; border-left:4px solid #16a34a; padding-left:12px;">Your Order</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px; overflow:hidden; border:1px solid #f0f0f0;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:12px 16px; text-align:left; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase;">Product</th>
                <th style="padding:12px 16px; text-align:center; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase;">Qty</th>
                <th style="padding:12px 16px; text-align:right; font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${data.cart.map(item => `
              <tr>
                <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:13px; color:#1a1a1a;">${item.emoji || '📦'} ${item.name} <span style="color:#9ca3af; font-size:11px;">(${item.unit})</span></td>
                <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:13px; color:#555; text-align:center;">×${item.qty}</td>
                <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:13px; font-weight:700; color:#1a1a1a; text-align:right;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
              </tr>`).join('')}
              <tr style="background:#f0fdf4;">
                <td colspan="2" style="padding:16px; font-size:15px; font-weight:800; color:#15803d;">💰 Total (Cash on Delivery)</td>
                <td style="padding:16px; font-size:18px; font-weight:900; color:#15803d; text-align:right;">₹${data.total.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>

      <!-- DELIVERY DETAILS -->
      <tr>
        <td style="padding:24px 40px 0;">
          <h2 style="margin:0 0 16px; font-size:14px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:1px; border-left:4px solid #16a34a; padding-left:12px;">Delivery Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:12px; font-weight:700; color:#6b7280; width:80px;">🚚 Type</td>
              <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:13px; color:#111827;">
                <span style="background:${data.deliveryType === 'Home Delivery' ? '#dbeafe' : '#dcfce7'}; color:${data.deliveryType === 'Home Delivery' ? '#1d4ed8' : '#15803d'}; font-size:12px; font-weight:800; padding:3px 10px; border-radius:20px;">
                  ${data.deliveryType === 'Home Delivery' ? '🚚 Home Delivery' : '🏪 Self Pickup'}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:12px; font-weight:700; color:#6b7280; width:80px;">📍 Area</td>
              <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; font-size:13px; color:#111827;">${data.area}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px; font-size:12px; font-weight:700; color:#6b7280; vertical-align:top;">🏠 Address</td>
              <td style="padding:12px 16px; font-size:13px; color:#111827; line-height:1.6;">${data.address}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CALL TO ACTION -->
      <tr>
        <td style="padding:28px 40px;">
          <a href="tel:+91${ownerPhone}" style="display:block; background:linear-gradient(135deg, #ea580c 0%, #f97316 100%); color:#fff; text-align:center; padding:16px; border-radius:14px; font-size:16px; font-weight:800; text-decoration:none;">📞 Call Us: +91 ${ownerPhone}</a>
          <p style="margin:12px 0 0; text-align:center; color:#9ca3af; font-size:12px;">या WhatsApp करें • Or WhatsApp us</p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f9fafb; padding:24px 40px; text-align:center; border-top:1px solid #f0f0f0;">
          <p style="margin:0; color:#ea580c; font-size:18px; font-weight:800;">${storeName}</p>
          <p style="margin:6px 0 0; color:#9ca3af; font-size:12px; line-height:1.6;">${storeAddress}<br>COD Only • Pre-order & Save Time<br>ऑर्डर के लिए धन्यवाद! 🙏</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  // Setup Gmail transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    const ownerEmail = process.env.OWNER_EMAIL || 'chaharanil568@gmail.com';

    // Send to owner
    await transporter.sendMail({
      from: `"${storeName}" <${process.env.GMAIL_USER}>`,
      to: ownerEmail,
      subject: `🛒 New Order #${orderNumber} — ₹${data.total} COD — ${data.name} (${data.phone})`,
      html: ownerEmailHTML,
    });

    // Send to customer if email provided
    if (data.email) {
      await transporter.sendMail({
        from: `"${storeName}" <${process.env.GMAIL_USER}>`,
        to: data.email,
        subject: `✅ Order Confirmed! #${orderNumber} — ${storeName}`,
        html: customerEmailHTML,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, orderNumber }),
    };
  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
