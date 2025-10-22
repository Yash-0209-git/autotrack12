import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

interface Feedback {
  feedback_id: string;
  service_id: string;
  rating: number;
  comments: string | null;
  created_at: string;
  services: {
    description: string;
    service_date: string;
    vehicles: {
      reg_no: string;
      model: string;
      customers: {
        name: string;
      };
    };
  };
}

interface Service {
  service_id: string;
  description: string;
  vehicles: {
    reg_no: string;
  };
}

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    service_id: "",
    rating: 5,
    comments: "",
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchServices();
  }, []);

  useEffect(() => {
    const filtered = feedbacks.filter(
      (feedback) =>
        feedback.services.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.services.vehicles.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.services.vehicles.customers.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeedbacks(filtered);
  }, [searchTerm, feedbacks]);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("service_feedback")
      .select(
        `
        *,
        services!inner (
          description,
          service_date,
          vehicles!inner (
            reg_no,
            model,
            customers!inner (
              name
            )
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load feedback");
    } else {
      setFeedbacks(data || []);
      setFilteredFeedbacks(data || []);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        service_id,
        description,
        vehicles (
          reg_no
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("service_feedback").insert([formData]);

      if (error) throw error;
      toast.success("Feedback submitted successfully");

      setIsDialogOpen(false);
      resetForm();
      fetchFeedbacks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      service_id: "",
      rating: 5,
      comments: "",
    });
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-warning text-warning"
                : "fill-muted text-muted"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() =>
              interactive && setFormData({ ...formData, rating: star })
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Feedback</h1>
          <p className="text-muted-foreground">Collect and view customer feedback</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredFeedbacks.map((feedback, index) => (
          <motion.div
            key={feedback.feedback_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{feedback.services.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feedback.services.vehicles.reg_no} -{" "}
                      {feedback.services.vehicles.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {feedback.services.vehicles.customers.name}
                    </p>
                  </div>
                  {renderStars(feedback.rating)}
                </div>
              </CardHeader>
              <CardContent>
                {feedback.comments && (
                  <p className="text-sm mb-3 text-muted-foreground">{feedback.comments}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Submitted on {format(new Date(feedback.created_at), "MMM dd, yyyy")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No feedback found</p>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription>Submit feedback for a service</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service">Service *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.service_id} value={service.service_id}>
                        {service.vehicles.reg_no} - {service.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rating *</Label>
                <div className="mt-2">{renderStars(formData.rating, true)}</div>
              </div>
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  placeholder="Share your experience..."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">Submit Feedback</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;
