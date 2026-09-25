-- ==============================================================================
-- COOLO.IN — Database Architecture Migration
-- Brand: COOLO (Air & Cooling Solutions)
-- Target: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'REQUESTED',
        'CONFIRMED',
        'ASSIGNED',
        'TECHNICIAN_ON_THE_WAY',
        'IN_PROGRESS',
        'WAITING_FOR_APPROVAL',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ac_type AS ENUM ('Split', 'Window', 'Cassette', 'Ducted', 'Other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('ASSIGNED', 'ACCEPTED', 'REJECTED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE estimate_status AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('UPI', 'RAZORPAY', 'CARD', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE (Extensions to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    full_name TEXT NOT NULL,
    mobile VARCHAR(15),
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TECHNICIANS TABLE
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    skills TEXT[] DEFAULT '{}',
    experience_years NUMERIC(3, 1) DEFAULT 1.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    current_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_JOB, OFF_DUTY
    rating_avg NUMERIC(3, 2) DEFAULT 5.0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SERVICE AREAS (Bangalore initial focus)
CREATE TABLE IF NOT EXISTS public.service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    area_name VARCHAR(150) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_city_area UNIQUE (city, area_name)
);

-- 7. SERVICE CATEGORIES
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Wrench',
    image_url TEXT,
    starting_price NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRICING MATRIX
CREATE TABLE IF NOT EXISTS public.pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    ac_type ac_type NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    additional_unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    labour_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    minimum_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_service_ac_type UNIQUE (service_id, ac_type)
);

-- 10. ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    area VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    pincode VARCHAR(10) NOT NULL,
    landmark TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. BOOKINGS SEQUENCE AND TABLE
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        NEW.booking_number := 'COOLO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('booking_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    ac_type ac_type NOT NULL DEFAULT 'Split',
    ac_brand VARCHAR(100),
    ac_age VARCHAR(50),
    problem_description TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    status booking_status NOT NULL DEFAULT 'REQUESTED',
    scheduled_date DATE NOT NULL,
    scheduled_time_slot VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email VARCHAR(150),
    address_snapshot JSONB NOT NULL,
    estimated_price NUMERIC(10, 2),
    final_amount NUMERIC(10, 2),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_set_booking_number
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_number();

-- 12. BOOKING STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    from_status booking_status,
    to_status booking_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to record booking status transitions
CREATE OR REPLACE FUNCTION record_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.booking_status_history (booking_id, from_status, to_status, notes)
        VALUES (NEW.id, NULL, NEW.status, 'Initial booking created');
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.booking_status_history (booking_id, from_status, to_status, notes)
        VALUES (NEW.id, OLD.status, NEW.status, 'Status updated');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_record_booking_status
    AFTER INSERT OR UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION record_booking_status_change();

-- 13. TECHNICIAN ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.technician_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
    status assignment_status NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SERVICE ESTIMATES & ESTIMATE ITEMS
CREATE TABLE IF NOT EXISTS public.service_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status estimate_status NOT NULL DEFAULT 'PENDING_APPROVAL',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES public.service_estimates(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- PART, LABOUR, GAS, OTHER
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SERVICE RECORDS (Technician Job Completion Log)
CREATE TABLE IF NOT EXISTS public.service_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
    diagnosis_notes TEXT,
    work_performed TEXT NOT NULL,
    before_photos TEXT[] DEFAULT '{}',
    after_photos TEXT[] DEFAULT '{}',
    final_amount NUMERIC(10, 2),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. PARTS & INVENTORY ARCHITECTURE
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    unit_cost NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_record_id UUID NOT NULL REFERENCES public.service_records(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    status payment_status NOT NULL DEFAULT 'PENDING',
    transaction_reference VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP', -- IN_APP, EMAIL, SMS, WHATSAPP
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. ADMIN NOTES (Operational, Strictly Confidential)
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    is_internal_only BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. CONTACT REQUESTS
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, RESOLVED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON public.bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_mobile ON public.bookings(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_technician_assignments_booking ON public.technician_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_technician_assignments_tech ON public.technician_assignments(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_city_pincode ON public.service_areas(city, pincode);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_pricing_service_id ON public.pricing(service_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Public Catalog Policies (Services, Categories, Areas, Pricing)
CREATE POLICY "Public catalog is readable by everyone" 
    ON public.services FOR SELECT 
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public service categories are readable" 
    ON public.service_categories FOR SELECT 
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public service areas are readable" 
    ON public.service_areas FOR SELECT 
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public pricing is readable" 
    ON public.pricing FOR SELECT 
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Published reviews are readable by everyone" 
    ON public.reviews FOR SELECT 
    USING (is_published = TRUE OR public.is_admin());

-- 3. Bookings Policies
CREATE POLICY "Customers can view their own bookings" 
    ON public.bookings FOR SELECT 
    USING (
        auth.uid() IN (SELECT user_id FROM public.customers WHERE id = bookings.customer_id) 
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.technician_assignments ta
            JOIN public.technicians t ON ta.technician_id = t.id
            WHERE ta.booking_id = bookings.id AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create a booking" 
    ON public.bookings FOR INSERT 
    WITH CHECK (TRUE);

CREATE POLICY "Customers and Admins can update bookings" 
    ON public.bookings FOR UPDATE 
    USING (
        auth.uid() IN (SELECT user_id FROM public.customers WHERE id = bookings.customer_id)
        OR public.is_admin()
    );

-- 4. Technician Assignments
CREATE POLICY "Technicians can see assigned jobs" 
    ON public.technician_assignments FOR SELECT 
    USING (
        technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "Technicians can update job status" 
    ON public.technician_assignments FOR UPDATE 
    USING (
        technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid())
        OR public.is_admin()
    );

-- 5. Admin Notes
CREATE POLICY "Only admins can view and create internal notes" 
    ON public.admin_notes FOR ALL 
    USING (public.is_admin());

-- 6. Contact Requests
CREATE POLICY "Anyone can submit contact requests" 
    ON public.contact_requests FOR INSERT 
    WITH CHECK (TRUE);

CREATE POLICY "Only admins can view contact requests" 
    ON public.contact_requests FOR SELECT 
    USING (public.is_admin());

-- ==============================================================================
-- INITIAL SEED DATA (Bangalore Market Focus)
-- ==============================================================================
INSERT INTO public.service_categories (slug, name, description, display_order)
VALUES 
    ('residential', 'Residential Cooling', 'Comprehensive cooling and air treatment for apartments, villas and independent homes', 1),
    ('commercial', 'Commercial Cooling', 'High-capacity HVAC and cooling support for corporate spaces, retail and offices', 2)
ON CONFLICT (slug) DO NOTHING;

-- Seed Service Areas (Bangalore key zones)
INSERT INTO public.service_areas (city, state, area_name, pincode, is_active)
VALUES
    ('Bangalore', 'Karnataka', 'Indiranagar', '560038', TRUE),
    ('Bangalore', 'Karnataka', 'Whitefield', '560066', TRUE),
    ('Bangalore', 'Karnataka', 'HSR Layout', '560102', TRUE),
    ('Bangalore', 'Karnataka', 'Koramangala', '560034', TRUE),
    ('Bangalore', 'Karnataka', 'Marathahalli', '560037', TRUE),
    ('Bangalore', 'Karnataka', 'Brookefield', '560037', TRUE),
    ('Bangalore', 'Karnataka', 'Mahadevapura', '560048', TRUE),
    ('Bangalore', 'Karnataka', 'Electronic City', '560100', TRUE),
    ('Bangalore', 'Karnataka', 'BTM Layout', '560076', TRUE),
    ('Bangalore', 'Karnataka', 'Jayanagar', '560041', TRUE),
    ('Bangalore', 'Karnataka', 'JP Nagar', '560078', TRUE),
    ('Bangalore', 'Karnataka', 'Hebbal', '560024', TRUE),
    ('Bangalore', 'Karnataka', 'Yelahanka', '560064', TRUE),
    ('Bangalore', 'Karnataka', 'Kalyan Nagar', '560043', TRUE),
    ('Bangalore', 'Karnataka', 'HBR Layout', '560043', TRUE),
    ('Bangalore', 'Karnataka', 'KR Puram', '560036', TRUE),
    ('Bangalore', 'Karnataka', 'Bellandur', '560103', TRUE),
    ('Bangalore', 'Karnataka', 'Sarjapur Road', '560035', TRUE)
ON CONFLICT (city, area_name) DO NOTHING;

-- Seed Initial Services
INSERT INTO public.services (slug, name, short_description, full_description, icon_name, starting_price, display_order)
VALUES
    ('ac-repair', 'AC Repair', 'Comprehensive diagnosis and precision repair for cooling issues, electrical faults, and noise.', 'Our verified technicians diagnose compressor problems, sensor defects, fan motor issues, PCB failures, and unusual noises. Transparent diagnostic assessment before any parts are replaced.', 'Wrench', 499.00, 1),
    ('ac-service', 'AC Regular Service', 'Periodic servicing, thorough filter cleaning, and coil flush for peak seasonal cooling efficiency.', 'Preventive maintenance designed to lower energy bills and maximize cooling performance. Includes filter cleaning, indoor coil inspection, condenser wash, and airflow check.', 'Sparkles', 399.00, 2),
    ('ac-deep-cleaning', 'AC Deep Cleaning', 'High-pressure foam jet wash of indoor and outdoor coils to eliminate deep grime, mold, and odor.', 'Intensive antibacterial foam jet deep cleaning removes accumulated dust, grime, and microbial build-up from internal fan blowers and heat exchange fins.', 'Droplets', 699.00, 3),
    ('ac-installation', 'AC Installation', 'Standardized bracket mounting, precision copper piping, vacuuming, and commissioning for new ACs.', 'Professional mounting for Split and Window ACs with level alignment, proper drainage gradient, secure bracket anchoring, copper flare connection, and safety testing.', 'ShieldCheck', 1199.00, 4),
    ('ac-uninstallation', 'AC Uninstallation', 'Safe refrigerant pump-down, controlled electrical disconnection, and protective packaging for relocation.', 'Careful uninstallation preserving existing refrigerant gas in the outdoor unit, preventing loss and protecting pipe connectors for smooth relocation.', 'ArrowDownCircle', 649.00, 5),
    ('ac-gas-charging', 'AC Gas Charging', 'System leak testing, nitrogen pressure check, vacuuming, and precision manufacturer-spec refrigerant refill.', 'Professional leak detection in copper lines and flares followed by nitrogen pressure holding, deep vacuuming, and exact weight-based refrigerant top-up (R32, R410A).', 'Gauge', 1499.00, 6),
    ('ac-amc', 'AC AMC Packages', 'Annual maintenance contracts providing scheduled preventive tune-ups and priority breakdown response.', 'Hassle-free year-round cooling security for residences and villas with scheduled seasonal services, emergency call-out coverage, and discount on replacement parts.', 'CalendarCheck', 1999.00, 7),
    ('commercial-ac', 'Commercial AC & HVAC', 'Specialized cooling maintenance for retail outlets, offices, clinics, server rooms, and commercial spaces.', 'Commercial cooling solutions tailored for uptime and air comfort. Covers Cassette ACs, VRV/VRF systems, ductable units, and commercial air distribution systems.', 'Building2', 2499.00, 8)
ON CONFLICT (slug) DO NOTHING;
