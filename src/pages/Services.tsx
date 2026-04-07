import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  vehicles?: {
    reg_no: string;
    model: string;
    customers: {
      name: string;
    };
  };
}

interface Vehicle {
  vehicle_id: string;
  reg_no: string;
  model: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    service_date: new Date().toISOString().split("T")[0],
    description: "",
    parts_replaced: "",
    cost: "",
    status: "pending" as "pending" | "in_progress" | "completed",
  });

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.vehicles?.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.vehicles?.customers.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        vehicles (
          reg_no,
          model,
          customers (
            name
          )
        )
      `
      )
      .order("service_date", { ascending: false });

    if (error) {
      toast.error("Failed to load services");
    } else {
      setServices(data || []);
      setFilteredServices(data || []);
    }
  };

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("vehicle_id, reg_no, model")
      .order("reg_no");

    if (error) {
      toast.error("Failed to load vehicles");
    } else {
      setVehicles(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const serviceData = {
        ...formData,
        cost: parseFloat(formData.cost),
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("service_id", editingService.service_id);

        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const { error } = await supabase.from("services").insert([serviceData]);

        if (error) throw error;
        toast.success("Service added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    const { error } = await supabase.from("services").delete().eq("service_id", id);

    if (error) {
      toast.error("Failed to delete service");
    } else {
      toast.success("Service deleted successfully");
      fetchServices();
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      vehicle_id: service.vehicle_id,
      service_date: format(new Date(service.service_date), "yyyy-MM-dd"),
      description: service.description,
      parts_replaced: service.parts_replaced || "",
      cost: service.cost.toString(),
      status: service.status as "pending" | "in_progress" | "completed",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: "",
      service_date: new Date().toISOString().split("T")[0],
      description: "",
      parts_replaced: "",
      cost: "",
      status: "pending",
    });
    setEditingService(null);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: "bg-success text-success-foreground",
      in_progress: "bg-warning text-warning-foreground",
      pending: "bg-muted text-muted-foreground",
    };
    return statusMap[status as keyof typeof statusMap] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Track and manage service records</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.service_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{service.description}</h3>
                    <Badge className={getStatusBadge(service.status)}>
                      {service.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Vehicle:</span>{" "}
                      {service.vehicles?.reg_no} - {service.vehicles?.model}
                    </p>
                    <p>
                      <span className="font-medium">Customer:</span>{" "}
                      {service.vehicles?.customers.name}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {format(new Date(service.service_date), "MMM dd, yyyy")}
                    </p>
                    {service.parts_replaced && (
                      <p>
                        <span className="font-medium">Parts:</span> {service.parts_replaced}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{Number(service.cost).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(service)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service.service_id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit" : "Add"} Service</DialogTitle>
            <DialogDescription>
              {editingService ? "Update" : "Enter"} service details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicle">Vehicle *</Label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                        {vehicle.reg_no} - {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service_date">Service Date *</Label>
                <Input
                  id="service_date"
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parts_replaced">Parts Replaced</Label>
                <Textarea
                  id="parts_replaced"
                  value={formData.parts_replaced}
                  onChange={(e) =>
                    setFormData({ ...formData, parts_replaced: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cost">Cost *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "in_progress" | "completed") =>
                    setFormData({ ...formData, status: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">{editingService ? "Update" : "Add"} Service</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
