
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { isToday, isThisWeek, isThisMonth, format } from 'date-fns';
import { 
  Search, Users, Calendar, Activity, 
  LogOut, ShieldAlert, BarChart3, 
  UserX, UserCheck, 
  Building2, BookOpen, Filter, GraduationCap, Briefcase, ChevronRight, LayoutDashboard, Database, Monitor, Smartphone, Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEPARTMENTS, VISIT_REASON_GROUPS, UserType, UserSession } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, updateDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { 
    currentUser, setCurrentUser, 
    visits, users, toggleBlockUser,
    currentSessionId, setCurrentSessionId
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'VISITS' | 'USERS' | 'SESSIONS'>('VISITS');
  
  // Filters
  const [filterType, setFilterType] = useState<UserType | 'ALL'>('ALL');
  const [filterDept, setFilterDept] = useState<string | 'ALL'>('ALL');
  const [filterReason, setFilterReason] = useState<string | 'ALL'>('ALL');

  // Real-time Active Sessions Query
  const sessionsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'user_sessions'), where('isActive', '==', true));
  }, [firestore]);

  const { data: activeSessions, isLoading: sessionsLoading } = useCollection<UserSession>(sessionsQuery);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/');
    }
  }, [currentUser, router]);

  const allReasons = useMemo(() => {
    return VISIT_REASON_GROUPS.flatMap(g => g.reasons);
  }, []);

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const matchesSearch = !searchQuery || 
        v.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.reason.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'ALL' || v.userType === filterType;
      const matchesDept = filterDept === 'ALL' || v.department === filterDept;
      const matchesReason = filterReason === 'ALL' || v.reason.includes(filterReason);

      return matchesSearch && matchesType && matchesDept && matchesReason;
    });
  }, [visits, searchQuery, filterType, filterDept, filterReason]);

  const stats = useMemo(() => {
    const today = filteredVisits.filter(v => isToday(new Date(v.timestamp))).length;
    const week = filteredVisits.filter(v => isThisWeek(new Date(v.timestamp))).length;
    const month = filteredVisits.filter(v => isThisMonth(new Date(v.timestamp))).length;
    return { today, week, month };
  }, [filteredVisits]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

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

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {/* Sidebar-like Top Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <Image 
                    src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                    alt="NEU Logo" 
                    width={28} 
                    height={28} 
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-primary leading-none">VirtuLib</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Control</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <Button 
                  variant={activeTab === 'VISITS' ? 'default' : 'ghost'} 
                  className={cn("rounded-xl h-10 px-6 font-bold transition-all", activeTab === 'VISITS' && "shadow-lg")}
                  onClick={() => setActiveTab('VISITS')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" /> Entry Log
                </Button>
                <Button 
                  variant={activeTab === 'USERS' ? 'default' : 'ghost'} 
                  className={cn("rounded-xl h-10 px-6 font-bold transition-all", activeTab === 'USERS' && "shadow-lg")}
                  onClick={() => setActiveTab('USERS')}
                >
                  <Users className="mr-2 h-4 w-4" /> Users
                </Button>
                <Button 
                  variant={activeTab === 'SESSIONS' ? 'default' : 'ghost'} 
                  className={cn("rounded-xl h-10 px-6 font-bold transition-all", activeTab === 'SESSIONS' && "shadow-lg")}
                  onClick={() => setActiveTab('SESSIONS')}
                >
                  <Activity className="mr-2 h-4 w-4" /> Active Sessions
                  {activeSessions && activeSessions.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-none text-[10px] h-5 px-1.5 font-black">
                      {activeSessions.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 leading-none">{currentUser.name}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Systems Administrator</span>
              </div>
              <Avatar className="h-12 w-12 border-2 border-primary/20 p-0.5">
                <AvatarImage src={currentUser.avatarUrl} className="rounded-full" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-2xl"
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto w-full px-6 py-10 lg:px-10 space-y-10 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
              <LayoutDashboard className="h-3 w-3" /> Dashboard Overview
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">System Analytics</h1>
            <p className="text-slate-500 font-medium">Monitoring facility utilization and real-time activity.</p>
          </div>
          
          <div className="flex gap-4 p-2 bg-white rounded-3xl shadow-sm border">
             <div className="px-6 py-2 border-r border-slate-100 last:border-0 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</span>
                <span className="text-xl font-black text-primary">{stats.today}</span>
             </div>
             <div className="px-6 py-2 border-r border-slate-100 last:border-0 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Week</span>
                <span className="text-xl font-black text-primary">{stats.week}</span>
             </div>
             <div className="px-6 py-2 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                <span className="text-xl font-black text-primary">{activeSessions?.length || 0}</span>
             </div>
          </div>
        </div>

        {/* Dynamic Data Content */}
        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 bg-slate-50/50 border-b flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-1">
                <Database className="h-3 w-3" /> {activeTab === 'SESSIONS' ? 'Real-time Stream' : 'Data Repository'}
              </div>
              <CardTitle className="text-2xl font-black">
                {activeTab === 'VISITS' ? 'Entry Logs' : activeTab === 'USERS' ? 'User Accounts' : 'Active Sessions'}
              </CardTitle>
            </div>
            {activeTab !== 'SESSIONS' && (
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Lookup records..."
                  className="pl-12 h-12 rounded-2xl bg-white border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {activeTab === 'VISITS' && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-none">
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Date & Time</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Destination</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Visitor Identity</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Academic Unit</TableHead>
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">AI Synthesis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id} className="group hover:bg-slate-50/80 transition-all border-slate-100">
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{format(new Date(visit.timestamp), 'hh:mm a')}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(visit.timestamp), 'MMM dd, yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none shadow-sm",
                            visit.domain === 'LIBRARY' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          )}>
                            {visit.domain.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                                {visit.userName}
                                {visit.userType === 'STUDENT' ? (
                                  <GraduationCap className="h-3 w-3 text-primary/40" />
                                ) : (
                                  <Briefcase className="h-3 w-3 text-accent/40" />
                                )}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">{visit.userEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-600">{visit.department}</span>
                        </TableCell>
                        <TableCell className="px-8 text-right max-w-[300px]">
                          {visit.aiInsights ? (
                            <div className="flex flex-col items-end gap-2">
                              <p className="text-[11px] font-medium text-slate-500 italic line-clamp-2 leading-relaxed">
                                "{visit.aiInsights.summary}"
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase italic">Raw Data</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'USERS' && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-none">
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">User Profile</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Account Details</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Clearance Status</TableHead>
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Administrative Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="group hover:bg-slate-50/80 transition-all border-slate-100">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-slate-900">{user.name}</span>
                              <Badge variant="outline" className="w-fit text-[8px] h-4 mt-1 bg-slate-50 border-slate-100 uppercase font-black text-slate-400">
                                {user.role}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-600">{user.email}</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{user.userType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isBlocked ? (
                            <Badge className="bg-destructive/10 text-destructive border-none font-black text-[9px] uppercase tracking-widest px-3 h-6">Suspended</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] uppercase tracking-widest px-3 h-6">Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <Button 
                            variant={user.isBlocked ? "outline" : "ghost"}
                            size="sm"
                            className={cn(
                              "h-10 rounded-xl px-4 font-bold transition-all",
                              user.isBlocked ? "text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50" : "text-destructive hover:bg-destructive/5"
                            )}
                            onClick={() => toggleBlockUser(user.id)}
                          >
                            {user.isBlocked ? <UserCheck className="mr-2 h-4 w-4" /> : <UserX className="mr-2 h-4 w-4" />}
                            {user.isBlocked ? 'Grant Access' : 'Restrict Access'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'SESSIONS' && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-none">
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Active User</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Device Type</TableHead>
                      <TableHead className="py-6 px-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Session Start</TableHead>
                      <TableHead className="py-6 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions?.map((session) => (
                      <TableRow key={session.id} className="group hover:bg-slate-50/80 transition-all border-slate-100">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                              {session.userName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-slate-900">{session.userName}</span>
                              <span className="text-[10px] font-medium text-slate-400">{session.userEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {session.deviceType === 'mobile' ? (
                              <Smartphone className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Monitor className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="text-xs font-bold text-slate-600 capitalize">{session.deviceType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-slate-300" />
                            <span className="text-xs font-medium text-slate-600">{format(new Date(session.loginTime), 'hh:mm:ss a')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <Badge className="bg-green-500 animate-pulse text-white border-none font-black text-[8px] uppercase tracking-widest px-2 h-5">
                            Live
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            {((activeTab === 'VISITS' && filteredVisits.length === 0) || (activeTab === 'USERS' && filteredUsers.length === 0) || (activeTab === 'SESSIONS' && (!activeSessions || activeSessions.length === 0))) && (
              <div className="py-20 text-center space-y-4 bg-slate-50/30">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                  <Database className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No Records Found</p>
                  <p className="text-slate-400 text-sm">Real-time data stream will appear here as users login.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
