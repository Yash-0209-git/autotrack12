import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Service {
  service_id: string;
  vehicle_id: string;
  service_date: string;
  description: string;
  parts_replaced: string | null;
  cost: number;
  status: string;
  vehicles: {
    reg_no: string;
    model: string;
    brand: string;
    customer_id: string;
    customers: {
      name: string;
      contact: string;
      email: string | null;
      address: string | null;
    };
  };
}

const Billing = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        vehicles!inner (
          reg_no,
          model,
          brand,
          customer_id,
          customers!inner (
            name,
            contact,
            email,
            address
          )
        )
      `
      )
      .order("service_date", { ascending: false });

    if (error) {
      toast.error("Failed to load services");
    } else {
      setServices(data || []);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info("PDF download feature coming soon!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground">Generate and manage invoices</p>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Select Service</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedService?.service_id || ""}
            onValueChange={(value) => {
              const service = services.find((s) => s.service_id === value);
              setSelectedService(service || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service to generate invoice" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.service_id} value={service.service_id}>
                  {format(new Date(service.service_date), "MMM dd, yyyy")} -{" "}
                  {service.vehicles.reg_no} - ${Number(service.cost).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedService && (
        <>
          <div className="flex gap-3 print:hidden">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={invoiceRef}
          >
            <Card className="p-8 max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center border-b pb-6">
                  <h1 className="text-4xl font-bold mb-2">SERVICE INVOICE</h1>
                  <p className="text-muted-foreground">
                    Invoice #{selectedService.service_id.slice(0, 8)}
                  </p>
                </div>

                {/* Business & Customer Info */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">From:</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">Your Garage Name</p>
                      <p>123 Service Street</p>
                      <p>City, State 12345</p>
                      <p>Phone: (555) 123-4567</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Bill To:</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">
                        {selectedService.vehicles.customers.name}
                      </p>
                      {selectedService.vehicles.customers.address && (
                        <p>{selectedService.vehicles.customers.address}</p>
                      )}
                      <p>Phone: {selectedService.vehicles.customers.contact}</p>
                      {selectedService.vehicles.customers.email && (
                        <p>Email: {selectedService.vehicles.customers.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-semibold">
                      {format(new Date(selectedService.service_date), "MMMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-semibold">
                      {selectedService.vehicles.reg_no} ({selectedService.vehicles.brand}{" "}
                      {selectedService.vehicles.model})
                    </p>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Service Details</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4">Description</th>
                          <th className="text-right p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-4">
                            <p className="font-medium">{selectedService.description}</p>
                            {selectedService.parts_replaced && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Parts: {selectedService.parts_replaced}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-right font-semibold">
                            ${Number(selectedService.cost).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="border-t bg-muted/50">
                        <tr>
                          <td className="p-4 text-right font-semibold">Total Amount</td>
                          <td className="p-4 text-right font-bold text-xl">
                            ${Number(selectedService.cost).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground pt-6 border-t">
                  <p>Thank you for your business!</p>
                  <p className="mt-2">
                    This is a computer-generated invoice and does not require a signature.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {!selectedService && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Select a service from the dropdown above to generate an invoice
          </p>
        </Card>
      )}
    </div>
  );
};

export default Billing;
