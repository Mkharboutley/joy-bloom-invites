
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Users, Phone } from 'lucide-react';
import { addBulkWhatsAppContacts } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const ContactImport = () => {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const contacts = [];

    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 2) {
        contacts.push({
          name: parts[0],
          phone_number: parts[1],
          source: 'import'
        });
      }
    }

    return contacts;
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال بيانات جهات الاتصال أو تحميل ملف",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const contacts = parseCsvData(csvData);
      
      if (contacts.length === 0) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على جهات اتصال صالحة",
          variant: "destructive"
        });
        return;
      }

      await addBulkWhatsAppContacts(contacts);
      setCsvData('');
      
      toast({
        title: "تم بنجاح",
        description: `تم استيراد ${contacts.length} جهة اتصال`
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في استيراد جهات الاتصال",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneImport = async () => {
    toast({
      title: "قريباً",
      description: "سيتم إضافة ميزة استيراد جهات الاتصال من الهاتف قريباً",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            استيراد جهات الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Import */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold" dir="rtl">استيراد من الهاتف</h3>
            <p className="text-white/70 text-sm" dir="rtl">
              استيراد جهات الاتصال مباشرة من هاتفك
            </p>
            <Button
              onClick={handlePhoneImport}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
            >
              <Phone className="w-4 h-4 ml-2" />
              استيراد من الهاتف
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold" dir="rtl">تحميل ملف CSV</h3>
            <p className="text-white/70 text-sm" dir="rtl">
              حمل ملف CSV بالتنسيق: الاسم، رقم الهاتف
            </p>
            <Input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Manual Input */}
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold" dir="rtl">إدخال يدوي</h3>
            <p className="text-white/70 text-sm" dir="rtl">
              أدخل جهات الاتصال بالتنسيق: الاسم، رقم الهاتف (كل جهة اتصال في سطر منفصل)
            </p>
            <Textarea
              placeholder="أحمد، 966501234567
فاطمة، 966507654321
محمد، 966509876543"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32"
              dir="rtl"
            />
            <Button
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
            >
              <Users className="w-4 h-4 ml-2" />
              {loading ? 'جاري الاستيراد...' : 'استيراد جهات الاتصال'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-400/30">
            <h4 className="text-amber-400 font-semibold mb-2" dir="rtl">تعليمات:</h4>
            <ul className="text-amber-300 text-sm space-y-1" dir="rtl">
              <li>• تأكد من أن أرقام الهواتف تتضمن رمز البلد (مثل: 966)</li>
              <li>• استخدم الفاصلة للفصل بين الاسم ورقم الهاتف</li>
              <li>• كل جهة اتصال في سطر منفصل</li>
              <li>• تأكد من صحة البيانات قبل الاستيراد</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactImport;
