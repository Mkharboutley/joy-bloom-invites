
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX } from 'lucide-react';
import { subscribeToGuests, type Guest } from '@/services/firebase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AttendanceStatusView = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    apologized: 0
  });

  useEffect(() => {
    const unsubscribe = subscribeToGuests((guestList) => {
      setGuests(guestList);
      
      const confirmed = guestList.filter(guest => guest.status === 'confirmed').length;
      const apologized = guestList.filter(guest => guest.status === 'apologized').length;
      
      setStats({
        total: guestList.length,
        confirmed,
        apologized
      });
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ar });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm" dir="rtl">إجمالي المدعوين</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-3 bg-green-500/20 rounded-full">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm" dir="rtl">مؤكدي الحضور</p>
                <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-3 bg-red-500/20 rounded-full">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm" dir="rtl">معتذري الحضور</p>
                <p className="text-2xl font-bold text-white">{stats.apologized}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guests List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            قائمة المدعوين وحالة الحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">تاريخ التأكيد</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">تاريخ الاعتذار</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">رقم الدعوة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white text-right">{guest.fullName}</TableCell>
                    <TableCell className="text-right">
                      {guest.status === 'confirmed' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          مؤكد
                        </Badge>
                      )}
                      {guest.status === 'apologized' && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                          معتذر
                        </Badge>
                      )}
                      {!guest.status && (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                          بانتظار الرد
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-white text-right">
                      {guest.status === 'confirmed' ? formatDate(guest.confirmationTimestamp) : '-'}
                    </TableCell>
                    <TableCell className="text-white text-right">
                      {guest.status === 'apologized' ? formatDate(guest.apologyTimestamp) : '-'}
                    </TableCell>
                    <TableCell className="text-white text-right font-mono">
                      {guest.invitationId}
                    </TableCell>
                  </TableRow>
                ))}
                {guests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-white/60 py-8" dir="rtl">
                      لا توجد بيانات بعد
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceStatusView;
