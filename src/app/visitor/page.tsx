
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
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function VisitorCheckIn() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { currentUser, setCurrentUser, addVisit, currentSessionId, setCurrentSessionId } = useAppStore();
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

  const handleLogout = async () => {
    if (currentSessionId) {
      try {
        await updateDoc(doc(firestore, 'user_sessions', currentSessionId), {
          isActive: false,
          logoutTime: new Date().toISOString()
        });
      } catch (err) {
        console.error("Logout update error:", err);
      }
    }
    setCurrentUser(null);
    setCurrentSessionId(null);
    router.push('/');
  };

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
        timestamp: new Date().toISOString(),
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
              onClick={handleLogout}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Facility Check-in</h2>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">Please select your destination and provide your visit details below.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            type="button"
            className={cn(
              "relative group h-40 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 transition-all p-6",
              formData.domain === 'LIBRARY' ? "border-primary bg-white shadow-xl shadow-primary/10 ring-4 ring-primary/5" : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
            )}
            onClick={() => setFormData({ ...formData, domain: 'LIBRARY' })}
          >
            <div className={cn("p-4 rounded-2xl transition-colors", formData.domain === 'LIBRARY' ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="text-center">
              <span className="block font-black text-lg text-slate-900">University Library</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resource Center</span>
            </div>
          </button>

          <button
            type="button"
            className={cn(
              "relative group h-40 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 transition-all p-6",
              formData.domain === 'DEANS_OFFICE' ? "border-primary bg-white shadow-xl shadow-primary/10 ring-4 ring-primary/5" : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
            )}
            onClick={() => setFormData({ ...formData, domain: 'DEANS_OFFICE' })}
          >
            <div className={cn("p-4 rounded-2xl transition-colors", formData.domain === 'DEANS_OFFICE' ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
              <Building2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <span className="block font-black text-lg text-slate-900">Dean's Office</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administration</span>
            </div>
          </button>
        </div>

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
                  <RadioGroup value={formData.userType} onValueChange={(val) => setFormData({...formData, userType: val as UserType})} className="grid grid-cols-1 gap-3">
                    <div className={cn("flex items-center space-x-3 rounded-2xl p-4 border-2", formData.userType === 'STUDENT' ? "border-primary bg-primary/5" : "border-slate-100")}>
                      <RadioGroupItem value="STUDENT" id="student" />
                      <Label htmlFor="student" className="font-bold flex items-center gap-3 cursor-pointer"><GraduationCap className="h-5 w-5" /> Student</Label>
                    </div>
                    <div className={cn("flex items-center space-x-3 rounded-2xl p-4 border-2", formData.userType === 'EMPLOYEE' ? "border-primary bg-primary/5" : "border-slate-100")}>
                      <RadioGroupItem value="EMPLOYEE" id="employee" />
                      <Label htmlFor="employee" className="font-bold flex items-center gap-3 cursor-pointer"><Briefcase className="h-5 w-5" /> Employee</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-slate-400">College Department</Label>
                    <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})} required>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50">
                        <SelectValue placeholder="Select your college" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Primary Reason</Label>
                    <Select value={formData.reason} onValueChange={(val) => setFormData({...formData, reason: val})} required>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50">
                        <SelectValue placeholder="Purpose of visit" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIT_REASON_GROUPS.map(group => (
                          <SelectGroup key={group.label}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {group.reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full h-16 bg-primary text-xl font-black rounded-2xl shadow-xl" disabled={loading}>
                  {loading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Processing...</> : <><CheckCircle2 className="mr-3 h-6 w-6" /> Confirm Entry</>}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
}
