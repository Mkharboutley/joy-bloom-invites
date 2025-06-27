import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { apologizeForAttendance } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

interface ApologyDialogProps {
  invitationId: string;
  onApologySuccess: () => void;
}

const ApologyDialog = ({ invitationId, onApologySuccess }: ApologyDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApology = async () => {
    setLoading(true);
    try {
      await apologizeForAttendance(invitationId);
      toast({
        title: "تم الإعتذار",
        description: "تم إلغاء حضورك بنجاح",
      });
      onApologySuccess();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في إلغاء الحضور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="w-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white border border-red-400/30 hover:border-red-400/50 rounded-xl"
        >
          الإعتذار عن الحضور
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white/10 backdrop-blur-md border-white/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-center" dir="rtl">
            تأكيد الإعتذار
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/80 text-center" dir="rtl">
            هل أنت متأكد من إلغاء الحضور؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl">
            لا
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleApology}
            disabled={loading}
            className="bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30 rounded-xl"
          >
            {loading ? 'جاري الإلغاء...' : 'نعم'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApologyDialog;