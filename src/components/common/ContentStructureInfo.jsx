import { CircleHelp } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ContentStructureInfo = () => {
  return (
    <Card className="p-4 mb-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-muted/30">
      <div className="flex items-start gap-4">
        <CircleHelp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heading">How Content Works</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Chapters</strong> show the combined questions from both topics and sub-topics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Topics</strong> have their own questions plus questions from sub-topics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Sub-topics</strong> have their own questions</span>
              </li>
            </ul>
          </div>
          <Card className="p-3 bg-background border border-border/60">
            <p className="text-xs font-medium text-heading mb-2">Quick Reference:</p>
            <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <span className="text-primary">Chapters</span>
                <span>=</span>
                <span>Questions from (Topics + Sub-Topics)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">Topics</span>
                <span>=</span>
                <span>Own Questions + Sub-Topic Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">Sub-Topics</span>
                <span>=</span>
                <span>Own Questions Only</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default ContentStructureInfo;
