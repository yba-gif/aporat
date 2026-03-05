import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Plane, Upload, CreditCard, ChevronRight, ChevronLeft,
  Check, Calendar as CalendarIcon, Search, X, Plus, FileText,
  Image, Shield, Lock, Globe, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import logo from '@/assets/logo.png';

// ── Constants ──
const STEPS = [
  { label: 'Personal Information', icon: User },
  { label: 'Travel Details', icon: Plane },
  { label: 'Document Upload', icon: Upload },
  { label: 'Payment & Submit', icon: CreditCard },
];

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana',
  'Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad','Chile',
  'China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti',
  'Dominican Republic','Ecuador','Egypt','El Salvador','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland',
  'France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Guyana',
  'Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel',
  'Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia',
  'Lebanon','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives',
  'Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco',
  'Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
  'North Macedonia','Norway','Oman','Pakistan','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Sierra Leone',
  'Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan',
  'Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Trinidad and Tobago',
  'Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const PURPOSES = ['Tourism', 'Business', 'Education', 'Family Visit', 'Medical', 'Other'];
const DURATIONS = ['1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const COUNTRY_CODES = ['+1','+44','+49','+33','+90','+971','+41','+966','+91','+86','+81','+82','+55','+61','+7','+20','+234','+254','+27','+92','+62','+60','+63','+66','+84'];

// ── Types ──
interface FormData {
  fullName: string; dob: Date | undefined; nationality: string; gender: string;
  email: string; countryCode: string; phone: string;
  street: string; city: string; postalCode: string; addressCountry: string;
  destination: string; purpose: string; travelDate: Date | undefined; duration: string;
  deniedBefore: string; deniedCountry: string; deniedYear: string; deniedReason: string;
  passportFile: File | null; supportingFiles: File[];
  linkedin: string; twitter: string; otherUrls: string[];
  processingSpeed: string;
}

const initialForm: FormData = {
  fullName: '', dob: undefined, nationality: '', gender: '',
  email: '', countryCode: '+1', phone: '',
  street: '', city: '', postalCode: '', addressCountry: '',
  destination: '', purpose: '', travelDate: undefined, duration: '',
  deniedBefore: 'no', deniedCountry: '', deniedYear: '', deniedReason: '',
  passportFile: null, supportingFiles: [],
  linkedin: '', twitter: '', otherUrls: [''],
  processingSpeed: 'standard',
};

// ── Slide variants ──
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

// ── Searchable Country Select ──
function CountrySelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className={cn('w-full justify-between h-11 text-sm font-normal', !value && 'text-muted-foreground')}>
          {value || placeholder || 'Select country'}
          <Search className="ml-auto h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto" align="start">
        <div className="p-2 border-b">
          <Input placeholder="Search countries…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs" autoFocus />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.map(c => (
            <button key={c} onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
              className={cn('w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors', value === c && 'bg-accent font-medium')}>
              {c}
            </button>
          ))}
          {filtered.length === 0 && <p className="p-3 text-xs text-muted-foreground text-center">No countries found</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── File Drop Zone ──
function FileDropZone({ label, accept, maxSize, multiple, files, onFiles, onRemove }: {
  label: string; accept: string; maxSize: number; multiple?: boolean;
  files: File[]; onFiles: (f: File[]) => void; onRemove?: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).filter(f => f.size <= maxSize * 1024 * 1024);
    if (arr.length < (fileList?.length || 0)) toast({ title: `Files over ${maxSize}MB were excluded`, variant: 'destructive' });
    onFiles(arr);
  }, [maxSize, onFiles]);

  return (
    <div>
      <Label className="text-xs font-medium text-[--p2-gray-700] mb-1.5 block">{label}</Label>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          dragOver ? 'border-[--p2-blue] bg-[--p2-blue]/5' : 'border-[--p2-gray-300] hover:border-[--p2-gray-400]'
        )}
      >
        <Upload className="mx-auto mb-2 text-[--p2-gray-400]" size={24} />
        <p className="text-xs text-[--p2-gray-500]">Drag & drop or <span className="text-[--p2-blue] font-medium">click to browse</span></p>
        <p className="text-[10px] text-[--p2-gray-400] mt-1">JPG, PNG, PDF — Max {maxSize}MB</p>
        <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[--p2-gray-50] border border-[--p2-gray-200]">
              {f.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(f)} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 rounded bg-[--p2-blue]/10 flex items-center justify-center"><FileText size={16} className="text-[--p2-blue]" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[--p2-navy] truncate">{f.name}</p>
                <p className="text-[10px] text-[--p2-gray-400]">{(f.size / 1024).toFixed(0)} KB</p>
              </div>
              {onRemove && (
                <button onClick={e => { e.stopPropagation(); onRemove(i); }} className="p-1 rounded hover:bg-[--p2-gray-200] text-[--p2-gray-400]">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function P2Apply() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(prev => ({ ...prev, [key]: val }));

  // ── Validation ──
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.fullName.trim()) errs.fullName = 'Required';
      if (!form.dob) errs.dob = 'Required';
      if (!form.nationality) errs.nationality = 'Required';
      if (!form.gender) errs.gender = 'Required';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
      if (!form.phone.trim()) errs.phone = 'Required';
      if (!form.street.trim()) errs.street = 'Required';
      if (!form.city.trim()) errs.city = 'Required';
      if (!form.postalCode.trim()) errs.postalCode = 'Required';
      if (!form.addressCountry) errs.addressCountry = 'Required';
    } else if (s === 1) {
      if (!form.destination) errs.destination = 'Required';
      if (!form.purpose) errs.purpose = 'Required';
      if (!form.travelDate) errs.travelDate = 'Required';
      if (!form.duration) errs.duration = 'Required';
      if (form.deniedBefore === 'yes') {
        if (!form.deniedCountry) errs.deniedCountry = 'Required';
        if (!form.deniedYear) errs.deniedYear = 'Required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => { if (validateStep(step)) { setDirection(1); setStep(s => s + 1); } };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };
  const goTo = (s: number) => { setDirection(s > step ? 1 : -1); setStep(s); };

  const handleSubmit = () => {
    toast({ title: 'Application Submitted!', description: 'Your reference number is CLR-2026-4721. Check your email for confirmation.' });
  };

  const FieldError = ({ name }: { name: string }) => errors[name] ? <p className="text-[10px] text-[--p2-red] mt-0.5">{errors[name]}</p> : null;

  // ── Step Renderers ──
  const renderStep0 = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-medium text-[--p2-gray-700]">Full Legal Name (as on passport) *</Label>
        <Input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. John Alexander Smith" className="mt-1.5 h-11" />
        <FieldError name="fullName" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-full mt-1.5 h-11 justify-start text-sm font-normal', !form.dob && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.dob ? format(form.dob, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={form.dob} onSelect={d => set('dob', d)} disabled={d => d > new Date()} captionLayout="dropdown-buttons" fromYear={1930} toYear={2010} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <FieldError name="dob" />
        </div>
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Gender *</Label>
          <Select value={form.gender} onValueChange={v => set('gender', v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
          <FieldError name="gender" />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-[--p2-gray-700]">Nationality *</Label>
        <div className="mt-1.5"><CountrySelect value={form.nationality} onChange={v => set('nationality', v)} placeholder="Search nationality…" /></div>
        <FieldError name="nationality" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Email Address *</Label>
          <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className="mt-1.5 h-11" />
          <FieldError name="email" />
        </div>
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Phone Number *</Label>
          <div className="flex gap-2 mt-1.5">
            <Select value={form.countryCode} onValueChange={v => set('countryCode', v)}>
              <SelectTrigger className="w-24 h-11"><SelectValue /></SelectTrigger>
              <SelectContent>{COUNTRY_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="555 123 4567" className="h-11 flex-1" />
          </div>
          <FieldError name="phone" />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-[--p2-gray-700] mb-1.5 block">Current Residential Address *</Label>
        <Input value={form.street} onChange={e => set('street', e.target.value)} placeholder="Street address" className="h-11 mb-2" />
        <FieldError name="street" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div><Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" className="h-11" /><FieldError name="city" /></div>
          <div><Input value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="Postal code" className="h-11" /><FieldError name="postalCode" /></div>
          <div className="col-span-2 sm:col-span-1">
            <CountrySelect value={form.addressCountry} onChange={v => set('addressCountry', v)} placeholder="Country" />
            <FieldError name="addressCountry" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Destination Country *</Label>
          <div className="mt-1.5"><CountrySelect value={form.destination} onChange={v => set('destination', v)} /></div>
          <FieldError name="destination" />
        </div>
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Purpose of Travel *</Label>
          <Select value={form.purpose} onValueChange={v => set('purpose', v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select purpose" /></SelectTrigger>
            <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <FieldError name="purpose" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Expected Travel Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('w-full mt-1.5 h-11 justify-start text-sm font-normal', !form.travelDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.travelDate ? format(form.travelDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={form.travelDate} onSelect={d => set('travelDate', d)} disabled={d => d < new Date()} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <FieldError name="travelDate" />
        </div>
        <div>
          <Label className="text-xs font-medium text-[--p2-gray-700]">Duration of Stay *</Label>
          <Select value={form.duration} onValueChange={v => set('duration', v)}>
            <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select duration" /></SelectTrigger>
            <SelectContent>{DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <FieldError name="duration" />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-[--p2-gray-700] mb-2 block">Have you been denied a visa before? *</Label>
        <RadioGroup value={form.deniedBefore} onValueChange={v => set('deniedBefore', v)} className="flex gap-6">
          <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="deny-yes" /><Label htmlFor="deny-yes" className="text-sm cursor-pointer">Yes</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="no" id="deny-no" /><Label htmlFor="deny-no" className="text-sm cursor-pointer">No</Label></div>
        </RadioGroup>
      </div>

      <AnimatePresence>
        {form.deniedBefore === 'yes' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[--p2-gray-700]">Which country? *</Label>
                <div className="mt-1.5"><CountrySelect value={form.deniedCountry} onChange={v => set('deniedCountry', v)} /></div>
                <FieldError name="deniedCountry" />
              </div>
              <div>
                <Label className="text-xs font-medium text-[--p2-gray-700]">Year *</Label>
                <Input value={form.deniedYear} onChange={e => set('deniedYear', e.target.value)} placeholder="e.g. 2023" className="mt-1.5 h-11" />
                <FieldError name="deniedYear" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-[--p2-gray-700]">Reason (optional)</Label>
              <Textarea value={form.deniedReason} onChange={e => set('deniedReason', e.target.value)} placeholder="Brief explanation…" className="mt-1.5" rows={3} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <FileDropZone
        label="Passport Photo Page *"
        accept=".jpg,.jpeg,.png,.pdf"
        maxSize={5}
        files={form.passportFile ? [form.passportFile] : []}
        onFiles={files => set('passportFile', files[0] || null)}
        onRemove={() => set('passportFile', null)}
      />

      <FileDropZone
        label="Supporting Documents (optional)"
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        maxSize={5}
        multiple
        files={form.supportingFiles}
        onFiles={files => set('supportingFiles', [...form.supportingFiles, ...files])}
        onRemove={i => set('supportingFiles', form.supportingFiles.filter((_, idx) => idx !== i))}
      />
      <p className="text-[10px] text-[--p2-gray-400] -mt-3">Bank statement, employment letter, invitation letter</p>

      <div>
        <Label className="text-xs font-medium text-[--p2-gray-700] mb-3 block">Social Media Links (optional)</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-[10px] text-[--p2-gray-400]">LinkedIn</Label>
            <Input value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" className="mt-1 h-10" />
          </div>
          <div>
            <Label className="text-[10px] text-[--p2-gray-400]">Twitter / X</Label>
            <Input value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://x.com/…" className="mt-1 h-10" />
          </div>
          {form.otherUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1">
                <Label className="text-[10px] text-[--p2-gray-400]">Other URL</Label>
                <Input value={url} onChange={e => { const u = [...form.otherUrls]; u[i] = e.target.value; set('otherUrls', u); }} placeholder="https://…" className="mt-1 h-10" />
              </div>
              {form.otherUrls.length > 1 && (
                <button onClick={() => set('otherUrls', form.otherUrls.filter((_, idx) => idx !== i))} className="self-end p-2 text-[--p2-gray-400] hover:text-[--p2-red]">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => set('otherUrls', [...form.otherUrls, ''])} className="text-xs text-[--p2-blue] font-medium flex items-center gap-1 hover:underline">
            <Plus size={12} /> Add another URL
          </button>
        </div>
      </div>
    </div>
  );

  const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1.5">
      <span className="text-[11px] text-[--p2-gray-500]">{label}</span>
      <span className="text-[11px] font-medium text-[--p2-navy] text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border border-[--p2-gray-200] overflow-hidden">
        <div className="px-4 py-3 bg-[--p2-gray-50] border-b border-[--p2-gray-200] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Personal Information</h3>
          <button onClick={() => goTo(0)} className="text-[10px] text-[--p2-blue] font-medium hover:underline">Edit</button>
        </div>
        <div className="px-4 py-2 divide-y divide-[--p2-gray-100]">
          <SummaryRow label="Name" value={form.fullName} />
          <SummaryRow label="Date of Birth" value={form.dob ? format(form.dob, 'PPP') : ''} />
          <SummaryRow label="Nationality" value={form.nationality} />
          <SummaryRow label="Gender" value={form.gender} />
          <SummaryRow label="Email" value={form.email} />
          <SummaryRow label="Phone" value={`${form.countryCode} ${form.phone}`} />
          <SummaryRow label="Address" value={[form.street, form.city, form.postalCode, form.addressCountry].filter(Boolean).join(', ')} />
        </div>
      </div>

      <div className="rounded-xl border border-[--p2-gray-200] overflow-hidden">
        <div className="px-4 py-3 bg-[--p2-gray-50] border-b border-[--p2-gray-200] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Travel Details</h3>
          <button onClick={() => goTo(1)} className="text-[10px] text-[--p2-blue] font-medium hover:underline">Edit</button>
        </div>
        <div className="px-4 py-2 divide-y divide-[--p2-gray-100]">
          <SummaryRow label="Destination" value={form.destination} />
          <SummaryRow label="Purpose" value={form.purpose} />
          <SummaryRow label="Travel Date" value={form.travelDate ? format(form.travelDate, 'PPP') : ''} />
          <SummaryRow label="Duration" value={form.duration} />
          <SummaryRow label="Previous Denial" value={form.deniedBefore === 'yes' ? `Yes — ${form.deniedCountry} (${form.deniedYear})` : 'No'} />
        </div>
      </div>

      <div className="rounded-xl border border-[--p2-gray-200] overflow-hidden">
        <div className="px-4 py-3 bg-[--p2-gray-50] border-b border-[--p2-gray-200] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[--p2-navy]">Documents</h3>
          <button onClick={() => goTo(2)} className="text-[10px] text-[--p2-blue] font-medium hover:underline">Edit</button>
        </div>
        <div className="px-4 py-2 divide-y divide-[--p2-gray-100]">
          <SummaryRow label="Passport" value={form.passportFile?.name || 'Not uploaded'} />
          <SummaryRow label="Supporting Docs" value={form.supportingFiles.length > 0 ? `${form.supportingFiles.length} file(s)` : 'None'} />
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-xs font-semibold text-[--p2-navy] mb-3">Processing Speed</h3>
        <RadioGroup value={form.processingSpeed} onValueChange={v => set('processingSpeed', v)} className="space-y-3">
          <label className={cn('flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all',
            form.processingSpeed === 'standard' ? 'border-[--p2-blue] bg-[--p2-blue]/5' : 'border-[--p2-gray-200] hover:border-[--p2-gray-300]')}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="standard" id="speed-std" />
              <div>
                <p className="text-sm font-semibold text-[--p2-navy]">Standard Processing</p>
                <p className="text-[11px] text-[--p2-gray-500]">48–72 hours</p>
              </div>
            </div>
            <span className="text-lg font-bold text-[--p2-navy]">CHF 89</span>
          </label>
          <label className={cn('flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all',
            form.processingSpeed === 'express' ? 'border-[--p2-blue] bg-[--p2-blue]/5' : 'border-[--p2-gray-200] hover:border-[--p2-gray-300]')}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="express" id="speed-exp" />
              <div>
                <p className="text-sm font-semibold text-[--p2-navy]">Express Processing</p>
                <p className="text-[11px] text-[--p2-gray-500]">24 hours</p>
              </div>
            </div>
            <span className="text-lg font-bold text-[--p2-navy]">CHF 149</span>
          </label>
        </RadioGroup>
      </div>

      {/* Payment Fields */}
      <div>
        <h3 className="text-xs font-semibold text-[--p2-navy] mb-3">Payment Details</h3>
        <div className="space-y-3 p-4 rounded-xl border border-[--p2-gray-200] bg-[--p2-gray-50]">
          <div>
            <Label className="text-[10px] text-[--p2-gray-500]">Card Number</Label>
            <Input placeholder="4242 4242 4242 4242" className="mt-1 h-11 tracking-wider" maxLength={19} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-[--p2-gray-500]">Expiry</Label>
              <Input placeholder="MM / YY" className="mt-1 h-11" maxLength={7} />
            </div>
            <div>
              <Label className="text-[10px] text-[--p2-gray-500]">CVC</Label>
              <Input placeholder="123" className="mt-1 h-11" maxLength={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-2">
        {[
          { icon: Lock, label: '256-bit SSL' },
          { icon: Shield, label: 'GDPR Compliant' },
          { icon: Globe, label: 'Swiss Data Protection' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5 text-[10px] text-[--p2-gray-400]">
            <b.icon size={12} /> {b.label}
          </div>
        ))}
      </div>

      <Button className="w-full h-12 text-sm font-semibold bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white gap-2" onClick={handleSubmit}>
        <CreditCard size={16} /> Pay & Submit Application — CHF {form.processingSpeed === 'express' ? '149' : '89'}
      </Button>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="p2 min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-[--p2-gray-200] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/p2" className="flex items-center gap-2">
            <img src={logo} alt="Portolan Labs" className="h-7" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/p2" className="text-[11px] text-[--p2-gray-500] hover:text-[--p2-blue] transition-colors">Already applied? Check Status</Link>
            <Link to="/p2/login" className="text-[11px] font-semibold text-[--p2-blue] hover:underline">Login</Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="max-w-[800px] mx-auto">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-[--p2-navy]">Security Clearance Application</h1>
            <p className="text-xs text-[--p2-gray-500] mt-1">Complete all steps to submit your application</p>
          </motion.div>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              {/* Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-[--p2-gray-200]" />
              <div className="absolute top-5 left-0 h-0.5 bg-[--p2-blue] transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />

              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                return (
                  <div key={i} className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => { if (i < step) goTo(i); }}>
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      done ? 'bg-[--p2-blue] border-[--p2-blue] text-white' :
                      active ? 'bg-white border-[--p2-blue] text-[--p2-blue] shadow-md shadow-[--p2-blue]/20' :
                      'bg-white border-[--p2-gray-300] text-[--p2-gray-400]'
                    )}>
                      {done ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={cn(
                      'text-[10px] mt-2 text-center font-medium whitespace-nowrap hidden sm:block',
                      active ? 'text-[--p2-blue]' : done ? 'text-[--p2-navy]' : 'text-[--p2-gray-400]'
                    )}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="rounded-2xl border border-[--p2-gray-200] p-6 sm:p-8 bg-white shadow-sm">
                  <h2 className="text-sm font-bold text-[--p2-navy] mb-6 flex items-center gap-2">
                    {(() => { const Icon = STEPS[step].icon; return <Icon size={16} className="text-[--p2-blue]" />; })()}
                    {STEPS[step].label}
                  </h2>
                  {stepRenderers[step]()}

                  {/* Navigation */}
                  {step < 3 && (
                    <div className="flex justify-between mt-8 pt-6 border-t border-[--p2-gray-100]">
                      {step > 0 ? (
                        <Button variant="outline" onClick={goBack} className="h-10 gap-1.5 text-xs"><ChevronLeft size={14} /> Back</Button>
                      ) : <div />}
                      <Button onClick={goNext} className="h-10 gap-1.5 text-xs bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white">
                        Next <ChevronRight size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[--p2-gray-200] py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--p2-gray-400]">© 2026 Portolan Labs AG. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">Terms of Service</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
