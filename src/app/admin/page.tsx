
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
  Building2, BookOpen, Filter, GraduationCap, Briefcase
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEPARTMENTS, VISIT_REASON_GROUPS, UserType } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentUser, setCurrentUser, 
    visits, users, toggleBlockUser 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'VISITS' | 'USERS'>('VISITS');
  
  // Filters
  const [filterType, setFilterType] = useState<UserType | 'ALL'>('ALL');
  const [filterDept, setFilterDept] = useState<string | 'ALL'>('ALL');
  const [filterReason, setFilterReason] = useState<string | 'ALL'>('ALL');

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
    const today = filteredVisits.filter(v => isToday(v.timestamp)).length;
    const week = filteredVisits.filter(v => isThisWeek(v.timestamp)).length;
    const month = filteredVisits.filter(v => isThisMonth(v.timestamp)).length;
    return { today, week, month };
  }, [filteredVisits]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F2F5F8]">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 w-full bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-lg border">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                  alt="NEU Logo" 
                  width={24} 
                  height={24} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-primary font-headline">VirtuLib <span className="text-accent">Admin</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9 border border-primary/20">
                <AvatarImage src={currentUser.avatarUrl} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setCurrentUser(null); router.push('/'); }}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Overview</h1>
            <p className="text-muted-foreground">Real-time facility usage and visitor management.</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border">
            <Button 
              variant={activeTab === 'VISITS' ? 'default' : 'ghost'} 
              className="rounded-lg h-9"
              onClick={() => setActiveTab('VISITS')}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> Entry Log
            </Button>
            <Button 
              variant={activeTab === 'USERS' ? 'default' : 'ghost'} 
              className="rounded-lg h-9"
              onClick={() => setActiveTab('USERS')}
            >
              <Users className="mr-2 h-4 w-4" /> Users
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Daily Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground mt-1">Visitors (filtered view)</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" /> Weekly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.week}</div>
              <p className="text-xs text-muted-foreground mt-1">Total visits this week</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-chart-3" /> Monthly Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.month}</div>
              <p className="text-xs text-muted-foreground mt-1">Historical monthly total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        {activeTab === 'VISITS' && (
          <Card className="border-none shadow-sm bg-white overflow-visible">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5 px-1">
                  <Filter className="h-3 w-3" /> Classification
                </label>
                <Select value={filterType} onValueChange={(val) => setFilterType(val as any)}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder="All Visitor Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="EMPLOYEE">Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5 px-1">
                  <Building2 className="h-3 w-3" /> College Department
                </label>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Departments</SelectItem>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5 px-1">
                  <BookOpen className="h-3 w-3" /> Visit Reason
                </label>
                <Select value={filterReason} onValueChange={setFilterReason}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue placeholder="All Reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Reasons</SelectItem>
                    {allReasons.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5 px-1">
                  <Search className="h-3 w-3" /> Search
                </label>
                <Input 
                  placeholder="Name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{activeTab === 'VISITS' ? 'Facility Entry Logs' : 'System Users'}</CardTitle>
                <CardDescription>
                  {activeTab === 'VISITS' 
                    ? `Showing ${filteredVisits.length} recorded entries.` 
                    : `Managing ${filteredUsers.length} institutional accounts.`
                  }
                </CardDescription>
              </div>
              {activeTab === 'USERS' && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Lookup user..."
                    className="pl-9 h-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === 'VISITS' ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/30">
                    <TableHead className="w-[150px]">Time</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="max-w-[250px]">AI Insight Tool</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        {format(new Date(visit.timestamp), 'MMM dd')}<br/>
                        <span className="text-foreground">{format(new Date(visit.timestamp), 'hh:mm a')}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "gap-1.5 font-semibold border-none",
                          visit.domain === 'LIBRARY' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                        )}>
                          {visit.domain === 'LIBRARY' ? <BookOpen className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                          {visit.domain === 'LIBRARY' ? 'Library' : "Dean's Office"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{visit.userName}</span>
                          <span className="text-[10px] text-muted-foreground">{visit.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(
                          "text-[10px] h-5 gap-1 border-none",
                          visit.userType === 'STUDENT' ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700"
                        )}>
                          {visit.userType === 'STUDENT' ? <GraduationCap className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                          {visit.userType === 'STUDENT' ? 'Student' : 'Employee'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{visit.department}</span>
                      </TableCell>
                      <TableCell>
                        {visit.aiInsights ? (
                          <div className="space-y-1.5 py-1">
                            <p className="text-[11px] italic text-muted-foreground leading-tight">
                              "{visit.aiInsights.summary}"
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {visit.aiInsights.categories.map(cat => (
                                <Badge key={cat} className="text-[9px] py-0 px-1.5 h-3.5 bg-accent/10 text-accent-foreground border-none">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No analysis</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{user.userType}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="text-[10px] h-5">Blocked</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px] h-5 border-none">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant={user.isBlocked ? "outline" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-8 text-xs",
                            user.isBlocked ? "text-green-600 border-green-200" : "text-destructive hover:bg-destructive/10"
                          )}
                          onClick={() => {
                            toggleBlockUser(user.id);
                            toast({
                              title: user.isBlocked ? 'User Unblocked' : 'User Blocked',
                              description: `${user.name} access updated.`,
                            });
                          }}
                        >
                          {user.isBlocked ? (
                            <><UserCheck className="mr-1 h-3 w-3" /> Grant</>
                          ) : (
                            <><UserX className="mr-1 h-3 w-3" /> Block</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
