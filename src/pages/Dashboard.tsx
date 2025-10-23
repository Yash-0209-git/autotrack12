import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Car, Wrench, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalCustomers: number;
  totalVehicles: number;
  totalServices: number;
  totalRevenue: number;
}

interface RecentService {
  service_id: string;
  description: string;
  cost: number;
  status: string;
  service_date: string;
  vehicles: {
    reg_no: string;
    model: string;
    customers: {
      name: string;
    };
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalVehicles: 0,
    totalServices: 0,
    totalRevenue: 0,
  });
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch customers count
      const { count: customersCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Fetch vehicles count
      const { count: vehiclesCount } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });

      // Fetch services count and revenue
      const { data: servicesData, count: servicesCount } = await supabase
        .from("services")
        .select("cost", { count: "exact" });

      const totalRevenue = servicesData?.reduce((sum, service) => sum + Number(service.cost), 0) || 0;

      // Fetch recent services
      const { data: recentServicesData } = await supabase
        .from("services")
        .select(
          `
          service_id,
          description,
          cost,
          status,
          service_date,
          vehicles!inner (
            reg_no,
            model,
            customers!inner (
              name
            )
          )
        `
        )
        .order("service_date", { ascending: false })
        .limit(5);

      setStats({
        totalCustomers: customersCount || 0,
        totalVehicles: vehiclesCount || 0,
        totalServices: servicesCount || 0,
        totalRevenue,
      });

      setRecentServices(recentServicesData || []);
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Vehicles",
      value: stats.totalVehicles,
      icon: Car,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Services",
      value: stats.totalServices,
      icon: Wrench,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: "bg-success text-success-foreground",
      in_progress: "bg-warning text-warning-foreground",
      pending: "bg-muted text-muted-foreground",
    };
    return statusMap[status as keyof typeof statusMap] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to AutoTrack</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Services</CardTitle>
        </CardHeader>
        <CardContent>
          {recentServices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No services found</p>
          ) : (
            <div className="space-y-4">
              {recentServices.map((service, index) => (
                <motion.div
                  key={service.service_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{service.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.vehicles.reg_no} - {service.vehicles.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {service.vehicles.customers.name}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="font-semibold text-lg">${Number(service.cost).toFixed(2)}</div>
                    <Badge className={getStatusBadge(service.status)}>
                      {service.status.replace("_", " ")}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
