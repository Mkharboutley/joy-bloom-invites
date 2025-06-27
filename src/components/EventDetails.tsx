const EventDetails = () => {
  return (
    <div className="text-center space-y-3 py-4" dir="rtl">
      <h3 className="text-white/80 text-base font-light tracking-wide mb-4">تفاصيل المناسبة</h3>
      
      <div className="space-y-3 text-white max-w-sm mx-auto">
        <div className="flex justify-between items-center">
          <div className="text-sm font-light">الجمعة، ٤ يوليو ٢٠٢٥</div>
          <div className="text-white/70 text-sm font-light">التاريخ</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-light">الساعة ٨:٣٠ مساءً</div>
          <div className="text-white/70 text-sm font-light">الوقت</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-light">فندق إرث</div>
          <div className="text-white/70 text-sm font-light">المكان</div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;