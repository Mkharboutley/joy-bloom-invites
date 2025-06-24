
import GlassCard from './GlassCard';

const EventDetails = () => {
  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-white text-xl font-bold text-center" dir="rtl">تفاصيل المناسبة</h3>
      
      <div className="space-y-3 text-white" dir="rtl">
        <div className="flex justify-between">
          <span className="font-semibold">التاريخ:</span>
          <span>٤ يوليو ٢٠٢٥</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">الوقت:</span>
          <span>٦:٠٠ مساءً</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">المكان:</span>
          <span>فندق نادي الضباط، قاعة إرث</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default EventDetails;
