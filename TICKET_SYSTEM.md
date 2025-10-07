# DRESTEIN Event Pass Ticket Generation System

## Overview
This system automatically generates beautiful, professional PDF tickets for users who purchase event passes through CCAvenue payment gateway.

## Features
- ✅ **Automatic Ticket Generation**: Tickets are generated on-demand after successful payment
- ✅ **QR Code Integration**: Each ticket contains a unique QR code for verification
- ✅ **Beautiful Design**: Modern, gradient-based design with professional layout
- ✅ **Secure**: Only verified pass holders can download tickets
- ✅ **PDF Format**: High-quality PDF tickets ready for printing or digital use

## System Components

### 1. Ticket Template (`src/lib/ticketTemplate.js`)
- HTML/CSS template with modern design
- Dynamic fields for user information
- Responsive and print-friendly
- Includes:
  - Pass holder name
  - Email address
  - Order ID
  - Purchase date
  - Amount paid
  - Unique Pass ID
  - QR code for verification

### 2. Ticket Generation API (`src/app/api/tickets/generate/route.js`)
**Endpoint**: `POST /api/tickets/generate`

**Authentication**: Required (Firebase Auth Bearer token)

**Request Body**:
```json
{
  "passId": "string"
}
```

**Response**: PDF file download

**Process**:
1. Verifies user authentication
2. Fetches pass details from Firestore
3. Validates pass ownership and status
4. Generates QR code with pass verification data
5. Populates HTML template with user data
6. Uses Puppeteer to render HTML to PDF
7. Returns PDF as downloadable file

### 3. Payment Callback Integration (`src/app/api/payments/ccavenue/callback/route.js`)
- Automatically updates pass status after successful payment
- Marks pass as "active" and "paymentVerified: true"
- Stores gateway response for audit trail
- Enables ticket generation for verified passes

### 4. User Interface (`src/app/my-ticket/page.jsx`)
- Displays pass details
- Shows verification status
- Download button for active passes
- Responsive design with loading states

## User Flow

1. **Purchase Event Pass**
   - User initiates payment via `/api/payments/ccavenue/initiate`
   - Redirected to CCAvenue payment gateway

2. **Payment Completion**
   - CCAvenue sends callback to `/api/payments/ccavenue/callback`
   - System updates pass status to "active"
   - Sets `paymentVerified: true`

3. **Access Ticket**
   - User navigates to `/my-ticket`
   - System fetches their pass details
   - If pass is active, download button is enabled

4. **Download Ticket**
   - User clicks "Download Ticket PDF"
   - System generates PDF with QR code
   - PDF downloads automatically

## Ticket Information Displayed

### User Details
- **Pass Holder Name**: From Firebase Auth or email
- **Email Address**: User's registered email
- **Pass ID**: Unique Firestore document ID

### Transaction Details
- **Order ID**: CCAvenue order identifier
- **Purchase Date**: Formatted date of purchase
- **Amount Paid**: Transaction amount in INR

### Verification
- **QR Code**: Contains JSON data:
  ```json
  {
    "passId": "unique-pass-id",
    "userUid": "firebase-user-id",
    "orderId": "ccavenue-order-id",
    "timestamp": 1234567890
  }
  ```

## Installation

1. **Install Dependencies**:
```bash
npm install puppeteer qrcode
```

2. **Environment Variables** (already configured):
```env
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_ACCESS_CODE=your_access_code
CCAVENUE_WORKING_KEY=your_working_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_BASE_URL=https://drestein.vercel.app
```

3. **Deploy**:
- System works on Vercel with Node.js runtime
- Puppeteer is supported on Vercel with proper configuration

## Security Features

1. **Authentication Required**: Only authenticated users can generate tickets
2. **Ownership Validation**: Users can only download their own tickets
3. **Status Verification**: Only active, verified passes can generate tickets
4. **QR Code Verification**: Each QR contains timestamp and unique identifiers

## Customization

### Modify Ticket Design
Edit `src/lib/ticketTemplate.js`:
- Change colors in CSS gradients
- Update logo/branding
- Add/remove fields
- Modify layout

### Add Additional Fields
1. Update `generateTicketHTML()` function parameters
2. Add fields to HTML template
3. Pass data from API endpoint

### Change QR Code Content
Modify the `qrData` object in `/api/tickets/generate/route.js`:
```javascript
const qrData = JSON.stringify({
  passId: passId,
  userUid: passData.userUid,
  // Add more fields here
});
```

## Troubleshooting

### Puppeteer Issues on Vercel
If Puppeteer fails on Vercel:
1. Ensure `export const runtime = "nodejs"` is set
2. Add Puppeteer config in `next.config.js`:
```javascript
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer']
  }
}
```

### QR Code Not Generating
- Check `qrcode` package is installed
- Verify data being passed to `generateQRCode()`
- Check console for errors

### PDF Not Downloading
- Verify response headers are correct
- Check browser console for errors
- Ensure PDF buffer is being returned properly

## Future Enhancements

- [ ] Email ticket automatically after purchase
- [ ] Add ticket to Apple Wallet / Google Pay
- [ ] Bulk ticket generation for admins
- [ ] Ticket verification scanner app
- [ ] Custom ticket templates per event type
- [ ] Multi-language support

## Support

For issues or questions, check:
- Console logs in browser DevTools
- Server logs in Vercel dashboard
- Firestore data structure
- CCAvenue callback responses
