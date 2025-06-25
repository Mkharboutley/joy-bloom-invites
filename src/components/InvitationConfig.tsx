
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Image, Video, FileText, Save, Link, Eye } from 'lucide-react';
import { getInvitationTemplates, addInvitationTemplate, updateInvitationTemplate, deleteInvitationTemplate, type InvitationTemplate } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import MultimediaPreview from './MultimediaPreview';

const InvitationConfig = () => {
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<InvitationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    message: '',
    media_url: '',
    media_type: '' as 'image' | 'video' | 'document' | 'link' | ''
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
      case 'link': return <Link className="w-4 h-4" />;
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
              className="bg-gray-800/90 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
            >
              <option value="" className="bg-gray-800 text-white">بدون وسائط</option>
              <option value="image" className="bg-gray-800 text-white">صورة</option>
              <option value="video" className="bg-gray-800 text-white">فيديو</option>
              <option value="document" className="bg-gray-800 text-white">مستند</option>
              <option value="link" className="bg-gray-800 text-white">رابط</option>
            </select>
          </div>
          
          {newTemplate.media_type && (
            <Input
              placeholder={newTemplate.media_type === 'link' ? "رابط الموقع أو الصفحة" : "رابط الوسائط (اختياري)"}
              value={newTemplate.media_url}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, media_url: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="rtl"
            />
          )}

          {/* Media Preview */}
          {newTemplate.media_url && newTemplate.media_type && newTemplate.media_type.length > 0 && (
            <div>
              <p className="text-white/80 text-sm mb-2" dir="rtl">معاينة الوسائط:</p>
              <MultimediaPreview template={{
                id: 'preview',
                name: newTemplate.name,
                message: newTemplate.message,
                media_url: newTemplate.media_url,
                media_type: newTemplate.media_type as 'image' | 'video' | 'document' | 'link',
                is_active: true
              }} />
            </div>
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

          {/* Instructions */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <p className="text-blue-400 text-sm" dir="rtl">
              <strong>متغيرات متاحة:</strong> {"{name}"} للاسم، {"{link}"} لرابط التأكيد
              <br />
              <strong>للوسائط المتعددة:</strong> سيتم إرفاق الصورة/الفيديو/المستند مع الرسالة
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
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{template.name}</h3>
                        {template.media_type && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                            {getMediaIcon(template.media_type)}
                            <span className="mr-1">
                              {template.media_type === 'image' && 'صورة'}
                              {template.media_type === 'video' && 'فيديو'}
                              {template.media_type === 'document' && 'مستند'}
                              {template.media_type === 'link' && 'رابط'}
                            </span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/60 text-sm mb-2 line-clamp-2">
                        {template.message.substring(0, 100)}...
                      </p>
                      <p className="text-white/40 text-xs">
                        تاريخ الإنشاء: {template.created_at ? new Date(template.created_at).toLocaleDateString('ar-SA') : '-'}
                      </p>
                    </div>
                    
                    {template.media_url && (
                      <div className="flex-shrink-0 w-32">
                        <MultimediaPreview template={template} />
                      </div>
                    )}
                    
                    <div className="flex gap-2 flex-shrink-0">
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
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <div className="text-center text-white/60 py-8" dir="rtl">
                لا توجد قوالب بعد. قم بإنشاء قالب جديد أعلاه.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationConfig;
