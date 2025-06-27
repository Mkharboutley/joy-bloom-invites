const EventDetails = () => {
  return (
    <div className="text-center space-y-2 py-4" dir="rtl" style={{ paddingTop: '-9px' }}>
      <h3 className="text-white/80 text-base font-light tracking-wide mb-3">تفاصيل المناسبة</h3>
      
      <div className="flex justify-between items-center text-white space-x-4 rtl:space-x-reverse">
        <div className="flex-1 space-y-0.5">
          <div className="text-white/70 text-xs font-light">التاريخ</div>
          <div className="text-sm font-light">الجمعة، ٤ يوليو ٢٠٢٥</div>
        </div>
        
        <div className="flex-1 space-y-0.5">
          <div className="text-white/70 text-xs font-light">الوقت</div>
          <div className="text-sm font-light">الساعة ٨:٣٠ مساءً</div>
        </div>
        
        <div className="flex-1 space-y-0.5">
          <div className="text-white/70 text-xs font-light">المكان</div>
          <div className="text-sm font-light">فندق إرث</div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;