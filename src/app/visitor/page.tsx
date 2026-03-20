'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DEPARTMENTS } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { analyzeVisitorReasons } from '@/ai/flows/analyze-visitor-reasons';
import { LogOut, CheckCircle2, Loader2, Library } from 'lucide-react';

export default function VisitorCheckIn() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, setCurrentUser, addVisit } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    reason: ''
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // GenAI Analysis
      const insights = await analyzeVisitorReasons({ reasonForVisit: formData.reason });

      const newVisit = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        department: formData.department,
        reason: formData.reason,
        timestamp: new Date(),
        aiInsights: insights
      };

      addVisit(newVisit);

      toast({
        title: 'Welcome to VirtuLib!',
        description: 'Your visit has been recorded successfully.',
        duration: 5000,
      });

      // Clear form
      setFormData({ department: '', reason: '' });
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Library className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-headline text-primary">VirtuLib</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setCurrentUser(null); router.push('/'); }}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </header>

        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-extrabold text-foreground">Facility Check-in</h2>
          <p className="text-muted-foreground">Hello, {currentUser.name}. Please complete the form to register your entry.</p>
        </div>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Visitor Details</CardTitle>
            <CardDescription>This information helps us improve our library services.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="department">College Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(val) => setFormData({...formData, department: val})}
                  required
                >
                  <SelectTrigger id="department" className="h-12 rounded-xl">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea 
                  id="reason"
                  placeholder="e.g., Thesis research, borrowing books, group study..."
                  className="min-h-[120px] rounded-xl resize-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">Be as descriptive as possible for better service insights.</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-primary text-lg font-semibold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Recording Visit...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Complete Check-in
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>

        <footer className="text-center space-y-4 py-8">
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>Library Policy</span>
            <span>Support</span>
            <span>Contact</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
