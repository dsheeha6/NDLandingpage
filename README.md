# Free Website Audit Landing Page - Nomadic Designs

A responsive landing page for offering free website audits, built with HTML, TailwindCSS, JavaScript, Supabase integration, and Resend email service.

## Features

### 🎯 Landing Page
- **Headline**: "Get a Free Audit of Your Website"
- **Subheadline**: "Find out what's holding your site back — and how to fix it."
- **CTA Button**: Smooth scrolls to form section
- **Responsive Design**: Works on all device sizes
- **Modern Dark Theme**: Matches Nomadic Designs branding

### 📋 Form Fields
- Full Name
- Email Address
- Business Name
- Industry (dropdown selection)
- Website URL

### ⚙️ Functionality
- **Form Validation**: Client-side validation for all fields
- **Qualification Logic**: Automatically checks if business qualifies
- **Supabase Integration**: Real-time database storage
- **Resend Email Integration**: Professional HTML emails sent automatically
- **Mailing List**: Placeholder for Mailchimp integration
- **Thank You Message**: Displays after successful submission

### 🎨 Design Features
- Dark theme with green accents
- Smooth scrolling navigation
- Responsive grid layout
- Modern UI components
- Loading states and animations

## Setup Instructions

### 1. Supabase Setup

1. **Go to your Supabase dashboard**: https://app.supabase.com
2. **Open the SQL Editor** in your project
3. **Run the SQL from `supabase-setup.sql`** to create the required table
4. **Verify the table was created** in the Table Editor

### 2. Resend Email Setup

1. **Create a Resend account**: https://resend.com
2. **Get your API key** from the Resend dashboard
3. **Create a `.env` file** in the project root with:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   PORT=3000
   ```

### 3. Server Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **For development** (auto-restart on changes):
   ```bash
   npm run dev
   ```

### 4. Landing Page Setup

1. **Open `index.html`** in a web browser
2. **Or access via server**: http://localhost:3000

## File Structure

```
├── index.html              # Main landing page
├── script.js               # JavaScript functionality with Supabase
├── server.js               # Node.js server with Resend integration
├── package.json            # Node.js dependencies
├── supabase-setup.sql      # Database schema setup
└── README.md              # This file
```

## Supabase Integration

The landing page is now fully integrated with Supabase:

### Database Schema
- **Table**: `audit_submissions`
- **Fields**: full_name, email, business_name, industry, website_url, qualified, status, created_at
- **Indexes**: Optimized for email lookups and date sorting
- **Security**: Row Level Security enabled with appropriate policies

### Current Configuration
- **URL**: https://ukkivmckuorbufstzphm.supabase.co
- **Status**: ✅ Connected and ready
- **Fallback**: localStorage if Supabase is unavailable

## Resend Email Integration

### Email Features
- **Professional HTML emails** with Nomadic Designs branding
- **Automatic sending** based on qualification status
- **Customized content** for qualified vs non-qualified submissions
- **Responsive email design** that works on all devices

### Email Templates
- **Qualified Users**: Detailed next steps and audit information
- **Non-Qualified Users**: Thank you message with review timeline
- **Branded Design**: Matches landing page styling

### Current Configuration
- **API Key**: Configured via environment variables
- **From Address**: onboarding@resend.dev
- **Status**: ✅ Ready for production

## API Integration Status

### ✅ Completed
- **Supabase Database**: Fully integrated and tested
- **Resend Email Service**: Professional HTML emails with templates
- **Form Validation**: Client-side validation implemented
- **Qualification Logic**: Automatic business qualification
- **Error Handling**: Graceful fallbacks and error messages
- **Server API**: RESTful endpoints for email sending

### 🔄 Pending Integration
- **Mailing List**: `addToMailingList()` - Replace with Mailchimp API

### Example Mailchimp Integration

```javascript
// Replace addToMailingList function
async function addToMailingList(email, name) {
    const response = await fetch('/api/add-to-mailing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
    });
    
    return response.json();
}
```

## Server Endpoints

### POST `/api/send-email`
Sends confirmation emails via Resend
- **Body**: `{ email, name, isQualified, businessName, websiteUrl }`
- **Response**: `{ success: true, messageId: "..." }`

### GET `/api/health`
Health check endpoint
- **Response**: `{ status: "OK", message: "..." }`

## Customization

### Colors
The color scheme can be modified in the TailwindCSS config:

```javascript
colors: {
    'nomadic-green': '#10B981',    // Primary green
    'nomadic-dark': '#111827',     // Dark background
    'nomadic-darker': '#0F172A'    // Darker elements
}
```

### Email Templates
Modify the `generateEmailHTML()` function in `server.js` to customize email content and styling.

### Qualification Logic
Modify the `checkQualification()` function in `script.js` to adjust business qualification criteria.

### Form Fields
Add or remove form fields by editing the form section in `index.html` and updating the validation logic in `script.js`.

## Database Queries

### View All Submissions
```sql
SELECT * FROM audit_submissions ORDER BY created_at DESC;
```

### View Qualified Submissions Only
```sql
SELECT * FROM audit_submissions WHERE qualified = true ORDER BY created_at DESC;
```

### View Recent Submissions (Last 30 Days)
```sql
SELECT * FROM audit_submissions 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

## Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Deployment
1. **Set environment variables** on your hosting platform
2. **Deploy to Vercel, Netlify, or Heroku**
3. **Update server URL** in `script.js` for production

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contact

- **Website**: https://nomadicdesigns.us
- **Email**: daniel.sheehan03@gmail.com

## License

This project is created for Nomadic Designs. All rights reserved. 