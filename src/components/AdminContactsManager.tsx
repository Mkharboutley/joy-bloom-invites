
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { getAdminContacts, addAdminContact, deleteAdminContact, type AdminContact } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const AdminContactsManager = () => {
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    email: '',
    notification_type: 'sms' as 'sms' | 'push' | 'email'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getAdminContacts();
      setContacts(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل جهات الاتصال",
        variant: "destructive"
      });
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم",
        variant: "destructive"
      });
      return;
    }

    if (newContact.notification_type === 'sms' && !newContact.phone_number.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف للرسائل النصية",
        variant: "destructive"
      });
      return;
    }

    if (newContact.notification_type === 'email' && !newContact.email.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addAdminContact({
        ...newContact,
        is_active: true
      });
      
      setNewContact({
        name: '',
        phone_number: '',
        email: '',
        notification_type: 'sms'
      });
      
      await loadContacts();
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة جهة الاتصال"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة جهة الاتصال",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteAdminContact(id);
      await loadContacts();
      toast({
        title: "تم بنجاح",
        description: "تم حذف جهة الاتصال"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-center" dir="rtl">
          إدارة جهات اتصال الإدارة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Contact Form */}
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white font-semibold" dir="rtl">إضافة جهة اتصال جديدة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="الاسم"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="rtl"
            />
            
            <Select
              value={newContact.notification_type}
              onValueChange={(value: 'sms' | 'push' | 'email') => 
                setNewContact(prev => ({ ...prev, notification_type: value }))
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">رسائل نصية</SelectItem>
                <SelectItem value="push">إشعارات فورية</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
              </SelectContent>
            </Select>
            
            {(newContact.notification_type === 'sms' || newContact.notification_type === 'push') && (
              <Input
                placeholder="رقم الهاتف"
                value={newContact.phone_number}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone_number: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                dir="rtl"
              />
            )}
            
            {newContact.notification_type === 'email' && (
              <Input
                placeholder="البريد الإلكتروني"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                dir="rtl"
              />
            )}
          </div>
          
          <Button
            onClick={handleAddContact}
            disabled={loading}
            className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
          >
            <Plus className="w-4 h-4 ml-2" />
            {loading ? 'جاري الإضافة...' : 'إضافة جهة اتصال'}
          </Button>
        </div>

        {/* Contacts Table */}
        <div className="rounded-md border border-white/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-white/5">
                <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                <TableHead className="text-white text-right" dir="rtl">نوع الإشعار</TableHead>
                <TableHead className="text-white text-right" dir="rtl">جهة الاتصال</TableHead>
                <TableHead className="text-white text-right" dir="rtl">العمليات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                  <TableCell className="text-white text-right">{contact.name}</TableCell>
                  <TableCell className="text-white text-right">
                    {contact.notification_type === 'sms' && 'رسائل نصية'}
                    {contact.notification_type === 'push' && 'إشعارات فورية'}
                    {contact.notification_type === 'email' && 'بريد إلكتروني'}
                  </TableCell>
                  <TableCell className="text-white text-right">
                    {contact.phone_number || contact.email || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => contact.id && handleDeleteContact(contact.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-white/60 py-8" dir="rtl">
                    لا توجد جهات اتصال مضافة بعد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminContactsManager;
