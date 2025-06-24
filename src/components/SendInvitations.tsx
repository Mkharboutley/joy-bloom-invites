
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Send, Check, Users, MessageSquare } from 'lucide-react';
import { 
  getWhatsAppContacts, 
  getInvitationTemplates, 
  updateWhatsAppContactSelection,
  markBulkWhatsAppContactsAsSent,
  type WhatsAppContact,
  type InvitationTemplate 
} from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const SendInvitations = () => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsData, templatesData] = await Promise.all([
        getWhatsAppContacts(),
        getInvitationTemplates()
      ]);
      setContacts(contactsData);
      setTemplates(templatesData);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive"
      });
    }
  };

  const handleSelectContact = async (contactId: string, selected: boolean) => {
    try {
      await updateWhatsAppContactSelection(contactId, selected);
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, selected } : contact
      ));
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث التحديد",
        variant: "destructive"
      });
    }
  };

  const handleSelectAll = async () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const pendingContacts = contacts.filter(c => !c.is_sent);
    
    try {
      await Promise.all(
        pendingContacts.map(contact => 
          updateWhatsAppContactSelection(contact.id!, newSelectAll)
        )
      );
      
      setContacts(prev => prev.map(contact => 
        !contact.is_sent ? { ...contact, selected: newSelectAll } : contact
      ));
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث التحديد",
        variant: "destructive"
      });
    }
  };

  const generateWhatsAppMessage = (template: InvitationTemplate, contactName: string) => {
    const confirmationLink = `https://khajah.me/confirmation/guest-${Date.now()}`;
    return template.message
      .replace(/{name}/g, contactName)
      .replace(/{link}/g, confirmationLink);
  };

  const generateWhatsAppLink = (phoneNumber: string, message: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const handleBulkSend = async () => {
    if (!selectedTemplate) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار قالب الدعوة",
        variant: "destructive"
      });
      return;
    }

    const selectedContacts = contacts.filter(c => c.selected && !c.is_sent);
    
    if (selectedContacts.length === 0) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار جهات اتصال لإرسال الدعوات إليها",
        variant: "destructive"
      });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setLoading(true);
    
    try {
      // Open WhatsApp links for all selected contacts
      for (const contact of selectedContacts) {
        const message = generateWhatsAppMessage(template, contact.name);
        const whatsappUrl = generateWhatsAppLink(contact.phone_number, message);
        
        // Open in new tab with small delay to avoid blocking
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, selectedContacts.indexOf(contact) * 500);
      }

      // Mark contacts as sent
      const contactIds = selectedContacts.map(c => c.id!);
      await markBulkWhatsAppContactsAsSent(contactIds, selectedTemplate);
      
      await loadData();
      setSelectAll(false);
      
      toast({
        title: "تم بنجاح",
        description: `تم فتح WhatsApp لإرسال ${selectedContacts.length} دعوة`
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال الدعوات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingContacts = contacts.filter(c => !c.is_sent);
  const sentContacts = contacts.filter(c => c.is_sent);
  const selectedCount = pendingContacts.filter(c => c.selected).length;

  return (
    <div className="space-y-6">
      {/* Send Controls */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            إرسال الدعوات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block" dir="rtl">اختر قالب الدعوة</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
              >
                <option value="">اختر قالب...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleBulkSend}
                disabled={loading || !selectedTemplate || selectedCount === 0}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
              >
                <Send className="w-4 h-4 ml-2" />
                {loading ? 'جاري الإرسال...' : `إرسال ${selectedCount} دعوة`}
              </Button>
            </div>
          </div>

          {selectedTemplate && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
              <p className="text-blue-400 text-sm" dir="rtl">
                <strong>قالب محدد:</strong> {templates.find(t => t.id === selectedTemplate)?.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm" dir="rtl">إجمالي جهات الاتصال</p>
                <p className="text-xl font-bold text-white">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm" dir="rtl">في انتظار الإرسال</p>
                <p className="text-xl font-bold text-white">{pendingContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm" dir="rtl">تم الإرسال</p>
                <p className="text-xl font-bold text-white">{sentContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Contacts */}
      {pendingContacts.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white" dir="rtl">
                جهات الاتصال المعلقة ({pendingContacts.length})
              </CardTitle>
              <Button
                onClick={handleSelectAll}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Check className="w-4 h-4 ml-2" />
                {selectAll ? 'إلغاء التحديد' : 'تحديد الكل'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white text-right" dir="rtl">تحديد</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">رقم الهاتف</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">المصدر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-right">
                        <Checkbox
                          checked={contact.selected || false}
                          onCheckedChange={(checked) => 
                            handleSelectContact(contact.id!, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-white text-right">{contact.name}</TableCell>
                      <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                          {contact.source === 'import' ? 'مستورد' : 'يدوي'}
                        </Badge>
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
            <CardTitle className="text-white" dir="rtl">
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
                    <TableHead className="text-white text-right" dir="rtl">القالب المستخدم</TableHead>
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
                      <TableCell className="text-white text-right">
                        {contact.template_id ? 
                          templates.find(t => t.id === contact.template_id)?.name || 'غير محدد' 
                          : 'قالب قديم'
                        }
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

export default SendInvitations;
