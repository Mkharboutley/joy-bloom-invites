
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { subscribeToGuests, Guest } from '@/services/firebase';
import VideoBackground from '@/components/VideoBackground';

const AttendanceDashboard = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGuests((updatedGuests) => {
      setGuests(updatedGuests.sort((a, b) => 
        (b.confirmationTimestamp?.toDate?.() || new Date()).getTime() - 
        (a.confirmationTimestamp?.toDate?.() || new Date()).getTime()
      ));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'غير محدد';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const confirmedGuests = guests.filter(guest => guest.status !== 'apologized');
  const apologizedGuests = guests.filter(guest => guest.status === 'apologized');

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <VideoBackground />
        <div className="text-white text-xl relative z-10">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground />
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl text-center" dir="rtl">
                لوحة تحكم تأكيدات الحضور
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Card className="bg-green-500/20 backdrop-blur-md border-green-400/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{confirmedGuests.length}</div>
                  <p className="text-green-300" dir="rtl">المؤكدين</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/20 backdrop-blur-md border-red-400/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{apologizedGuests.length}</div>
                  <p className="text-red-300" dir="rtl">المعتذرين</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guests Table */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center" dir="rtl">قائمة المدعوين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white text-right text-lg" dir="rtl">الاسم الكامل</TableHead>
                      <TableHead className="text-white text-right text-lg" dir="rtl">رقم الدعوة</TableHead>
                      <TableHead className="text-white text-right text-lg" dir="rtl">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id} className="border-white/20 hover:bg-white/5">
                        <TableCell className="text-white text-right font-medium" dir="rtl">
                          {guest.fullName}
                        </TableCell>
                        <TableCell className="text-white/80 text-right font-mono">
                          {guest.invitationId}
                        </TableCell>
                        <TableCell className="text-right">
                          {guest.status === 'apologized' ? (
                            <span className="text-red-400 font-semibold" dir="rtl">إعتذر عن الحضور</span>
                          ) : (
                            <span className="text-green-400 font-semibold" dir="rtl">مؤكد</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {guests.length === 0 && (
                  <div className="text-center py-12 text-white/60" dir="rtl">
                    لا توجد تأكيدات حضور بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
