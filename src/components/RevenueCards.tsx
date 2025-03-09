import { CalendarDays, Clock, CalendarRange, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useRevenueData } from "@/hooks/useRevenueData";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";

interface CardData {
  title: string;
  icon: React.ReactNode;
  revenue: number;
  orderCount: number;
  dateRange: string;
  bgClass: string;
  iconClass: string;
}

// Custom hook for counting animation
const useCountAnimation = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
};

// Card component to handle individual card rendering and animations
function RevenueCard({ card }: { card: CardData }) {
  const animatedRevenue = useCountAnimation(card.revenue);
  const animatedOrders = useCountAnimation(card.orderCount);

  return (
    <Card
      className={`transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${card.bgClass}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{card.dateRange}</p>
        </div>
        <div className={`p-2 rounded-full ${card.bgClass} ${card.iconClass}`}>
          {card.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${animatedRevenue.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-muted-foreground">
            {animatedOrders.toLocaleString()} orders
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueCards() {
  const { data: revenueData, isLoading } = useRevenueData();

  const cards: CardData[] = revenueData
    ? [
        {
          title: "Today",
          icon: <Clock className="h-5 w-5" />,
          revenue: revenueData.today.revenue,
          orderCount: revenueData.today.orderCount,
          dateRange: revenueData.today.dateRange || "",
          bgClass: "bg-blue-50 hover:bg-blue-100 border-blue-200",
          iconClass: "text-blue-500",
        },
        {
          title: "This Week",
          icon: <CalendarDays className="h-5 w-5" />,
          revenue: revenueData.thisWeek.revenue,
          orderCount: revenueData.thisWeek.orderCount,
          dateRange: revenueData.thisWeek.dateRange || "",
          bgClass: "bg-green-50 hover:bg-green-100 border-green-200",
          iconClass: "text-green-500",
        },
        {
          title: "This Month",
          icon: <CalendarRange className="h-5 w-5" />,
          revenue: revenueData.thisMonth.revenue,
          orderCount: revenueData.thisMonth.orderCount,
          dateRange: revenueData.thisMonth.dateRange || "",
          bgClass: "bg-purple-50 hover:bg-purple-100 border-purple-200",
          iconClass: "text-purple-500",
        },
        {
          title: "Older",
          icon: <History className="h-5 w-5" />,
          revenue: revenueData.older.revenue,
          orderCount: revenueData.older.orderCount,
          dateRange: revenueData.older.dateRange || "",
          bgClass: "bg-orange-50 hover:bg-orange-100 border-orange-200",
          iconClass: "text-orange-500",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <RevenueCard key={index} card={card} />
      ))}
    </div>
  );
}
