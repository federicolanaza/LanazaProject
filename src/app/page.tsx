
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Library, LogIn, Mail } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setCurrentUser, users } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Institutional Login logic
    if (!email.endsWith('@neu.edu')) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Please use your institutional @neu.edu email address.',
      });
      setLoading(false);
      return;
    }

    // Check if user is blocked in mock store
    const existingUser = users.find(u => u.email === email);
    if (existingUser?.isBlocked) {
      toast({
        variant: 'destructive',
        title: 'Account Blocked',
        description: 'Your access to the library system has been restricted. Please contact administration.',
      });
      setLoading(false);
      return;
    }

    // Success simulation
    setTimeout(() => {
      const is_admin = email.startsWith('admin');
      const user = existingUser || {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        email: email,
        role: is_admin ? 'ADMIN' : 'VISITOR',
        isBlocked: false,
        avatarUrl: `https://picsum.photos/seed/${email}/100/100`
      };
      
      setCurrentUser(user as any);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      if (is_admin) {
        router.push('/admin');
      } else {
        router.push('/visitor');
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F2F5F8]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl shadow-lg mb-4">
            <Library className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">LibTrack Analytics</h1>
          <p className="text-muted-foreground">NEU Library Facility Management</p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Institutional Login</CardTitle>
            <CardDescription>Enter your school email to access the facility.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="name@neu.edu" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground px-1">Try: j.doe@neu.edu or admin@neu.edu</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg rounded-xl transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Sign in with Institution
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NEU Library Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}
