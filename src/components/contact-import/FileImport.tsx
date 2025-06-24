
import { Input } from '@/components/ui/input';

interface FileImportProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileImport = ({ onFileUpload }: FileImportProps) => {
  return (
    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-white font-semibold" dir="rtl">تحميل ملف CSV</h3>
      <p className="text-white/70 text-sm" dir="rtl">
        حمل ملف CSV بالتنسيق: الاسم، رقم الهاتف
      </p>
      <Input
        type="file"
        accept=".csv,.txt"
        onChange={onFileUpload}
        className="bg-white/10 border-white/20 text-white"
      />
    </div>
  );
};

export default FileImport;
