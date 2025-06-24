
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Send, Plus } from 'lucide-react';
import { getWhatsAppContacts, addWhatsAppContact, addBulkWhatsAppContacts, markWhatsAppContactAsSent, type WhatsAppContact } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const WhatsAppManager = () => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone_number: '' });
  const [bulkContacts, setBulkContacts] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getWhatsAppContacts();
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
    if (!newContact.name.trim() || !newContact.phone_number.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم ورقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addWhatsAppContact(newContact);
      setNewContact({ name: '', phone_number: '' });
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

  const handleBulkAdd = async () => {
    if (!bulkContacts.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جهات الاتصال",
        variant: "destructive"
      });
      return;
    }

    const lines = bulkContacts.split('\n').filter(line => line.trim());
    const contactsToAdd: Array<{ name: string; phone_number: string }> = [];

    for (const line of lines) {
      const parts = line.trim().split(',');
      if (parts.length >= 2) {
        contactsToAdd.push({
          name: parts[0].trim(),
          phone_number: parts[1].trim()
        });
      }
    }

    if (contactsToAdd.length === 0) {
      toast({
        title: "خطأ",
        description: "تنسيق غير صحيح. استخدم: الاسم، رقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addBulkWhatsAppContacts(contactsToAdd);
      setBulkContacts('');
      await loadContacts();
      toast({
        title: "تم بنجاح",
        description: `تم إضافة ${contactsToAdd.length} جهة اتصال`
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة جهات الاتصال",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppLink = (phoneNumber: string) => {
    const message = encodeURIComponent(`
مرحباً! تم دعوتك لحضور زفاف سعد و هديل.

يرجى تأكيد حضورك من خلال الرابط التالي:
${window.location.origin}

نتطلع لرؤيتك في هذه المناسبة السعيدة! 💐
    `.trim());
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const handleSendWhatsApp = async (contact: WhatsAppContact) => {
    if (!contact.id) return;
    
    try {
      const whatsappUrl = generateWhatsAppLink(contact.phone_number);
      window.open(whatsappUrl, '_blank');
      
      await markWhatsAppContactAsSent(contact.id);
      await loadContacts();
      
      toast({
        title: "تم بنجاح",
        description: `تم فتح WhatsApp لإرسال الدعوة إلى ${contact.name}`
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الإرسال",
        variant: "destructive"
      });
    }
  };

  const pendingContacts = contacts.filter(c => !c.is_sent);
  const sentContacts = contacts.filter(c => c.is_sent);

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            إدارة رسائل WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Single Contact */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold" dir="rtl">إضافة جهة اتصال واحدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="الاسم"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                dir="rtl"
              />
              <Input
                placeholder="رقم الهاتف"
                value={newContact.phone_number}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone_number: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                dir="rtl"
              />
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

          {/* Bulk Add */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold" dir="rtl">إضافة متعددة</h3>
            <p className="text-white/70 text-sm" dir="rtl">
              أدخل جهات الاتصال بالتنسيق: الاسم، رقم الهاتف (كل جهة اتصال في سطر منفصل)
            </p>
            <Textarea
              placeholder="أحمد، 966501234567
فاطمة، 966507654321"
              value={bulkContacts}
              onChange={(e) => setBulkContacts(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32"
              dir="rtl"
            />
            <Button
              onClick={handleBulkAdd}
              disabled={loading}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
            >
              <Upload className="w-4 h-4 ml-2" />
              {loading ? 'جاري الإضافة...' : 'إضافة متعددة'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Contacts */}
      {pendingContacts.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center" dir="rtl">
              جهات الاتصال المعلقة ({pendingContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">رقم الهاتف</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white text-right">{contact.name}</TableCell>
                      <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleSendWhatsApp(contact)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
                          size="sm"
                        >
                          <Send className="w-4 h-4 ml-2" />
                          إرسال دعوة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Contacts */}
      {sentContacts.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center" dir="rtl">
              الدعوات المرسلة ({sentContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">رقم الهاتف</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">تاريخ الإرسال</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sentContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white text-right">{contact.name}</TableCell>
                      <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                      <TableCell className="text-white text-right">
                        {contact.sent_at ? new Date(contact.sent_at).toLocaleDateString('ar-SA') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppManager;
