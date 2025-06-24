
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { subscribeToGuests, Guest } from '@/services/firebase';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
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
        <div className="grid grid-cols-1 max-w-md mx-auto">
          <Card className="bg-green-500/20 backdrop-blur-md border-green-400/30">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{guests.length}</div>
                <p className="text-green-300" dir="rtl">إجمالي المؤكدين</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guests Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white" dir="rtl">قائمة المؤكدين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white text-right" dir="rtl">الاسم الكامل</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">رقم الدعوة</TableHead>
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
  );
};

export default AttendanceDashboard;
