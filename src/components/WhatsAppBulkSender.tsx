import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Send, Users, MessageSquare, FileText, Image, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WhatsAppService, { type WhatsAppContact, type WhatsAppTemplate } from '@/services/whatsappService';

const WhatsAppBulkSender = () => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState<any>(null);
  const [newContact, setNewContact] = useState({ name: '', phone_number: '' });
  const [newTemplate, setNewTemplate] = useState({ name: '', message: '', media_url: '', media_type: '' });
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const { toast } = useToast();

  const whatsappService = WhatsAppService.getInstance();

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
      toast({
        title: "خطأ",
        description: "فشل في تحميل القوالب",
        variant: "destructive"
      });
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

    try {
      const { error } = await supabase
        .from('whatsapp_contacts')
        .insert([{
          name: newContact.name,
          phone_number: newContact.phone_number,
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

  const addTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.message.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم القالب والرسالة",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('invitation_templates')
        .insert([{
          name: newTemplate.name,
          message: newTemplate.message,
          media_url: newTemplate.media_url || null,
          media_type: newTemplate.media_type || null
        }]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة القالب بنجاح"
      });

      setNewTemplate({ name: '', message: '', media_url: '', media_type: '' });
      setIsAddTemplateOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error adding template:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة القالب",
        variant: "destructive"
      });
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

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const sendBulkInvitations = async () => {
    if (!selectedTemplate) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار قالب الرسالة",
        variant: "destructive"
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار جهات اتصال للإرسال",
        variant: "destructive"
      });
      return;
    }

    if (!whatsappService.isConfigured()) {
      toast({
        title: "خطأ",
        description: "خدمة واتساب غير مكونة. الرجاء التحقق من متغيرات البيئة",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    setSendProgress(0);
    setSendResults(null);

    try {
      const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
      const template = templates.find(t => t.id === selectedTemplate);

      if (!template) {
        throw new Error('Template not found');
      }

      const results = await whatsappService.sendBulkInvitations(
        selectedContactsData,
        template,
        (sent, total, current) => {
          setSendProgress((sent / total) * 100);
          console.log(`Sent ${sent}/${total} - Current: ${current.name}`);
        }
      );

      setSendResults(results);
      
      // Update sent status in database
      for (const result of results.results) {
        if (result.success) {
          await supabase
            .from('whatsapp_contacts')
            .update({ 
              is_sent: true, 
              sent_at: new Date().toISOString(),
              template_id: selectedTemplate 
            })
            .eq('id', result.contact.id);
        }
      }

      toast({
        title: "تم الإرسال",
        description: `تم إرسال ${results.success} رسالة بنجاح من أصل ${results.success + results.failed}`
      });

      fetchContacts();
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الدعوات",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const importContactsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const contacts = [];

        for (let i = 1; i < lines.length; i++) { // Skip header
          const [name, phone] = lines[i].split(',');
          if (name && phone) {
            contacts.push({
              name: name.trim(),
              phone_number: phone.trim(),
              source: 'csv_import'
            });
          }
        }

        if (contacts.length > 0) {
          const { error } = await supabase
            .from('whatsapp_contacts')
            .insert(contacts);

          if (error) throw error;

          toast({
            title: "تم الاستيراد",
            description: `تم استيراد ${contacts.length} جهة اتصال بنجاح`
          });

          fetchContacts();
        }
      } catch (error) {
        console.error('Error importing contacts:', error);
        toast({
          title: "خطأ",
          description: "فشل في استيراد جهات الاتصال",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md">
          <TabsTrigger 
            value="send" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Send className="w-4 h-4 ml-2" />
            إرسال الدعوات
          </TabsTrigger>
          <TabsTrigger 
            value="contacts" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Users className="w-4 h-4 ml-2" />
            إدارة جهات الاتصال
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <MessageSquare className="w-4 h-4 ml-2" />
            قوالب الرسائل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center" dir="rtl">
                إرسال دعوات واتساب جماعية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" dir="rtl">
              {/* Template Selection */}
              <div>
                <Label className="text-white">اختيار قالب الرسالة</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="اختر قالب الرسالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {template.media_type === 'image' && <Image className="w-4 h-4" />}
                          {template.media_type === 'document' && <FileText className="w-4 h-4" />}
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-white">اختيار جهات الاتصال</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllContacts}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    {selectedContacts.length === contacts.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </Button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2 bg-white/10 rounded-lg p-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => toggleContactSelection(contact.id)}
                      />
                      <div className="flex-1">
                        <span className="text-white text-sm">{contact.name}</span>
                        <span className="text-white/70 text-xs block">{contact.phone_number}</span>
                      </div>
                      {contact.is_sent && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          تم الإرسال
                        </Badge>
                      )}
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-white/60 text-center py-4">لا توجد جهات اتصال</p>
                  )}
                </div>
              </div>

              {/* Send Progress */}
              {isSending && (
                <div className="space-y-2">
                  <Label className="text-white">جاري الإرسال...</Label>
                  <Progress value={sendProgress} className="w-full" />
                  <p className="text-white/70 text-sm text-center">{Math.round(sendProgress)}%</p>
                </div>
              )}

              {/* Send Results */}
              {sendResults && (
                <div className="bg-white/10 rounded-lg p-4 space-y-2">
                  <h4 className="text-white font-semibold">نتائج الإرسال:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-green-400 text-2xl font-bold">{sendResults.success}</p>
                      <p className="text-white/70 text-sm">تم الإرسال بنجاح</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-2xl font-bold">{sendResults.failed}</p>
                      <p className="text-white/70 text-sm">فشل في الإرسال</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={sendBulkInvitations}
                disabled={isSending || selectedContacts.length === 0 || !selectedTemplate}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 ml-2" />
                {isSending ? 'جاري الإرسال...' : `إرسال إلى ${selectedContacts.length} جهة اتصال`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white" dir="rtl">
                  إدارة جهات الاتصال
                </CardTitle>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importContactsFromCSV}
                    className="hidden"
                    id="csv-import"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('csv-import')?.click()}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-white border-blue-400/30"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    استيراد CSV
                  </Button>
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
                            placeholder="اسم جهة الاتصال"
                          />
                        </div>
                        <div>
                          <Label className="text-white">رقم الهاتف</Label>
                          <Input
                            value={newContact.phone_number}
                            onChange={(e) => setNewContact({...newContact, phone_number: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            placeholder="+966xxxxxxxxx"
                          />
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
              <div className="rounded-md border border-white/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
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
                        <TableCell className="text-white text-right">{contact.name}</TableCell>
                        <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                        <TableCell className="text-right">
                          {contact.is_sent ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                              تم الإرسال
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                              لم يتم الإرسال
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
                        <TableCell colSpan={5} className="text-center text-white/60 py-8" dir="rtl">
                          لا توجد جهات اتصال بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white" dir="rtl">
                  قوالب الرسائل
                </CardTitle>
                <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة قالب
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white text-center" dir="rtl">
                        إضافة قالب رسالة جديد
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4" dir="rtl">
                      <div>
                        <Label className="text-white">اسم القالب</Label>
                        <Input
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                          className="bg-white/20 border-white/30 text-white"
                          placeholder="اسم القالب"
                        />
                      </div>
                      <div>
                        <Label className="text-white">نص الرسالة</Label>
                        <Textarea
                          value={newTemplate.message}
                          onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})}
                          className="bg-white/20 border-white/30 text-white min-h-[100px]"
                          placeholder="نص الرسالة... يمكنك استخدام {name} لإدراج اسم المدعو"
                        />
                      </div>
                      <div>
                        <Label className="text-white">رابط الوسائط (اختياري)</Label>
                        <Input
                          value={newTemplate.media_url}
                          onChange={(e) => setNewTemplate({...newTemplate, media_url: e.target.value})}
                          className="bg-white/20 border-white/30 text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label className="text-white">نوع الوسائط</Label>
                        <Select 
                          value={newTemplate.media_type} 
                          onValueChange={(value) => setNewTemplate({...newTemplate, media_type: value})}
                        >
                          <SelectTrigger className="bg-white/20 border-white/30 text-white">
                            <SelectValue placeholder="اختر نوع الوسائط" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">بدون وسائط</SelectItem>
                            <SelectItem value="image">صورة</SelectItem>
                            <SelectItem value="document">مستند</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addTemplate} className="w-full">
                        إضافة القالب
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold">{template.name}</h4>
                        {template.media_type === 'image' && <Image className="w-4 h-4 text-blue-400" />}
                        {template.media_type === 'document' && <FileText className="w-4 h-4 text-green-400" />}
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        نشط
                      </Badge>
                    </div>
                    <p className="text-white/80 text-sm mb-2" dir="rtl">{template.message}</p>
                    {template.media_url && (
                      <p className="text-blue-400 text-xs" dir="rtl">
                        وسائط: {template.media_url}
                      </p>
                    )}
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-white/60 text-center py-8" dir="rtl">
                    لا توجد قوالب بعد
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppBulkSender;