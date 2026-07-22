-- Create attendance and session logging tables (CMPS:SE-FO-11)

CREATE TABLE IF NOT EXISTS student_attendance_session_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  month_year VARCHAR(50) NOT NULL,
  program_enrolled VARCHAR(100),
  facilitator_signature TEXT,
  signoff_date DATE,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS student_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES student_attendance_session_forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'Present', 'Absent', 'Excused'
  time_in VARCHAR(10),
  time_out VARCHAR(10),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_session_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES student_attendance_session_forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  domain VARCHAR(100),
  activity VARCHAR(255),
  assistance VARCHAR(50),
  prompts VARCHAR(50),
  cues VARCHAR(50),
  prodding VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_attendance_session_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_session_records ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and write for simplicity
CREATE POLICY "Allow authenticated read on forms" ON student_attendance_session_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on forms" ON student_attendance_session_forms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on forms" ON student_attendance_session_forms FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on attendance" ON student_attendance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on attendance" ON student_attendance_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on attendance" ON student_attendance_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on attendance" ON student_attendance_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on sessions" ON student_session_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on sessions" ON student_session_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on sessions" ON student_session_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on sessions" ON student_session_records FOR DELETE TO authenticated USING (true);
