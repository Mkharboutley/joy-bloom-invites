
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Users } from 'lucide-react';

interface ManualImportProps {
  csvData: string;
  onCsvDataChange: (value: string) => void;
  onImport: () => void;
  loading: boolean;
}

const ManualImport = ({ csvData, onCsvDataChange, onImport, loading }: ManualImportProps) => {
  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-white font-semibold" dir="rtl">إدخال يدوي</h3>
      <p className="text-white/70 text-sm" dir="rtl">
        أدخل جهات الاتصال بالتنسيق: الاسم، رقم الهاتف (كل جهة اتصال في سطر منفصل)
      </p>
      <Textarea
        placeholder="أحمد، 966501234567
فاطمة، 966507654321
محمد، 966509876543"
        value={csvData}
        onChange={(e) => onCsvDataChange(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32"
        dir="rtl"
      />
      <Button
        onClick={onImport}
        disabled={loading}
        className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
      >
        <Users className="w-4 h-4 ml-2" />
        {loading ? 'جاري الاستيراد...' : 'استيراد جهات الاتصال'}
      </Button>
    </div>
  );
};

export default ManualImport;
