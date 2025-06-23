// Supabase configuration
const supabaseUrl = 'https://ukkivmckuorbufstzphm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVra2l2bWNrdW9yYnVmc3R6cGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0Mjg4OTQsImV4cCI6MjA2NjAwNDg5NH0.fBwGUB8AY5T-AHATA_lPOelU6NImQeCCHQjt6Qs3fBs';

// Initialize Supabase client
let supabase;

// Initialize Supabase client when page loads
function initializeSupabase() {
    try {
        console.log('Initializing Supabase client...');
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized successfully');
        
        // Test the connection
        testSupabaseConnection();
        
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        // Test with the new function
        const { data, error } = await supabase
            .rpc('insert_audit_submission', {
                p_full_name: 'Test Connection',
                p_email: 'test@connection.com',
                p_business_name: 'Test Business',
                p_industry: 'test',
                p_website_url: 'https://testconnection.com',
                p_qualified: false,
                p_status: 'Not Qualified'
            });
        
        if (error) {
            console.error('Supabase connection test failed:', error);
        } else {
            console.log('Supabase connection test successful');
            // Clean up test data
            console.log('Test submission created with ID:', data.id);
        }
    } catch (error) {
        console.error('Connection test error:', error);
    }
}

// Initialize Supabase when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    
    const form = document.getElementById('auditForm');
    form.addEventListener('submit', handleFormSubmission);
});

// Smooth scroll to form
function scrollToForm() {
    const formSection = document.getElementById('audit-form');
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// Handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        businessName: formData.get('businessName'),
        industry: formData.get('industry'),
        websiteUrl: formData.get('websiteUrl')
    };
    
    // Validate form data
    if (!validateForm(data)) {
        return;
    }
    
    // Check if business qualifies
    const isQualified = checkQualification(data);
    console.log('Qualification result:', isQualified);
    
    // Get the submit button early
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Submit to Supabase using the new function
        console.log('Attempting to submit to Supabase...');
        const dbResult = await submitToDatabase(data, isQualified);
        console.log('Database submission result:', dbResult);
        
        // Add to mailing list (placeholder for Mailchimp)
        await addToMailingList(data.email, data.fullName);
        
        // Show success message
        showThankYouMessage();
        
        // Reset form
        event.target.reset();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error submitting your request. Please try again.');
    } finally {
        // Always reset button state, even if there's an error
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        console.log('Button reset to:', originalText);
    }
}

// Validate form data
function validateForm(data) {
    const requiredFields = ['fullName', 'email', 'businessName', 'industry', 'websiteUrl'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    // Validate website URL
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(data.websiteUrl)) {
        alert('Please enter a valid website URL starting with http:// or https://');
        return false;
    }
    
    return true;
}

// Check if business qualifies
function checkQualification(data) {
    // Simple qualification logic
    const websiteUrl = data.websiteUrl.toLowerCase();
    
    // Disqualify if URL contains placeholder text
    const placeholderTerms = ['example.com', 'placeholder', 'test.com', 'demo.com', 'sample.com'];
    if (placeholderTerms.some(term => websiteUrl.includes(term))) {
        return false;
    }
    
    // Disqualify if URL is too short (likely not a real website)
    if (websiteUrl.length < 15) {
        return false;
    }
    
    // Basic qualification criteria met
    return true;
}

// Submit to Supabase database using the new function
async function submitToDatabase(data, isQualified) {
    try {
        console.log('Starting database submission...');
        
        if (!supabase) {
            console.error('Supabase client not initialized');
            throw new Error('Supabase client not initialized');
        }
        
        console.log('Supabase client available, submitting data via function...');
        
        // Use the new function instead of direct table access
        const { data: result, error } = await supabase
            .rpc('insert_audit_submission', {
                p_full_name: data.fullName,
                p_email: data.email,
                p_business_name: data.businessName,
                p_industry: data.industry,
                p_website_url: data.websiteUrl,
                p_qualified: isQualified,
                p_status: isQualified ? 'Qualified' : 'Not Qualified'
            });
        
        if (error) {
            console.error('Supabase function error:', error);
            throw error;
        }
        
        console.log('Successfully submitted to Supabase via function:', result);
        return result;
        
    } catch (error) {
        console.error('Database submission error:', error);
        
        // Fallback to localStorage if Supabase fails
        console.log('Falling back to localStorage...');
        const submissionData = {
            full_name: data.fullName,
            email: data.email,
            business_name: data.businessName,
            industry: data.industry,
            website_url: data.websiteUrl,
            qualified: isQualified,
            status: isQualified ? 'Qualified' : 'Not Qualified',
            created_at: new Date().toISOString()
        };
        
        const submissions = JSON.parse(localStorage.getItem('auditSubmissions') || '[]');
        submissions.push(submissionData);
        localStorage.setItem('auditSubmissions', JSON.stringify(submissions));
        console.log('Data saved to localStorage:', submissions);
        
        return { success: true, fallback: true };
    }
}

// Add to mailing list (placeholder for Mailchimp)
async function addToMailingList(email, name) {
    // This would be replaced with actual Mailchimp API call
    console.log('Adding to mailing list:', { email, name });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
}

// Show thank you message
function showThankYouMessage() {
    const thankYouDiv = document.getElementById('thankYouMessage');
    thankYouDiv.classList.remove('hidden');
}

// Hide thank you message
function hideThankYouMessage() {
    const thankYouDiv = document.getElementById('thankYouMessage');
    thankYouDiv.classList.add('hidden');
}

// Close thank you message when clicking outside
document.addEventListener('click', function(event) {
    const thankYouDiv = document.getElementById('thankYouMessage');
    if (event.target === thankYouDiv) {
        hideThankYouMessage();
    }
});

// Close thank you message with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideThankYouMessage();
    }
}); 