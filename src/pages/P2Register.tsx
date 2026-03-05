import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Phone, User, Check, Loader2, Search, Calendar as CalendarIcon, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import '@/styles/p2.css';

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (DRC)","Congo (Republic)",
  "Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo",
  "Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
  "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent","Samoa","San Marino",
  "São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const PHONE_CODES = [
  { code: '+1', label: 'US/CA' }, { code: '+44', label: 'UK' }, { code: '+49', label: 'DE' },
  { code: '+33', label: 'FR' }, { code: '+41', label: 'CH' }, { code: '+90', label: 'TR' },
  { code: '+91', label: 'IN' }, { code: '+86', label: 'CN' }, { code: '+81', label: 'JP' },
  { code: '+7', label: 'RU' }, { code: '+55', label: 'BR' }, { code: '+34', label: 'ES' },
  { code: '+39', label: 'IT' }, { code: '+61', label: 'AU' }, { code: '+82', label: 'KR' },
  { code: '+971', label: 'AE' }, { code: '+966', label: 'SA' }, { code: '+92', label: 'PK' },
  { code: '+234', label: 'NG' }, { code: '+27', label: 'ZA' },
];

/* ── Step Progress Indicator ── */
function StepIndicator({ current, completed }: { current: number; completed: number[] }) {
  const steps = ['Personal Info', 'Identity', 'Consent'];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const done = completed.includes(i);
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1 : 0.95,
                  backgroundColor: done ? '#27AE60' : active ? '#2980B9' : '#ffffff',
                  borderColor: done ? '#27AE60' : active ? '#2980B9' : '#CBD5E1',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{ color: done || active ? '#fff' : '#94A3B8' }}
              >
                {done ? <Check size={14} /> : i + 1}
              </motion.div>
              <span className={cn(
                'text-[10px] mt-1.5 font-medium whitespace-nowrap',
                active ? 'text-[--p2-blue]' : done ? 'text-[--p2-green]' : 'text-[--p2-gray-400]'
              )}>{label}</span>
            </div>
            {i < 2 && (
              <motion.div
                initial={false}
                animate={{ backgroundColor: done ? '#27AE60' : '#E2E8F0' }}
                transition={{ duration: 0.4 }}
                className="w-12 sm:w-16 h-0.5 mx-1 mt-[-18px] rounded-full"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Searchable Country Dropdown ── */
function CountrySelect({ value, onChange, hasError }: { value: string; onChange: (v: string) => void; hasError?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <Button type="button" variant="outline" onClick={() => setOpen(!open)}
        className={cn(
          'w-full justify-between font-normal h-10',
          !value && 'text-muted-foreground',
          hasError && 'border-[--p2-red] focus:ring-[--p2-red]/30'
        )}>
        {value || 'Select nationality'}
        <ChevronDown size={16} className="opacity-50" />
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-hidden"
            style={{ borderColor: 'var(--p2-gray-200)' }}
          >
            <div className="p-2 border-b" style={{ borderColor: 'var(--p2-gray-100)' }}>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search countries..." className="pl-8 h-8 text-xs" />
              </div>
            </div>
            <div className="overflow-y-auto max-h-44">
              {filtered.map(c => (
                <button key={c} type="button"
                  onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[--p2-gray-50]',
                    value === c && 'bg-[--p2-blue]/5 text-[--p2-blue] font-medium'
                  )}>
                  {c}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-xs text-center text-muted-foreground">No countries found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */
export default function P2Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+41');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  // Step 2
  const [nationality, setNationality] = useState('');
  const [passport, setPassport] = useState('');
  const [dob, setDob] = useState<Date>();

  // Step 3
  const [consentBg, setConsentBg] = useState(false);
  const [consentTos, setConsentTos] = useState(false);
  const [consentFee, setConsentFee] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!phone.trim() || phone.length < 6) e.phone = 'Valid phone number required';
    if (password.length < 8) e.password = 'Minimum 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!nationality) e.nationality = 'Select your nationality';
    if (!passport.trim()) e.passport = 'Passport number is required';
    if (!dob) e.dob = 'Date of birth is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const completedSteps = (): number[] => {
    const c: number[] = [];
    if (step > 0) c.push(0);
    if (step > 1) c.push(1);
    return c;
  };

  const goNext = () => {
    if (step === 0 && validateStep1()) { setDirection(1); setStep(1); setErrors({}); }
    else if (step === 1 && validateStep2()) { setDirection(1); setStep(2); setErrors({}); }
  };

  const goBack = (to: number) => {
    setDirection(-1);
    setStep(to);
    setErrors({});
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => navigate('/p2/login'), 1500);
  };

  const allConsented = consentBg && consentTos && consentFee;

  // Directional slide variants
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="p2 flex min-h-screen">
      {/* LEFT — Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'var(--p2-navy)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div className="relative z-10">
          <span className="font-bold text-sm tracking-wide text-white">PORTOLAN</span>
          <span className="font-bold text-sm tracking-wide ml-1.5" style={{ color: 'var(--p2-blue)' }}>LABS</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
            Get Your Visa Clearance Certificate
          </h1>
          <div className="mt-8 space-y-4">
            {[
              'AI-powered background verification in under 48 hours',
              'Accepted by 200+ consulates worldwide',
              'QR-verified digital certificate',
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--p2-green)' }}>
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-sm" style={{ color: 'var(--p2-gray-300)' }}>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'var(--p2-gray-500)' }}>
          Trusted by 12+ consulates across Europe
        </p>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden w-full h-16 flex items-center px-5 fixed top-0 z-50"
        style={{ background: 'var(--p2-navy)' }}>
        <span className="font-bold text-sm tracking-wide text-white">PORTOLAN</span>
        <span className="font-bold text-sm tracking-wide ml-1.5" style={{ color: 'var(--p2-blue)' }}>LABS</span>
      </div>

      {/* RIGHT — Form */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full lg:w-[40%] flex items-start lg:items-center justify-center px-6 pt-24 pb-10 lg:pt-0 lg:pb-0 overflow-y-auto"
        style={{ background: 'var(--p2-gray-50)' }}
      >
        <div className="w-full max-w-sm py-8 lg:py-0">
          <StepIndicator current={step} completed={completedSteps()} />

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>

              {/* ── STEP 1: Personal Info ── */}
              {step === 0 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>Personal Information</h1>
                  <p className="text-xs mb-6" style={{ color: 'var(--p2-gray-500)' }}>Tell us about yourself</p>
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Full Name</Label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith"
                          className={cn('pl-9 h-10', errors.name && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30')} />
                      </div>
                      {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Email Address</Label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com"
                          className={cn('pl-9 h-10', errors.email && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30')} />
                      </div>
                      {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Phone Number</Label>
                      <div className="flex gap-2">
                        <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)}
                          className="w-24 h-10 px-2 text-xs rounded-md border border-input bg-background focus:outline-none">
                          {PHONE_CODES.map(p => <option key={p.code} value={p.code}>{p.code} {p.label}</option>)}
                        </select>
                        <div className="relative flex-1">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="123 456 789"
                            className={cn('pl-9 h-10', errors.phone && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30')} />
                        </div>
                      </div>
                      {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.phone}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Password</Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className={cn('pl-9 pr-10 h-10', errors.password && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30')} />
                        <button type="button" onClick={() => setShowPw(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Confirm Password</Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showCpw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={cn('pl-9 pr-10 h-10', errors.confirmPassword && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30')} />
                        <button type="button" onClick={() => setShowCpw(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.confirmPassword}</p>}
                    </div>

                    <Button onClick={goNext} className="w-full h-10 mt-2" style={{ background: 'var(--p2-navy)' }}>
                      Next <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Identity ── */}
              {step === 1 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>Identity Verification</h1>
                  <p className="text-xs mb-6" style={{ color: 'var(--p2-gray-500)' }}>We need this for background checks</p>
                  <div className="space-y-4">
                    {/* Nationality */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Nationality</Label>
                      <CountrySelect value={nationality} onChange={setNationality} hasError={!!errors.nationality} />
                      {errors.nationality && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.nationality}</p>}
                    </div>

                    {/* Passport */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Passport Number</Label>
                      <Input value={passport} onChange={e => setPassport(e.target.value)} placeholder="AB1234567"
                        className={cn('h-10', errors.passport && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30')} />
                      {errors.passport && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.passport}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--p2-gray-600)' }}>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn(
                            'w-full justify-start text-left font-normal h-10',
                            !dob && 'text-muted-foreground',
                            errors.dob && 'border-[--p2-red] focus-visible:ring-[--p2-red]/30'
                          )}>
                            <CalendarIcon size={16} className="mr-2 opacity-50" />
                            {dob ? format(dob, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dob}
                            onSelect={setDob}
                            disabled={(date) => date > new Date() || date < new Date('1920-01-01')}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.dob && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.dob}</p>}
                    </div>

                    <div className="flex gap-3 mt-2">
                      <Button variant="outline" onClick={() => goBack(0)} className="flex-1 h-10">
                        <ArrowLeft size={16} className="mr-1" /> Back
                      </Button>
                      <Button onClick={goNext} className="flex-1 h-10" style={{ background: 'var(--p2-navy)' }}>
                        Next <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Consent ── */}
              {step === 2 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>Consent & Agreement</h1>
                  <p className="text-xs mb-6" style={{ color: 'var(--p2-gray-500)' }}>Please review and accept the following</p>
                  <div className="space-y-3">
                    {[
                      { id: 'bg', checked: consentBg, set: setConsentBg, label: 'I consent to background verification checks' },
                      { id: 'tos', checked: consentTos, set: setConsentTos, label: (
                        <>I agree to the <a href="#" className="underline" style={{ color: 'var(--p2-blue)' }}>Terms of Service</a> and <a href="#" className="underline" style={{ color: 'var(--p2-blue)' }}>Privacy Policy</a></>
                      )},
                      { id: 'fee', checked: consentFee, set: setConsentFee, label: 'I understand the processing fee of CHF 89' },
                    ].map((item) => (
                      <motion.label
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-200',
                          item.checked
                            ? 'border-[--p2-blue] bg-[--p2-blue]/[0.03] shadow-sm'
                            : 'border-[--p2-gray-200] bg-white hover:border-[--p2-gray-300]'
                        )}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) => item.set(checked === true)}
                          className="mt-0.5 data-[state=checked]:bg-[--p2-blue] data-[state=checked]:border-[--p2-blue]"
                        />
                        <span className="text-sm leading-snug" style={{ color: 'var(--p2-gray-700)' }}>{item.label}</span>
                      </motion.label>
                    ))}

                    <div className="flex gap-3 mt-4 pt-2">
                      <Button variant="outline" onClick={() => goBack(1)} className="flex-1 h-10">
                        <ArrowLeft size={16} className="mr-1" /> Back
                      </Button>
                      <Button onClick={submit} disabled={!allConsented || loading}
                        className="flex-1 h-10 text-white disabled:opacity-50"
                        style={{ background: 'var(--p2-navy)' }}>
                        {loading ? (
                          <><Loader2 size={16} className="animate-spin mr-1" /> Creating...</>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--p2-gray-400)' }}>
            Already have an account?{' '}
            <a href="/p2/login" className="font-medium hover:underline" style={{ color: 'var(--p2-blue)' }}>Sign in</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
