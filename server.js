const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend with environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Load email template
function loadEmailTemplate() {
    try {
        const templatePath = path.join(__dirname, 'email-template.html');
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error('Error loading email template:', error);
        return null;
    }
}

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const { email, name, isQualified, businessName, websiteUrl } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }
        
        // Load the email template
        let emailTemplate = loadEmailTemplate();
        if (!emailTemplate) {
            return res.status(500).json({ error: 'Email template not found' });
        }
        
        // Replace placeholders in the template
        emailTemplate = emailTemplate.replace('[Name]', name);
        
        const subject = 'Your Website Audit Request - Nomadic Designs';
        
        const { data, error } = await resend.emails.send({
            from: 'hello@nomadicdesigns.us',
            to: email,
            subject: subject,
            html: emailTemplate
        });
        
        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: error.message });
        }
        
        console.log('Confirmation email sent successfully:', data);
        res.json({ success: true, messageId: data.id });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Form submission endpoint that automatically sends email
app.post('/api/submit-form', async (req, res) => {
    try {
        const { fullName, email, businessName, industry, websiteUrl } = req.body;
        
        if (!fullName || !email || !businessName || !websiteUrl) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        
        // First, send the confirmation email
        const emailTemplate = loadEmailTemplate();
        if (emailTemplate) {
            // Replace all placeholders in the template
            let personalizedTemplate = emailTemplate
                .replace(/\[Name\]/g, fullName)
                .replace(/\[BusinessName\]/g, businessName)
                .replace(/\[WebsiteUrl\]/g, websiteUrl)
                .replace(/\[Industry\]/g, industry || 'Not specified');
            
            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'hello@nomadicdesigns.us',
                to: email,
                subject: "We've received your website audit request",
                html: personalizedTemplate
            });
            
            if (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            } else {
                console.log('Confirmation email sent successfully:', emailData.id);
            }
        }
        
        // Return success response
        res.json({ 
            success: true, 
            message: 'Form submitted successfully and confirmation email sent',
            emailSent: !!emailTemplate
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ error: 'Failed to process form submission' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Nomadic Designs Audit Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email API available at http://localhost:${PORT}/api/send-email`);
    console.log(`📝 Form submission API at http://localhost:${PORT}/api/submit-form`);
    console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
}); 