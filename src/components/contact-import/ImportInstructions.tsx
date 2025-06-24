
const ImportInstructions = () => {
  return (
    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-400/30">
      <h4 className="text-amber-400 font-semibold mb-2" dir="rtl">تعليمات:</h4>
      <ul className="text-amber-300 text-sm space-y-1" dir="rtl">
        <li>• تأكد من أن أرقام الهواتف تتضمن رمز البلد (مثل: 966)</li>
        <li>• استخدم الفاصلة للفصل بين الاسم ورقم الهاتف</li>
        <li>• كل جهة اتصال في سطر منفصل</li>
        <li>• تأكد من صحة البيانات قبل الاستيراد</li>
        <li>• للاستيراد من الهاتف، استخدم هاتف محمول بمتصفح متوافق</li>
      </ul>
    </div>
  );
};

export default ImportInstructions;
