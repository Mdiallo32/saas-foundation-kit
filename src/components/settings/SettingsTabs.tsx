import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileText } from "lucide-react";
import FirmInfoForm from "@/components/settings/FirmInfoForm";
import InvoiceTemplateForm from "@/components/settings/InvoiceTemplateForm";

const SettingsTabs = () => (
  <Tabs defaultValue="firm" className="space-y-6">
    <TabsList>
      <TabsTrigger value="firm" className="gap-1.5">
        <Building2 className="h-4 w-4" /> Firm Info
      </TabsTrigger>
      <TabsTrigger value="invoice" className="gap-1.5">
        <FileText className="h-4 w-4" /> Invoice Template
      </TabsTrigger>
    </TabsList>
    <TabsContent value="firm">
      <FirmInfoForm />
    </TabsContent>
    <TabsContent value="invoice">
      <InvoiceTemplateForm />
    </TabsContent>
  </Tabs>
);

export default SettingsTabs;
