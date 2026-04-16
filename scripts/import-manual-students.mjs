import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const rootDir = process.cwd();

function parseArgs(argv) {
  const args = { file: 'data/students.manual.json', apply: false, skipDuplicates: true };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    } else if (token === '--apply') {
      args.apply = true;
    } else if (token === '--no-skip-duplicates') {
      args.skipDuplicates = false;
    }
  }

  return args;
}

function toIsoDob(rawDob) {
  const value = String(rawDob || '').trim();
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const dmy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}

function extractMobileNumbers(rawMobile) {
  const value = String(rawMobile || '').trim();
  if (!value) return [];

  const parts = value.split(/[;,/]/).map((p) => p.trim()).filter(Boolean);
  const numbers = [];

  for (const part of parts) {
    const digits = part.replace(/\D/g, '');
    if (/^[6-9]\d{9}$/.test(digits) && !numbers.includes(digits)) {
      numbers.push(digits);
    }
    if (numbers.length >= 2) {
      break;
    }
  }

  if (numbers.length === 0) {
    const fallbackDigits = value.replace(/\D/g, '');
    if (/^[6-9]\d{9}$/.test(fallbackDigits)) {
      numbers.push(fallbackDigits);
    }
  }

  return numbers;
}

function normalizeClass(rawClass) {
  const value = String(rawClass || '').trim();
  if (!value) return '';
  const match = value.match(/\d+/);
  return match ? match[0] : value;
}

function normalizeStudent(raw, index) {
  const fullName = String(raw.full_name || raw.name || '').trim();
  const dateOfBirth = toIsoDob(raw.date_of_birth || raw.dob);
  const parsedMobileNumbers = extractMobileNumbers(raw.contact_number || raw.mobile_number);
  const contactNumber = parsedMobileNumbers[0] || '';
  const secondContactNumber = parsedMobileNumbers[1] || String(raw.mobile_number_2 || raw.secondary_mobile_number || raw.second_mobile_number || '').trim().replace(/\D/g, '');
  const studentClass = normalizeClass(raw.class);

  const missing = [];
  if (!fullName) missing.push('name');
  if (!dateOfBirth) missing.push('dob');
  if (!contactNumber) missing.push('mobile_number');
  if (!studentClass) missing.push('class');

  if (missing.length > 0) {
    return {
      ok: false,
      index,
      reason: `Missing/invalid fields: ${missing.join(', ')}`,
      source: raw,
    };
  }

  return {
    ok: true,
    student: {
      full_name: fullName,
      date_of_birth: dateOfBirth,
      contact_number: contactNumber,
      second_contact_number: /^[6-9]\d{9}$/.test(secondContactNumber) ? secondContactNumber : '',
      class: studentClass,
      gender: String(raw.gender || 'Male').trim() || 'Male',
      father_name: String(raw.father_name || 'N/A').trim() || 'N/A',
      mother_name: String(raw.mother_name || 'N/A').trim() || 'N/A',
      email: String(raw.email || 'na@visiona.local').trim() || 'na@visiona.local',
      current_school: String(raw.current_school || `${String(raw.medium || '').trim() || 'General'} Medium`).trim(),
      city: String(raw.city || 'N/A').trim() || 'N/A',
      state: String(raw.state || 'N/A').trim() || 'N/A',
      admission_number: String(raw.admission_number || '').trim(),
      admission_type: String(raw.admission_type || 'Direct Admin Entry').trim() || 'Direct Admin Entry',
      category: String(raw.category || 'General').trim() || 'General',
      exams_preparing_for: Array.isArray(raw.exams_preparing_for) && raw.exams_preparing_for.length > 0
        ? raw.exams_preparing_for
        : ['sainik'],
    },
  };
}

function loadEnvFromDotEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue;
    }

    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getSupabaseConfig() {
  loadEnvFromDotEnv();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY. Set them in environment or .env file.'
    );
  }

  return { supabaseUrl, serviceRoleKey };
}

function tryGetSupabaseConfig() {
  try {
    return getSupabaseConfig();
  } catch {
    return null;
  }
}

function createAdmissionNumber() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ADM${year}${random}`;
}

function toApplicationInsert(student) {
  const today = new Date().toISOString().split('T')[0];

  return {
    admission_number: student.admission_number || createAdmissionNumber(),
    admission_type: student.admission_type,
    full_name: student.full_name,
    date_of_birth: student.date_of_birth,
    gender: student.gender,
    current_school: student.current_school,
    class: student.class,
    aadhaar_number: 'N/A',
    father_name: student.father_name,
    mother_name: student.mother_name,
    father_occupation: 'N/A',
    mother_occupation: 'N/A',
    contact_number: student.contact_number,
    second_contact_number: student.second_contact_number || null,
    email: student.email,
    sats_number: '',
    street_address: 'N/A',
    city: student.city,
    state: student.state,
    pin_code: '000000',
    landmark: null,
    last_year_percentage: 0,
    category: student.category,
    subjects_weak_in: null,
    exams_preparing_for: student.exams_preparing_for,
    payment_mode: 'Direct Entry',
    transaction_id: `ADMIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amount_paid: 0,
    place: 'Admin Office',
    declaration_date: today,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetPath = path.isAbsolute(args.file) ? args.file : path.join(rootDir, args.file);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Input file not found: ${targetPath}`);
  }

  const rawJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const list = Array.isArray(rawJson) ? rawJson : rawJson.students;

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('No students found. Use an array or {"students": [...]} in JSON file.');
  }

  const normalized = list.map((item, i) => normalizeStudent(item, i));
  const students = normalized.filter((x) => x.ok).map((x) => x.student);
  const invalid = normalized.filter((x) => !x.ok);

  if (invalid.length > 0) {
    const invalidPath = path.join(rootDir, 'data', 'students.manual.invalid.json');
    fs.writeFileSync(
      invalidPath,
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          invalid_count: invalid.length,
          invalid_rows: invalid,
        },
        null,
        2
      ),
      'utf8'
    );
    console.log(`Wrote invalid rows report: ${invalidPath}`);
  }

  if (students.length === 0) {
    throw new Error('No valid student rows found after normalization. Check data/students.manual.invalid.json.');
  }

  const config = args.apply ? getSupabaseConfig() : tryGetSupabaseConfig();
  const supabase = config
    ? createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    : null;

  if (!supabase && args.apply) {
    throw new Error('SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required for --apply mode.');
  }

  if (!supabase) {
    console.log('No Supabase credentials found. Running dry-run without duplicate checks.');
  }

  let inserted = 0;
  let skipped = 0;

  for (const student of students) {
    let duplicate = null;

    if (args.skipDuplicates && supabase) {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name')
        .eq('contact_number', student.contact_number)
        .eq('date_of_birth', student.date_of_birth)
        .maybeSingle();

      if (error) {
        throw new Error(`Duplicate check failed for ${student.full_name}: ${error.message}`);
      }

      duplicate = data;
    }

    if (duplicate) {
      skipped += 1;
      console.log(`SKIP duplicate: ${student.full_name} (${student.contact_number}, ${student.date_of_birth})`);
      continue;
    }

    const payload = toApplicationInsert(student);

    if (!args.apply) {
      inserted += 1;
      console.log(`DRY-RUN insert: ${payload.full_name} -> admission_number=${payload.admission_number}`);
      continue;
    }

    const { error } = await supabase.from('applications').insert(payload);
    if (error) {
      throw new Error(`Insert failed for ${student.full_name}: ${error.message}`);
    }

    inserted += 1;
    console.log(`INSERTED: ${student.full_name} -> admission_number=${payload.admission_number}`);
  }

  console.log('');
  console.log(`Done. Valid rows: ${students.length}, Invalid rows: ${invalid.length}, Inserted: ${inserted}, Skipped: ${skipped}, Apply mode: ${args.apply ? 'YES' : 'NO (dry-run)'}`);
  if (!args.apply) {
    console.log('Run with --apply to actually insert records.');
  }
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
