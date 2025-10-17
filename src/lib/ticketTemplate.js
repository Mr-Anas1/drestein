// Modern Event Pass Ticket Template
export function generateTicketHTML(data) {
  const {
    passId,
    name,
    email,
    orderId,
    purchaseDate,
    amount,
    qrCodeData
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DRESTEIN Event Pass</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ticket-container {
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      max-width: 800px;
      width: 100%;
    }
    
    .ticket-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .ticket-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 30px 30px;
      animation: drift 20s linear infinite;
    }
    
    @keyframes drift {
      0% { transform: translate(0, 0); }
      100% { transform: translate(30px, 30px); }
    }
    
    .event-logo {
      font-size: 48px;
      font-weight: 900;
      color: white;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .event-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 18px;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }
    
    .ticket-body {
      padding: 40px;
    }
    
    .pass-type {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      display: inline-block;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 30px;
    }
    
    .ticket-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 30px;
    }
    
    .info-item {
      border-left: 4px solid #667eea;
      padding-left: 16px;
    }
    
    .info-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .info-value {
      font-size: 16px;
      color: #111827;
      font-weight: 600;
      word-break: break-word;
    }
    
    
    
    .ticket-footer {
      background: #f9fafb;
      padding: 24px 40px;
      border-top: 2px dashed #e5e7eb;
      text-align: center;
    }
    
    .pass-id {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
      letter-spacing: 2px;
    }
    
    .footer-note {
      margin-top: 12px;
      font-size: 12px;
      color: #9ca3af;
      line-style: italic;
    }
    
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
      margin: 30px 0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .ticket-container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <div class="event-logo">DRESTEIN</div>
      <div class="event-subtitle">Official Event Pass 2025</div>
    </div>
    
    <div class="ticket-body">
      <span class="pass-type">🎫 Event Pass</span>
      
      <div class="ticket-info">
        <div class="info-item">
          <div class="info-label">Pass Holder</div>
          <div class="info-value">${name}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Email Address</div>
          <div class="info-value">${email}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Order ID</div>
          <div class="info-value">${orderId}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Purchase Date</div>
          <div class="info-value">${purchaseDate}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Amount Paid</div>
          <div class="info-value">₹${amount}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value" style="color: #10b981;">✓ Verified</div>
        </div>
      </div>
      
      <div class="divider"></div>
    </div>
    
    <div class="ticket-footer">
      <div class="pass-id">PASS ID: ${passId}</div>
      <div class="footer-note">
        This pass grants access only to the events listed on this ticket. Please present this ticket at the venue.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
