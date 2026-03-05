import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Phone, User, Check, Loader2, Search, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import '@/styles/p2.css';

// Country list (abbreviated for common + full coverage)
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

// Step progress indicator
function StepIndicator({ current, completed }: { current: number; completed: number[] }) {
  const steps = ['Personal Info', 'Identity', 'Consent'];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const isCompleted = completed.includes(i);
        const isActive = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                isCompleted ? 'bg-[--p2-green] border-[--p2-green] text-white' :
                isActive ? 'bg-[--p2-blue] border-[--p2-blue] text-white' :
                'bg-white border-[--p2-gray-300] text-[--p2-gray-400]'
              )}>
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn(
                'text-[10px] mt-1.5 font-medium whitespace-nowrap',
                isActive ? 'text-[--p2-blue]' : isCompleted ? 'text-[--p2-green]' : 'text-[--p2-gray-400]'
              )}>{label}</span>
            </div>
            {i < 2 && (
              <div className={cn(
                'w-12 sm:w-16 h-0.5 mx-1 mt-[-18px] transition-colors duration-300',
                isCompleted ? 'bg-[--p2-green]' : 'bg-[--p2-gray-200]'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Searchable country dropdown
function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between pl-3 pr-3 py-2.5 text-sm rounded-md border bg-white text-left"
        style={{ borderColor: 'var(--p2-gray-200)', color: value ? 'var(--p2-gray-800)' : 'var(--p2-gray-400)' }}>
        {value || 'Select nationality'}
        <ChevronDown size={16} style={{ color: 'var(--p2-gray-400)' }} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-hidden"
          style={{ borderColor: 'var(--p2-gray-200)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--p2-gray-100)' }}>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border bg-white focus:outline-none"
                style={{ borderColor: 'var(--p2-gray-200)' }} />
            </div>
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.map(c => (
              <button key={c} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className={cn('w-full text-left px-3 py-2 text-xs hover:bg-[--p2-gray-50]', value === c && 'bg-[--p2-blue]/5 text-[--p2-blue] font-medium')}>
                {c}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-4 text-xs text-center" style={{ color: 'var(--p2-gray-400)' }}>No countries found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Input wrapper
function FormInput({ label, icon: Icon, error, ...props }: {
  label: string; icon?: typeof Mail; error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />}
        <input {...props}
          className={cn('w-full py-2.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30 transition-colors', Icon ? 'pl-9 pr-3' : 'pl-3 pr-3')}
          style={{ borderColor: error ? 'var(--p2-red)' : 'var(--p2-gray-200)', color: 'var(--p2-gray-800)' }} />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{error}</p>}
    </div>
  );
}

export default function P2Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
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

  const next = () => {
    if (step === 0 && validateStep1()) { setStep(1); setErrors({}); }
    else if (step === 1 && validateStep2()) { setStep(2); setErrors({}); }
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => navigate('/p2/login'), 1500);
  };

  const allConsented = consentBg && consentTos && consentFee;

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="p2 flex min-h-screen">
      {/* LEFT */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'var(--p2-navy)' }}>
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
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--p2-green)' }}>
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-sm" style={{ color: 'var(--p2-gray-300)' }}>{text}</span>
              </div>
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

      {/* RIGHT */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full lg:w-[40%] flex items-start lg:items-center justify-center px-6 pt-24 pb-10 lg:pt-0 lg:pb-0 overflow-y-auto"
        style={{ background: 'var(--p2-gray-50)' }}
      >
        <div className="w-full max-w-sm py-8 lg:py-0">
          <StepIndicator current={step} completed={completedSteps()} />

          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 0 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>Personal Information</h1>
                <p className="text-xs mb-6" style={{ color: 'var(--p2-gray-500)' }}>Tell us about yourself</p>
                <div className="space-y-4">
                  <FormInput label="Full Name" icon={User} placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
                  <FormInput label="Email Address" icon={Mail} type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Phone Number</label>
                    <div className="flex gap-2">
                      <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)}
                        className="w-24 py-2.5 px-2 text-xs rounded-md border bg-white focus:outline-none"
                        style={{ borderColor: 'var(--p2-gray-200)', color: 'var(--p2-gray-700)' }}>
                        {PHONE_CODES.map(p => <option key={p.code} value={p.code}>{p.code} {p.label}</option>)}
                      </select>
                      <div className="relative flex-1">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="123 456 789"
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30"
                          style={{ borderColor: errors.phone ? 'var(--p2-red)' : 'var(--p2-gray-200)', color: 'var(--p2-gray-800)' }} />
                      </div>
                    </div>
                    {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />
                      <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                        className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30"
                        style={{ borderColor: errors.password ? 'var(--p2-red)' : 'var(--p2-gray-200)', color: 'var(--p2-gray-800)' }} />
                      <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }} />
                      <input type={showCpw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                        className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30"
                        style={{ borderColor: errors.confirmPassword ? 'var(--p2-red)' : 'var(--p2-gray-200)', color: 'var(--p2-gray-800)' }} />
                      <button type="button" onClick={() => setShowCpw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--p2-gray-400)' }}>
                        {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.confirmPassword}</p>}
                  </div>

                  <button onClick={next}
                    className="w-full py-2.5 rounded-md text-sm font-semibold text-white mt-2 transition-opacity hover:opacity-90"
                    style={{ background: 'var(--p2-navy)' }}>
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>Identity Verification</h1>
                <p className="text-xs mb-6" style={{ color: 'var(--p2-gray-500)' }}>We need this for background checks</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Nationality</label>
                    <CountrySelect value={nationality} onChange={setNationality} />
                    {errors.nationality && <p className="text-xs mt-1" style={{ color: 'var(--p2-red)' }}>{errors.nationality}</p>}
                  </div>

                  <FormInput label="Passport Number" placeholder="AB1234567" value={passport} onChange={e => setPassport(e.target.value)} error={errors.passport} />

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--p2-gray-600)' }}>Date of Birth</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button"
                          className={cn('w-full flex items-center gap-2 pl-3 pr-3 py-2.5 text-sm rounded-md border bg-white text-left',
                            !dob && 'text-[--p2-gray-400]'
                          )}
                          style={{ borderColor: errors.dob ? 'var(--p2-red)' : 'var(--p2-gray-200)', color: dob ? 'var(--p2-gray-800)' : undefined }}>
                          <CalendarIcon size={16} style={{ color: 'var(--p2-gray-400)' }} />
                          {dob ? format(dob, 'PPP') : 'Select date'}
                        </button>
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
                    <button onClick={() => { setStep(0); setErrors({}); }}
                      className="flex-1 py-2.5 rounded-md text-sm font-medium border transition-colors hover:bg-[--p2-gray-100]"
                      style={{ borderColor: 'var(--p2-gray-200)', color: 'var(--p2-gray-700)' }}>
                      Back
                    </button>
                    <button onClick={next}
                      className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--p2-navy)' }}>
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--p2-navy)' }}>Consent & Agreement</h1>
                <p className="text-xs mb-6" style={{ color: 'var(--p2-gray-500)' }}>Please review and accept the following</p>
                <div className="space-y-4">
                  {[
                    { checked: consentBg, set: setConsentBg, label: 'I consent to background verification checks' },
                    { checked: consentTos, set: setConsentTos, label: <>I agree to the <a href="#" className="underline" style={{ color: 'var(--p2-blue)' }}>Terms of Service</a> and <a href="#" className="underline" style={{ color: 'var(--p2-blue)' }}>Privacy Policy</a></> },
                    { checked: consentFee, set: setConsentFee, label: 'I understand the processing fee of CHF 89' },
                  ].map((item, i) => (
                    <label key={i} className="flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors"
                      style={{
                        borderColor: item.checked ? 'var(--p2-blue)' : 'var(--p2-gray-200)',
                        background: item.checked ? 'rgba(41,128,185,0.03)' : 'white',
                      }}>
                      <input type="checkbox" checked={item.checked} onChange={e => item.set(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[--p2-blue]" />
                      <span className="text-sm" style={{ color: 'var(--p2-gray-700)' }}>{item.label}</span>
                    </label>
                  ))}

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => { setStep(1); setErrors({}); }}
                      className="flex-1 py-2.5 rounded-md text-sm font-medium border transition-colors hover:bg-[--p2-gray-100]"
                      style={{ borderColor: 'var(--p2-gray-200)', color: 'var(--p2-gray-700)' }}>
                      Back
                    </button>
                    <button onClick={submit} disabled={!allConsented || loading}
                      className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                      style={{ background: 'var(--p2-navy)' }}>
                      {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Account'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--p2-gray-400)' }}>
            Already have an account?{' '}
            <a href="/p2/login" className="font-medium hover:underline" style={{ color: 'var(--p2-blue)' }}>Sign in</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
