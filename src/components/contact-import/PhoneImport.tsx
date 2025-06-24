
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { addBulkWhatsAppContacts } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

const PhoneImport = () => {
  const [phoneImporting, setPhoneImporting] = useState(false);
  const { toast } = useToast();

  const checkContactsApiSupport = () => {
    return 'contacts' in navigator && 'ContactsManager' in window;
  };

  const handlePhoneImport = async () => {
    setPhoneImporting(true);
    
    try {
      console.log('Checking browser support for Contacts API...');
      console.log('Navigator has contacts:', 'contacts' in navigator);
      console.log('Window has ContactsManager:', 'ContactsManager' in window);
      
      if (!checkContactsApiSupport()) {
        toast({
          title: "غير مدعوم",
          description: "متصفحك لا يدعم استيراد جهات الاتصال مباشرة. هذه الميزة تعمل فقط على Chrome للأندرويد أو Safari على iOS. الرجاء استخدام الطرق الأخرى للاستيراد.",
          variant: "destructive"
        });
        return;
      }

      console.log('Attempting to access contacts...');
      
      // Request contacts access
      const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: true });
      
      console.log('Contacts received:', contacts);
      
      if (contacts && contacts.length > 0) {
        const formattedContacts = contacts.map((contact: any) => ({
          name: contact.name?.[0] || contact.name || 'جهة اتصال',
          phone_number: contact.tel?.[0] || '',
          source: 'phone'
        })).filter((contact: any) => contact.phone_number);

        console.log('Formatted contacts:', formattedContacts);

        if (formattedContacts.length > 0) {
          await addBulkWhatsAppContacts(formattedContacts);
          toast({
            title: "تم بنجاح",
            description: `تم استيراد ${formattedContacts.length} جهة اتصال من الهاتف`
          });
        } else {
          toast({
            title: "تنبيه",
            description: "لم يتم العثور على جهات اتصال صالحة مع أرقام هواتف",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "تنبيه",
          description: "لم يتم اختيار أي جهات اتصال أو تم إلغاء العملية",
        });
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      
      let errorMessage = "فشل في استيراد جهات الاتصال من الهاتف.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "تم رفض الإذن للوصول إلى جهات الاتصال. الرجاء منح الإذن والمحاولة مرة أخرى.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "متصفحك لا يدعم هذه الميزة. استخدم Chrome على الأندرويد أو Safari على iOS.";
        }
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setPhoneImporting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-white font-semibold" dir="rtl">استيراد من الهاتف</h3>
      <p className="text-white/70 text-sm" dir="rtl">
        استيراد جهات الاتصال مباشرة من هاتفك (يتطلب إذن الوصول)
      </p>
      <Button
        onClick={handlePhoneImport}
        disabled={phoneImporting}
        className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30 disabled:opacity-50"
      >
        <Phone className="w-4 h-4 ml-2" />
        {phoneImporting ? 'جاري الاستيراد...' : 'استيراد من الهاتف'}
      </Button>
      <div className="text-white/50 text-xs space-y-1" dir="rtl">
        <p>⚠️ هذه الميزة تعمل فقط على:</p>
        <p>• Chrome على أجهزة الأندرويد</p>
        <p>• Safari على أجهزة iOS</p>
        <p>• قد لا تعمل على أجهزة الكمبيوتر المكتبية</p>
      </div>
    </div>
  );
};

export default PhoneImport;
