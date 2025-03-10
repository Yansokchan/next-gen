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

      // Get current date in user's timezone
      const now = new Date();

      // Today
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // This Week (Monday to current day)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      ); // Start from Monday
      startOfWeek.setHours(0, 0, 0, 0);

      // This Month (1st to current day)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const timeFrames: TimeFrameData = {
        today: {
          revenue: 0,
          orderCount: 0,
          dateRange: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        },
        thisWeek: {
          revenue: 0,
          orderCount: 0,
          dateRange: `${startOfWeek.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
        },
        thisMonth: {
          revenue: 0,
          orderCount: 0,
          dateRange: `${startOfMonth.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
        },
        older: {
          revenue: 0,
          orderCount: 0,
          dateRange: `Before ${startOfMonth.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
        },
      };

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const total = order.total;

        if (orderDate >= startOfDay && orderDate <= endOfDay) {
          // Today
          timeFrames.today.revenue += total;
          timeFrames.today.orderCount++;
          timeFrames.thisWeek.revenue += total;
          timeFrames.thisWeek.orderCount++;
          timeFrames.thisMonth.revenue += total;
          timeFrames.thisMonth.orderCount++;
        } else if (orderDate >= startOfWeek && orderDate < startOfDay) {
          // This Week (up to yesterday)
          timeFrames.thisWeek.revenue += total;
          timeFrames.thisWeek.orderCount++;
          timeFrames.thisMonth.revenue += total;
          timeFrames.thisMonth.orderCount++;
        } else if (orderDate >= startOfMonth && orderDate < startOfWeek) {
          // This Month (up to last week)
          timeFrames.thisMonth.revenue += total;
          timeFrames.thisMonth.orderCount++;
        } else if (orderDate < startOfMonth) {
          // Older
          timeFrames.older.revenue += total;
          timeFrames.older.orderCount++;
        }
      });

      return timeFrames;
    },
  });
}
