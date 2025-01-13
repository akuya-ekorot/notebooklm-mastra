import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Code, FileText, LucideProps, Upload } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface FeatureProps {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  text: string;
  link?: { href: string; text: string };
  textAfter?: string;
}

export const FEATURES = [
  {
    icon: Upload,
    text: "Upload your documents and surface key insights",
  },
  {
    icon: FileText,
    text: "Convert complex material into an easy-to-understand podcast",
  },
  {
    icon: Code,
    text: "Built using ",
    link: { text: "Mastra.ai", href: "https://mastra.ai" },
    textAfter: ", the open-source Typescript AI Framework",
  },
];

export const Feature: React.FC<FeatureProps> = ({
  icon: Icon,
  text,
  link,
  textAfter,
}) => (
  <Card className="h-48">
    <CardHeader className="items-center p-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="text-sm text-muted-foreground">
        {text}
        {link && (
          <a href={link.href} className="text-blue-600 hover:underline">
            {link.text}
          </a>
        )}
        {textAfter}
      </p>
    </CardContent>
  </Card>
);
