
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Image, Video, FileText, Save } from 'lucide-react';
import { getInvitationTemplates, addInvitationTemplate, updateInvitationTemplate, deleteInvitationTemplate, type InvitationTemplate } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const InvitationConfig = () => {
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<InvitationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    message: '',
    media_url: '',
    media_type: '' as 'image' | 'video' | 'document' | ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getInvitationTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل القوالب",
        variant: "destructive"
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.message.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم القالب والرسالة",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (editingTemplate) {
        await updateInvitationTemplate(editingTemplate.id!, {
          name: newTemplate.name,
          message: newTemplate.message,
          media_url: newTemplate.media_url || undefined,
          media_type: newTemplate.media_type || undefined
        });
        toast({
          title: "تم بنجاح",
          description: "تم تحديث القالب"
        });
      } else {
        await addInvitationTemplate({
          name: newTemplate.name,
          message: newTemplate.message,
          media_url: newTemplate.media_url || undefined,
          media_type: newTemplate.media_type || undefined,
          is_active: true
        });
        toast({
          title: "تم بنجاح",
          description: "تم إنشاء القالب"
        });
      }
      
      setNewTemplate({ name: '', message: '', media_url: '', media_type: '' });
      setEditingTemplate(null);
      await loadTemplates();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ القالب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: InvitationTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      message: template.message,
      media_url: template.media_url || '',
      media_type: template.media_type || ''
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      try {
        await deleteInvitationTemplate(id);
        await loadTemplates();
        toast({
          title: "تم بنجاح",
          description: "تم حذف القالب"
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في حذف القالب",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setNewTemplate({ name: '', message: '', media_url: '', media_type: '' });
  };

  const getMediaIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Template Form */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            {editingTemplate ? 'تعديل القالب' : 'إنشاء قالب دعوة جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="اسم القالب"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="rtl"
            />
            <select
              value={newTemplate.media_type}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, media_type: e.target.value as any }))}
              className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
            >
              <option value="">بدون وسائط</option>
              <option value="image">صورة</option>
              <option value="video">فيديو</option>
              <option value="document">مستند</option>
            </select>
          </div>
          
          {newTemplate.media_type && (
            <Input
              placeholder="رابط الوسائط (اختياري)"
              value={newTemplate.media_url}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, media_url: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="rtl"
            />
          )}

          <Textarea
            placeholder="نص الدعوة...

مثال:
مرحباً {name}! 
تتم دعوتك لحضور زفاف سعد و هديل
التاريخ: [التاريخ]
المكان: [المكان]
يرجى تأكيد حضورك: {link}

نتطلع لرؤيتك! 💐"
            value={newTemplate.message}
            onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32"
            dir="rtl"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSaveTemplate}
              disabled={loading}
              className="bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? 'جاري الحفظ...' : (editingTemplate ? 'تحديث القالب' : 'حفظ القالب')}
            </Button>
            {editingTemplate && (
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                إلغاء
              </Button>
            )}
          </div>

          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <p className="text-blue-400 text-sm" dir="rtl">
              <strong>متغيرات متاحة:</strong> {"{name}"} للاسم، {"{link}"} لرابط التأكيد
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            قوالب الدعوات ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white text-right" dir="rtl">اسم القالب</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">نوع الوسائط</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-white text-right" dir="rtl">العمليات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white text-right">{template.name}</TableCell>
                    <TableCell className="text-right">
                      {template.media_type ? (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                          {getMediaIcon(template.media_type)}
                          <span className="mr-1">
                            {template.media_type === 'image' && 'صورة'}
                            {template.media_type === 'video' && 'فيديو'}
                            {template.media_type === 'document' && 'مستند'}
                          </span>
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                          نص فقط
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-white text-right">
                      {template.created_at ? new Date(template.created_at).toLocaleDateString('ar-SA') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleEditTemplate(template)}
                          size="sm"
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteTemplate(template.id!)}
                          size="sm"
                          className="bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-white/60 py-8" dir="rtl">
                      لا توجد قوالب بعد. قم بإنشاء قالب جديد أعلاه.
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

export default InvitationConfig;
