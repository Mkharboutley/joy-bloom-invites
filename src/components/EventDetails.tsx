
const EventDetails = () => {
  return (
    <div className="text-center space-y-4 py-6" dir="rtl">
      <h3 className="text-white/80 text-xl font-light tracking-wide">تفاصيل المناسبة</h3>
      
      <div className="space-y-4 text-white">
        <div className="space-y-1">
          <div className="text-white/70 text-sm font-light">التاريخ</div>
          <div className="text-lg font-light">الجمعة، ٤ يوليو ٢٠٢٥</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-white/70 text-sm font-light">الوقت</div>
          <div className="text-lg font-light">الساعة ٦:٠٠ مساءً</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-white/70 text-sm font-light">المكان</div>
          <div className="text-lg font-light">فندق نادي الضباط - قاعة إرث</div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
