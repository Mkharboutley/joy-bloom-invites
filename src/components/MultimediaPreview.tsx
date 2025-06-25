
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Video, FileText, Link, Download } from 'lucide-react';
import { type InvitationTemplate } from '@/services/supabaseService';

interface MultimediaPreviewProps {
  template: InvitationTemplate;
}

const MultimediaPreview = ({ template }: MultimediaPreviewProps) => {
  if (!template.media_url) {
    return (
      <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
        نص فقط
      </Badge>
    );
  }

  const getMediaIcon = () => {
    switch (template.media_type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const getMediaTypeName = () => {
    switch (template.media_type) {
      case 'image': return 'صورة';
      case 'video': return 'فيديو';
      case 'document': return 'مستند';
      case 'link': return 'رابط';
      default: return 'ملف';
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
            {getMediaIcon()}
            <span className="mr-1">{getMediaTypeName()}</span>
          </Badge>
        </div>
        
        {template.media_type === 'image' && (
          <div className="w-full max-w-xs">
            <img 
              src={template.media_url} 
              alt="معاينة الصورة"
              className="w-full h-32 object-cover rounded border border-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {template.media_type === 'video' && (
          <div className="w-full max-w-xs">
            <video 
              src={template.media_url}
              className="w-full h-32 object-cover rounded border border-white/20"
              controls
              preload="metadata"
            />
          </div>
        )}
        
        <div className="mt-2">
          <p className="text-white/60 text-xs truncate" dir="rtl">
            الرابط: {template.media_url}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultimediaPreview;
