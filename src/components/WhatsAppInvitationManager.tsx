import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, MessageSquare, Phone, Plus, Send, Trash2, Upload, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NotificationService from '@/services/notificationService';
import ZokoWhatsAppService from '@/services/zoko/zokoWhatsAppService';

interface WhatsAppContact {
  id: string;
  name: string;
  phone_number: string;
  is_sent: boolean;
  sent_at: string | null;
  selected: boolean;
  source: string;
  template_id: string | null;
}

interface InvitationTemplate {
  id: string;
  name: string;
  message: string;
  media_url: string | null;
  media_type: string | null;
  is_active: boolean;
}

const WhatsAppInvitationManager = () => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: ''
  });
  const [bulkContacts, setBulkContacts] = useState('');
  const { toast } = useToast();

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    fetchContacts();
    fetchTemplates();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل جهات الاتصال",
        variant: "destructive"
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const addContact = async () => {
    if (!newContact.name.trim() || !newContact.phone_number.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم ورقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    if (!ZokoWhatsAppService.validatePhoneNumber(newContact.phone_number)) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف غير صحيح",
        variant: "destructive"
      });
      return;
    }

    try {
      const zokoService = ZokoWhatsAppService.getInstance();
      const formattedPhone = zokoService.formatPhoneNumber(newContact.phone_number);
      
      const { error } = await supabase
        .from('whatsapp_contacts')
        .insert([{
          name: newContact.name,
          phone_number: formattedPhone,
          source: 'manual'
        }]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة جهة الاتصال بنجاح"
      });

      setNewContact({ name: '', phone_number: '' });
      setIsAddContactOpen(false);
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  const addBulkContacts = async () => {
    if (!bulkContacts.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جهات الاتصال",
        variant: "destructive"
      });
      return;
    }

    try {
      const lines = bulkContacts.split('\n').filter(line => line.trim());
      const contactsToAdd = [];
      const zokoService = ZokoWhatsAppService.getInstance();

      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          const name = parts[0];
          const phone = parts[1];
          
          if (ZokoWhatsAppService.validatePhoneNumber(phone)) {
            contactsToAdd.push({
              name,
              phone_number: zokoService.formatPhoneNumber(phone),
              source: 'bulk'
            });
          }
        }
      }

      if (contactsToAdd.length === 0) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على جهات اتصال صحيحة",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('whatsapp_contacts')
        .insert(contactsToAdd);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم إضافة ${contactsToAdd.length} جهة اتصال`
      });

      setBulkContacts('');
      fetchContacts();
    } catch (error) {
      console.error('Error adding bulk contacts:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة جهات الاتصال",
        variant: "destructive"
      });
    }
  };

  const toggleContactSelection = async (contactId: string, selected: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_contacts')
        .update({ selected })
        .eq('id', contactId);

      if (error) throw error;
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact selection:', error);
    }
  };

  const selectAllContacts = async (selected: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_contacts')
        .update({ selected })
        .eq('is_sent', false);

      if (error) throw error;
      fetchContacts();
    } catch (error) {
      console.error('Error selecting all contacts:', error);
    }
  };

  const sendInvitations = async () => {
    const selectedContacts = contacts.filter(contact => contact.selected && !contact.is_sent);
    
    if (selectedContacts.length === 0) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار جهات اتصال لإرسال الدعوات",
        variant: "destructive"
      });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار قالب الدعوة",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    setSendingProgress(0);

    try {
      const contactsForSending = selectedContacts.map(contact => ({
        name: contact.name,
        phoneNumber: contact.phone_number
      }));

      const result = await notificationService.sendBulkInvitations(
        contactsForSending,
        template.media_url || undefined,
        (sent, total) => {
          setSendingProgress((sent / total) * 100);
        }
      );

      // Update sent status in database
      for (const contact of selectedContacts) {
        const contactResult = result.results.find(r => r.contact.phoneNumber === contact.phone_number);
        if (contactResult?.success) {
          await supabase
            .from('whatsapp_contacts')
            .update({ 
              is_sent: true, 
              sent_at: new Date().toISOString(),
              template_id: selectedTemplate,
              selected: false
            })
            .eq('id', contact.id);
        }
      }

      toast({
        title: "تم الإرسال",
        description: `تم إرسال ${result.successful} دعوة بنجاح عبر Zoko، فشل ${result.failed} دعوة`
      });

      fetchContacts();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الدعوات",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      setSendingProgress(0);
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف جهة الاتصال بنجاح"
      });

      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  const selectedCount = contacts.filter(contact => contact.selected && !contact.is_sent).length;
  const sentCount = contacts.filter(contact => contact.is_sent).length;
  const totalCount = contacts.length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md">
          <TabsTrigger 
            value="contacts" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Users className="w-4 h-4 ml-2" />
            جهات الاتصال
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <MessageSquare className="w-4 h-4 ml-2" />
            قوالب الدعوات
          </TabsTrigger>
          <TabsTrigger 
            value="send" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Send className="w-4 h-4 ml-2" />
            إرسال الدعوات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white" dir="rtl">
                  إدارة جهات الاتصال ({totalCount})
                </CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة جهة اتصال
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/10 backdrop-blur-md border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-white text-center" dir="rtl">
                          إضافة جهة اتصال جديدة
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4" dir="rtl">
                        <div>
                          <Label className="text-white">الاسم</Label>
                          <Input
                            value={newContact.name}
                            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            placeholder="اسم الضيف"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-white">رقم الهاتف</Label>
                          <Input
                            value={newContact.phone_number}
                            onChange={(e) => setNewContact({...newContact, phone_number: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            placeholder="966501234567"
                          />
                          <p className="text-white/60 text-xs mt-1">
                            مثال: 966501234567 (بدون + أو whatsapp:)
                          </p>
                        </div>

                        <Button onClick={addContact} className="w-full">
                          إضافة جهة الاتصال
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Bulk Add Section */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <Label className="text-white text-sm mb-2 block" dir="rtl">
                    إضافة متعددة (اسم، رقم الهاتف - كل سطر منفصل)
                  </Label>
                  <Textarea
                    value={bulkContacts}
                    onChange={(e) => setBulkContacts(e.target.value)}
                    className="bg-white/20 border-white/30 text-white mb-2"
                    placeholder="أحمد محمد، 966501234567&#10;فاطمة علي، 966507654321"
                    rows={4}
                  />
                  <Button onClick={addBulkContacts} size="sm">
                    <Upload className="w-4 h-4 ml-2" />
                    إضافة الكل
                  </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg text-center">
                    <div className="text-white text-lg font-bold">{totalCount}</div>
                    <div className="text-white/70 text-sm">إجمالي</div>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg text-center">
                    <div className="text-white text-lg font-bold">{sentCount}</div>
                    <div className="text-white/70 text-sm">تم الإرسال</div>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg text-center">
                    <div className="text-white text-lg font-bold">{selectedCount}</div>
                    <div className="text-white/70 text-sm">محدد</div>
                  </div>
                </div>

                {/* Contacts Table */}
                <div className="rounded-md border border-white/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-white text-right" dir="rtl">
                          <Switch
                            checked={selectedCount > 0}
                            onCheckedChange={(checked) => selectAllContacts(checked)}
                          />
                        </TableHead>
                        <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                        <TableHead className="text-white text-right" dir="rtl">رقم الهاتف</TableHead>
                        <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                        <TableHead className="text-white text-right" dir="rtl">تاريخ الإرسال</TableHead>
                        <TableHead className="text-white text-right" dir="rtl">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                          <TableCell className="text-right">
                            <Switch
                              checked={contact.selected || false}
                              onCheckedChange={(checked) => toggleContactSelection(contact.id, checked)}
                              disabled={contact.is_sent}
                            />
                          </TableCell>
                          <TableCell className="text-white text-right">{contact.name}</TableCell>
                          <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                          <TableCell className="text-right">
                            {contact.is_sent ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                                تم الإرسال
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                                في الانتظار
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-white text-right">
                            {contact.sent_at ? new Date(contact.sent_at).toLocaleDateString('ar-SA') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteContact(contact.id)}
                              className="bg-red-500/20 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {contacts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-white/60 py-8" dir="rtl">
                            لا توجد جهات اتصال بعد
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center" dir="rtl">
                إرسال دعوات WhatsApp عبر Zoko
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" dir="rtl">
              {/* Template Selection */}
              <div>
                <Label className="text-white text-base mb-2 block">اختيار قالب الدعوة</Label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-3 bg-white/20 border border-white/30 text-white rounded-lg"
                >
                  <option value="">اختر قالب الدعوة</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Contacts Summary */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">ملخص الإرسال</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">جهات الاتصال المحددة:</span>
                    <span className="text-white font-bold mr-2">{selectedCount}</span>
                  </div>
                  <div>
                    <span className="text-white/70">القالب المختار:</span>
                    <span className="text-white font-bold mr-2">
                      {templates.find(t => t.id === selectedTemplate)?.name || 'لم يتم الاختيار'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sending Progress */}
              {isSending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-white text-sm">
                    <span>جاري الإرسال عبر Zoko...</span>
                    <span>{Math.round(sendingProgress)}%</span>
                  </div>
                  <Progress value={sendingProgress} className="w-full" />
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={sendInvitations}
                disabled={isSending || selectedCount === 0 || !selectedTemplate}
                className="w-full bg-green-600 hover:bg-green-700 h-12"
              >
                {isSending ? (
                  <>جاري الإرسال عبر Zoko...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    إرسال الدعوات ({selectedCount})
                  </>
                )}
              </Button>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                <AlertCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-green-200 text-sm">
                  <p className="font-semibold mb-1">✅ Zoko WhatsApp Business API:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• أرقام الهواتف يجب أن تكون بصيغة: 966501234567</li>
                    <li>• سيتم إرسال الدعوات عبر Zoko Business API</li>
                    <li>• معدل الإرسال: 80 رسالة في الدقيقة</li>
                    <li>• تتبع حالة التسليم متاح</li>
                    <li>• الردود التلقائية مُفعلة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppInvitationManager;
