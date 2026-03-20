'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, ShieldCheck, ArrowRight, Lock, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { UserType } from '@/lib/types';
import { useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { setCurrentUser, setCurrentSessionId, users } = useAppStore();
  const firestore = useFirestore();
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isInstitutionalEmail = email.endsWith('@neu.edu') || email.endsWith('@neu.edu.ph');
    
    if (!isInstitutionalEmail) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Please use your institutional @neu.edu or @neu.edu.ph email address.',
      });
      setLoading(false);
      return;
    }

    const is_admin = email.toLowerCase() === 'jcesperanza@neu.edu.ph' || email.startsWith('admin');
    
    // Step 1: Detect admin and show password field
    if (is_admin && !showPassword) {
      setShowPassword(true);
      setLoading(false);
      return;
    }

    // Step 2: Validate password for admin
    if (is_admin && password !== 'admin123') {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Incorrect administrative password.',
      });
      setLoading(false);
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser?.isBlocked) {
      toast({
        variant: 'destructive',
        title: 'Account Blocked',
        description: 'Your access to the library system has been restricted. Please contact administration.',
      });
      setLoading(false);
      return;
    }

    const is_employee = email.includes('.staff') || email.includes('.prof') || is_admin;

    try {
      // Authenticate with Firebase to populate request.auth in Security Rules
      const authResult = await signInAnonymously(auth);
      const uid = authResult.user.uid;
      
      const userData = {
        id: uid, 
        name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        email: email,
        role: is_admin ? 'ADMIN' : 'VISITOR',
        userType: (is_employee ? 'EMPLOYEE' : 'STUDENT') as UserType,
        isBlocked: false,
        avatarUrl: `https://picsum.photos/seed/${email}/100/100`,
        updatedAt: new Date().toISOString(),
      };
      
      // Bootstrap the admin role in Firestore if this user is the designated admin
      if (is_admin) {
        const adminRoleRef = doc(firestore, 'roles_admin', uid);
        setDocumentNonBlocking(adminRoleRef, { 
          email: userData.email, 
          createdAt: new Date().toISOString() 
        }, { merge: true });
      }

      // Save user profile
      const userRef = doc(firestore, 'users', uid);
      
      const firestoreData: any = { ...userData };
      if (!existingUser?.id) {
        firestoreData.createdAt = new Date().toISOString();
      }

      setDocumentNonBlocking(userRef, firestoreData, { merge: true });

      const sessionId = Math.random().toString(36).substr(2, 9);
      const sessionRef = doc(firestore, 'user_sessions', sessionId);

      // Record session
      setDocumentNonBlocking(sessionRef, {
        id: sessionId,
        userId: uid,
        userName: userData.name,
        userEmail: userData.email,
        loginTime: new Date().toISOString(),
        isActive: true,
        deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      }, { merge: true });

      setCurrentUser(userData as any);
      setCurrentSessionId(sessionId);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.name}! Access level: ${userData.role}`,
      });
      
      if (userData.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/visitor');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message || 'Failed to sign in. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-tr from-slate-100 to-blue-50">
      <div className="w-full max-w-[440px] relative">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-2xl mb-6 border border-slate-100 transition-transform hover:scale-105">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              width={90} 
              height={90} 
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-primary mb-2">VirtuLib</h1>
          <p className="text-slate-500 font-medium">Next-Gen Facility Access Management</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="pt-8 pb-4">
            <div className="flex items-center gap-2 text-primary/80 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {showPassword ? 'Security Verification' : 'Secure Access'}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">
              {showPassword ? 'Admin Verification' : 'Institutional Login'}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {showPassword ? 'Enter your administrative credentials.' : 'Sign in with your university credentials to continue.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${showPassword ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-primary'}`} />
                  <Input 
                    type="email" 
                    placeholder="name@neu.edu.ph" 
                    className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-base disabled:opacity-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={showPassword}
                    required
                  />
                </div>

                {showPassword && (
                  <div className="relative group animate-in slide-in-from-top-2 duration-300">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="password"
                      placeholder="Admin Password"
                      className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-base"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                )}

                {!showPassword && (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Admin Demo: jcesperanza@neu.edu.ph</span>
                  </div>
                )}
                
                {showPassword && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPassword(false)}
                    className="text-slate-400 hover:text-primary text-xs font-bold gap-1 px-1 h-auto"
                  >
                    <ChevronLeft className="h-3 w-3" /> Use different email
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="pb-8 pt-2">
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px] group" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {showPassword ? 'Login to Dashboard' : 'Continue'} 
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} NEU Library Services
          </p>
        </div>
      </div>
    </div>
  );
}
