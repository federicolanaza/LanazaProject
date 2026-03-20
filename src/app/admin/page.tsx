
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { isToday, isThisWeek, isThisMonth, format } from 'date-fns';
import { 
  Search, Users, Calendar, Activity, 
  LogOut, ShieldAlert, BarChart3, 
  Trash2, UserX, UserCheck, Library,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentUser, setCurrentUser, 
    visits, users, toggleBlockUser 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'VISITS' | 'USERS'>('VISITS');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/');
    }
  }, [currentUser, router]);

  const stats = useMemo(() => {
    const today = visits.filter(v => isToday(v.timestamp)).length;
    const week = visits.filter(v => isThisWeek(v.timestamp)).length;
    const month = visits.filter(v => isThisMonth(v.timestamp)).length;
    return { today, week, month };
  }, [visits]);

  const filteredVisits = useMemo(() => {
    if (!searchQuery) return visits;
    return visits.filter(v => 
      v.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visits, searchQuery]);

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
              <div className="bg-primary p-1.5 rounded-lg">
                <Library className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary font-headline">LibTrack <span className="text-accent">Admin</span></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">Library Administrator</span>
              </div>
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
              <BarChart3 className="mr-2 h-4 w-4" /> Visits Log
            </Button>
            <Button 
              variant={activeTab === 'USERS' ? 'default' : 'ghost'} 
              className="rounded-lg h-9"
              onClick={() => setActiveTab('USERS')}
            >
              <Users className="mr-2 h-4 w-4" /> User Management
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Daily Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground mt-1">Visitors checked-in today</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8 group-hover:bg-accent/10 transition-colors" />
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
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-3/5 rounded-full -mr-8 -mt-8 group-hover:bg-chart-3/10 transition-colors" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-chart-3" /> Monthly Peak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.month}</div>
              <p className="text-xs text-muted-foreground mt-1">Historical monthly total</p>
            </CardContent>
          </Card>
        </div>

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
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={activeTab === 'VISITS' ? "Search visits..." : "Lookup user by name..."}
                  className="pl-9 h-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === 'VISITS' ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/30">
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>College/Dept</TableHead>
                    <TableHead className="max-w-[300px]">AI Insight Tool</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        {format(new Date(visit.timestamp), 'MMM dd, yyyy')}<br/>
                        <span className="text-foreground">{format(new Date(visit.timestamp), 'hh:mm a')}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{visit.userName}</span>
                          <span className="text-xs text-muted-foreground">{visit.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                          {visit.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {visit.aiInsights ? (
                          <div className="space-y-2 py-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                              <Sparkles className="h-3 w-3" /> AI Summary
                            </div>
                            <p className="text-xs italic text-muted-foreground leading-relaxed">
                              "{visit.aiInsights.summary}"
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {visit.aiInsights.categories.map(cat => (
                                <Badge key={cat} className="text-[10px] py-0 px-1.5 h-4 bg-accent/20 text-accent-foreground border-none">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No analysis available</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVisits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                        No visit records found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Institutional Email</TableHead>
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
                          <span className="font-semibold">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="font-medium">Blocked</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-none font-medium">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant={user.isBlocked ? "outline" : "ghost"}
                          size="sm"
                          className={user.isBlocked ? "text-green-600 border-green-200" : "text-destructive hover:bg-destructive/10"}
                          onClick={() => {
                            toggleBlockUser(user.id);
                            toast({
                              title: user.isBlocked ? 'User Unblocked' : 'User Blocked',
                              description: `${user.name} has been ${user.isBlocked ? 'granted' : 'restricted from'} facility access.`,
                            });
                          }}
                        >
                          {user.isBlocked ? (
                            <><UserCheck className="mr-2 h-4 w-4" /> Grant Access</>
                          ) : (
                            <><UserX className="mr-2 h-4 w-4" /> Block User</>
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
