import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Vehicle {
  vehicle_id: string;
  reg_no: string;
  model: string;
  brand: string;
  type: string;
  year: number;
  customer_id: string;
  customers?: {
    name: string;
  };
}

interface Customer {
  customer_id: string;
  name: string;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    reg_no: "",
    model: "",
    brand: "",
    type: "",
    year: new Date().getFullYear(),
    customer_id: "",
  });

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        `
        *,
        customers (
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load vehicles");
    } else {
      setVehicles(data || []);
      setFilteredVehicles(data || []);
    }
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("customer_id, name")
      .order("name");

    if (error) {
      toast.error("Failed to load customers");
    } else {
      setCustomers(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVehicle) {
        const { error } = await supabase
          .from("vehicles")
          .update(formData)
          .eq("vehicle_id", editingVehicle.vehicle_id);

        if (error) throw error;
        toast.success("Vehicle updated successfully");
      } else {
        const { error } = await supabase.from("vehicles").insert([formData]);

        if (error) throw error;
        toast.success("Vehicle added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    const { error } = await supabase.from("vehicles").delete().eq("vehicle_id", id);

    if (error) {
      toast.error("Failed to delete vehicle");
    } else {
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      reg_no: vehicle.reg_no,
      model: vehicle.model,
      brand: vehicle.brand,
      type: vehicle.type,
      year: vehicle.year,
      customer_id: vehicle.customer_id,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      reg_no: "",
      model: "",
      brand: "",
      type: "",
      year: new Date().getFullYear(),
      customer_id: "",
    });
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">Manage vehicle inventory</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.vehicle_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{vehicle.reg_no}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(vehicle.vehicle_id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Type:</span> {vehicle.type}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Year:</span> {vehicle.year}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Owner:</span>{" "}
                    {vehicle.customers?.name}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Edit" : "Add"} Vehicle</DialogTitle>
            <DialogDescription>
              {editingVehicle ? "Update" : "Enter"} vehicle information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reg_no">Registration Number *</Label>
                <Input
                  id="reg_no"
                  value={formData.reg_no}
                  onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  placeholder="e.g., Sedan, SUV, Truck"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">{editingVehicle ? "Update" : "Add"} Vehicle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vehicles;
