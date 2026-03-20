'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { DEPARTMENTS, VISIT_REASON_GROUPS, VisitDomain, UserType } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { analyzeVisitorReasons } from '@/ai/flows/analyze-visitor-reasons';
import { LogOut, CheckCircle2, Loader2, Building2, BookOpen, GraduationCap, Briefcase, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VisitorCheckIn() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, setCurrentUser, addVisit } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domain: 'LIBRARY' as VisitDomain,
    userType: 'STUDENT' as UserType,
    department: '',
    reason: '',
    details: ''
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    } else {
      setFormData(prev => ({ ...prev, userType: currentUser.userType }));
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullReasonText = `${formData.reason}${formData.details ? `: ${formData.details}` : ''}`;
      
      let insights = undefined;
      try {
        insights = await analyzeVisitorReasons({ reasonForVisit: fullReasonText });
      } catch (aiError) {
        console.warn('AI analysis skipped or failed');
      }

      const newVisit = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userType: formData.userType,
        department: formData.department,
        domain: formData.domain,
        reason: fullReasonText,
        timestamp: new Date(),
        aiInsights: insights
      };

      addVisit(newVisit);

      toast({
        title: 'Check-in Successful',
        description: `Welcome to the ${formData.domain === 'LIBRARY' ? 'Library' : "Dean's Office"}!`,
      });

      setFormData({ 
        domain: 'LIBRARY', 
        userType: currentUser.userType, 
        department: '', 
        reason: '', 
        details: '' 
      });
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Check-in Failed',
        description: 'Unable to process your check-in. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              width={28} 
              height={28} 
              className="object-contain"
            />
            <h1 className="text-xl font-black text-primary">VirtuLib</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{currentUser.userType}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setCurrentUser(null); router.push('/'); }}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-widest">
            Welcome Back
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Facility Check-in</h2>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">Please select your destination and provide your visit details below.</p>
        </div>

        {/* Destination Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            type="button"
            className={cn(
              "relative group h-40 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 transition-all p-6",
              formData.domain === 'LIBRARY' 
                ? "border-primary bg-white shadow-xl shadow-primary/10 ring-4 ring-primary/5" 
                : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
            )}
            onClick={() => setFormData({ ...formData, domain: 'LIBRARY' })}
          >
            <div className={cn(
              "p-4 rounded-2xl transition-colors",
              formData.domain === 'LIBRARY' ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
            )}>
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="text-center">
              <span className="block font-black text-lg text-slate-900">University Library</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resource Center</span>
            </div>
            {formData.domain === 'LIBRARY' && (
              <div className="absolute top-4 right-4 text-primary">
                <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
              </div>
            )}
          </button>

          <button
            type="button"
            className={cn(
              "relative group h-40 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 transition-all p-6",
              formData.domain === 'DEANS_OFFICE' 
                ? "border-primary bg-white shadow-xl shadow-primary/10 ring-4 ring-primary/5" 
                : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
            )}
            onClick={() => setFormData({ ...formData, domain: 'DEANS_OFFICE' })}
          >
            <div className={cn(
              "p-4 rounded-2xl transition-colors",
              formData.domain === 'DEANS_OFFICE' ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
            )}>
              <Building2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <span className="block font-black text-lg text-slate-900">Dean's Office</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administration</span>
            </div>
            {formData.domain === 'DEANS_OFFICE' && (
              <div className="absolute top-4 right-4 text-primary">
                <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
              </div>
            )}
          </button>
        </div>

        {/* Detailed Form */}
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Visit Details</CardTitle>
                <CardDescription className="font-medium">
                  Currently checking into: <span className="text-primary font-bold">{formData.domain.replace('_', ' ')}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Classification</Label>
                  <RadioGroup 
                    value={formData.userType} 
                    onValueChange={(val) => setFormData({...formData, userType: val as UserType})}
                    className="grid grid-cols-1 gap-3"
                  >
                    <div className={cn(
                      "flex items-center space-x-3 rounded-2xl p-4 cursor-pointer border-2 transition-all",
                      formData.userType === 'STUDENT' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                    )}>
                      <RadioGroupItem value="STUDENT" id="student" className="h-5 w-5" />
                      <Label htmlFor="student" className="flex items-center gap-3 cursor-pointer w-full font-bold">
                        <GraduationCap className="h-5 w-5 text-primary" /> Student
                      </Label>
                    </div>
                    <div className={cn(
                      "flex items-center space-x-3 rounded-2xl p-4 cursor-pointer border-2 transition-all",
                      formData.userType === 'EMPLOYEE' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                    )}>
                      <RadioGroupItem value="EMPLOYEE" id="employee" className="h-5 w-5" />
                      <Label htmlFor="employee" className="flex items-center gap-3 cursor-pointer w-full font-bold">
                        <Briefcase className="h-5 w-5 text-accent" /> Employee
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-sm font-black uppercase tracking-widest text-slate-400">College Department</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(val) => setFormData({...formData, department: val})}
                      required
                    >
                      <SelectTrigger id="department" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50">
                        <SelectValue placeholder="Select your college" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-xl">
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept} className="rounded-xl py-3">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reason" className="text-sm font-black uppercase tracking-widest text-slate-400">Primary Reason</Label>
                    <Select 
                      value={formData.reason} 
                      onValueChange={(val) => setFormData({...formData, reason: val})}
                      required
                    >
                      <SelectTrigger id="reason" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50">
                        <SelectValue placeholder="Purpose of visit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-xl max-h-80">
                        {VISIT_REASON_GROUPS.map((group) => (
                          <SelectGroup key={group.label}>
                            <SelectLabel className="text-primary font-black px-4 pt-4 pb-2 text-[10px] uppercase tracking-tighter">{group.label}</SelectLabel>
                            {group.reasons.map((r) => (
                              <SelectItem key={r} value={r} className="rounded-xl py-3">{r}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label htmlFor="details" className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  Additional Details <span className="text-[10px] font-medium text-slate-300 normal-case">(Optional)</span>
                </Label>
                <Textarea 
                  id="details"
                  placeholder="Tell us more about your specific needs or goals for this visit..."
                  className="min-h-[140px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 p-6 resize-none focus:bg-white transition-all text-base"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                />
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-16 bg-primary text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.01] transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Finalizing Entry...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-3 h-6 w-6" /> Confirm Entry
                    </>
                  )}
                </Button>
                <p className="text-center mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                  By clicking confirm, you agree to follow facility guidelines.
                </p>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "secondary" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" && "border-transparent bg-primary text-primary-foreground",
      variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
      className
    )}>
      {children}
    </span>
  );
}