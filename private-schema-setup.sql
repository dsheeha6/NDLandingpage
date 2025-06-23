-- Create private schema for audit submissions
-- This will bypass RLS issues and give you full control

-- Create the private schema
CREATE SCHEMA IF NOT EXISTS private;

-- Create the audit_submissions table in the private schema
CREATE TABLE IF NOT EXISTS private.audit_submissions (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    business_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    website_url TEXT NOT NULL,
    qualified BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_private_audit_submissions_email ON private.audit_submissions(email);
CREATE INDEX IF NOT EXISTS idx_private_audit_submissions_created_at ON private.audit_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_private_audit_submissions_qualified ON private.audit_submissions(qualified);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION private.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_private_audit_submissions_updated_at 
    BEFORE UPDATE ON private.audit_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION private.update_updated_at_column();

-- Create a function to insert data (this will be called from your server)
CREATE OR REPLACE FUNCTION public.insert_audit_submission(
    p_full_name TEXT,
    p_email TEXT,
    p_business_name TEXT,
    p_industry TEXT,
    p_website_url TEXT,
    p_qualified BOOLEAN,
    p_status TEXT
)
RETURNS JSON AS $$
DECLARE
    new_id BIGINT;
    result JSON;
BEGIN
    -- Insert into private schema
    INSERT INTO private.audit_submissions (
        full_name, email, business_name, industry, website_url, qualified, status
    ) VALUES (
        p_full_name, p_email, p_business_name, p_industry, p_website_url, p_qualified, p_status
    ) RETURNING id INTO new_id;
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'id', new_id,
        'message', 'Audit submission created successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create audit submission'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.insert_audit_submission TO anon;
GRANT EXECUTE ON FUNCTION public.insert_audit_submission TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_audit_submission TO service_role;

-- Create a function to get audit submissions (for admin use)
CREATE OR REPLACE FUNCTION public.get_audit_submissions()
RETURNS TABLE (
    id BIGINT,
    full_name TEXT,
    email TEXT,
    business_name TEXT,
    industry TEXT,
    website_url TEXT,
    qualified BOOLEAN,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.full_name,
        a.email,
        a.business_name,
        a.industry,
        a.website_url,
        a.qualified,
        a.status,
        a.created_at
    FROM private.audit_submissions a
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the get function (only for authenticated users)
GRANT EXECUTE ON FUNCTION public.get_audit_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_submissions TO service_role;

-- Create views for easier access
CREATE OR REPLACE VIEW public.qualified_submissions AS
SELECT * FROM private.audit_submissions 
WHERE qualified = true 
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW public.recent_submissions AS
SELECT * FROM private.audit_submissions 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Grant access to views (only for authenticated users)
GRANT SELECT ON public.qualified_submissions TO authenticated;
GRANT SELECT ON public.recent_submissions TO authenticated; 