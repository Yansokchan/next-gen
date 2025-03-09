import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/lib/supabase";

interface RevenueData {
  revenue: number;
  orderCount: number;
  dateRange?: string;
}

interface TimeFrameData {
  today: RevenueData;
  thisWeek: RevenueData;
  thisMonth: RevenueData;
  older: RevenueData;
}

export function useRevenueData() {
  return useQuery({
    queryKey: ["revenue-data"],
    queryFn: async () => {
      const orders = await fetchOrders();

      // Set reference date to March 9, 2025
      const referenceDate = new Date(2025, 2, 9); // Month is 0-based

      // Today: March 9, 2025
      const startOfDay = new Date(2025, 2, 9);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(2025, 2, 9, 23, 59, 59, 999);

      // This Week: March 3-9, 2025 (Monday to Sunday)
      const startOfWeek = new Date(2025, 2, 3); // Starting from Monday
      startOfWeek.setHours(0, 0, 0, 0);

      // This Month: March 1-9, 2025
      const startOfMonth = new Date(2025, 2, 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const timeFrames: TimeFrameData = {
        today: {
          revenue: 0,
          orderCount: 0,
          dateRange: "March 9, 2025",
        },
        thisWeek: {
          revenue: 0,
          orderCount: 0,
          dateRange: "Mar 3 - Mar 9, 2025",
        },
        thisMonth: {
          revenue: 0,
          orderCount: 0,
          dateRange: "Mar 1 - Mar 9, 2025",
        },
        older: {
          revenue: 0,
          orderCount: 0,
          dateRange: "Before Mar 1, 2025",
        },
      };

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const total = order.total;

        if (orderDate >= startOfDay && orderDate <= endOfDay) {
          // Today (March 9, 2025)
          timeFrames.today.revenue += total;
          timeFrames.today.orderCount++;
          timeFrames.thisWeek.revenue += total;
          timeFrames.thisWeek.orderCount++;
          timeFrames.thisMonth.revenue += total;
          timeFrames.thisMonth.orderCount++;
        } else if (orderDate >= startOfWeek && orderDate < startOfDay) {
          // This Week (March 3-8, 2025)
          timeFrames.thisWeek.revenue += total;
          timeFrames.thisWeek.orderCount++;
          timeFrames.thisMonth.revenue += total;
          timeFrames.thisMonth.orderCount++;
        } else if (orderDate >= startOfMonth && orderDate < startOfWeek) {
          // This Month (March 1-2, 2025)
          timeFrames.thisMonth.revenue += total;
          timeFrames.thisMonth.orderCount++;
        } else if (orderDate < startOfMonth) {
          // Older (Before March 1, 2025)
          timeFrames.older.revenue += total;
          timeFrames.older.orderCount++;
        }
      });

      return timeFrames;
    },
  });
}
