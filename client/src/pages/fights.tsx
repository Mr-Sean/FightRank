import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/StarRating";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Fights() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: fights } = useQuery({
    queryKey: ["/api/fights"],
  });

  const handleRate = async (fightId: number, rating: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to rate fights",
        variant: "destructive",
      });
      return;
    }

    // Implementation for rating submission would go here
    toast({
      title: "Success",
      description: "Rating submitted successfully!",
    });
  };

  const filteredFights = fights?.filter((fight: any) => 
    fight.title.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">MMA Fights</h1>
          <Input
            placeholder="Search fights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFights.map((fight: any) => (
            <Card key={fight.id} className="bg-card/50 backdrop-blur">
              <CardHeader>
                <h3 className="text-xl font-bold">{fight.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {fight.promotion} • {fight.date}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Community Rating</p>
                    <StarRating rating={fight.averageRating} readOnly />
                  </div>
                  {user && (
                    <div>
                      <p className="text-sm font-medium mb-1">Your Rating</p>
                      <StarRating
                        rating={fight.userRating}
                        onChange={(rating) => handleRate(fight.id, rating)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
