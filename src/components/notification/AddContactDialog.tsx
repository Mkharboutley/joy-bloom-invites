
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContactAdded: () => void;
}

const AddContactDialog = ({ isOpen, onOpenChange, onContactAdded }: AddContactDialogProps) => {
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    email: '',
    notification_type: 'whatsapp',
    is_active: true
  });
  const { toast } = useToast();

  const addAdminContact = async () => {
    if (!newContact.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم جهة الاتصال",
        variant: "destructive"
      });
      return;
    }

    if ((newContact.notification_type === 'sms' || newContact.notification_type === 'whatsapp') && !newContact.phone_number.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف للإشعارات النصية أو WhatsApp",
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

    try {
      const { error } = await supabase
        .from('admin_contacts')
        .insert([newContact]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة جهة الاتصال بنجاح"
      });

      setNewContact({
        name: '',
        phone_number: '',
        email: '',
        notification_type: 'whatsapp',
        is_active: true
      });
      onOpenChange(false);
      onContactAdded();
    } catch (error) {
      console.error('Error adding admin contact:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Label className="text-white">نوع الإشعار</Label>
            <Select 
              value={newContact.notification_type} 
              onValueChange={(value) => setNewContact({...newContact, notification_type: value})}
            >
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">رسائل نصية (SMS)</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
                <SelectItem value="push">إشعارات فورية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(newContact.notification_type === 'sms' || newContact.notification_type === 'whatsapp') && (
            <div>
              <Label className="text-white">رقم الهاتف</Label>
              <Input
                value={newContact.phone_number}
                onChange={(e) => setNewContact({...newContact, phone_number: e.target.value})}
                className="bg-white/20 border-white/30 text-white"
                placeholder="+966xxxxxxxxx"
              />
            </div>
          )}

          {newContact.notification_type === 'email' && (
            <div>
              <Label className="text-white">البريد الإلكتروني</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                className="bg-white/20 border-white/30 text-white"
                placeholder="example@email.com"
              />
            </div>
          )}

          <Button onClick={addAdminContact} className="w-full">
            إضافة جهة الاتصال
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
