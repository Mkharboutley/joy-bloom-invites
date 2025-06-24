
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addBulkWhatsAppContacts } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import PhoneImport from './contact-import/PhoneImport';
import FileImport from './contact-import/FileImport';
import ManualImport from './contact-import/ManualImport';
import ImportInstructions from './contact-import/ImportInstructions';

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

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            استيراد جهات الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PhoneImport />
          <FileImport onFileUpload={handleFileUpload} />
          <ManualImport 
            csvData={csvData}
            onCsvDataChange={setCsvData}
            onImport={handleImport}
            loading={loading}
          />
          <ImportInstructions />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactImport;
