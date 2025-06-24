const EventDetails = () => {
  return (
    <div className="text-center space-y-3 py-4" dir="rtl" style={{ paddingTop: '-9px' }}>
      <h3 className="text-white/80 text-base font-light tracking-wide">تفاصيل المناسبة</h3>
      
      <div className="space-y-3 text-white">
        <div className="space-y-0.5">
          <div className="text-white/70 text-xs font-light">التاريخ</div>
          <div className="text-sm font-light">الجمعة، ٤ يوليو ٢٠٢٥</div>
        </div>
        
        <div className="space-y-0.5">
          <div className="text-white/70 text-xs font-light">الوقت</div>
          <div className="text-sm font-light">الساعة ٦:٠٠ مساءً</div>
        </div>
        
        <div className="space-y-0.5">
          <div className="text-white/70 text-xs font-light">المكان</div>
          <div className="text-sm font-light">فندق نادي الضباط - قاعة إرث</div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
