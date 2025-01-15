
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fight, setFight] = useState({
    title: "",
    fighter1: "",
    fighter2: "",
    date: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/fights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fight)
      });
      
      if (!response.ok) throw new Error("Failed to create fight");
      
      toast({ title: "Success", description: "Fight created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/fights"] });
      setFight({ title: "", fighter1: "", fighter2: "", date: "" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please login to access admin panel</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Add New Fight</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Fight Title"
              value={fight.title}
              onChange={e => setFight({ ...fight, title: e.target.value })}
            />
            <Input
              placeholder="Fighter 1"
              value={fight.fighter1}
              onChange={e => setFight({ ...fight, fighter1: e.target.value })}
            />
            <Input
              placeholder="Fighter 2"
              value={fight.fighter2}
              onChange={e => setFight({ ...fight, fighter2: e.target.value })}
            />
            <Input
              type="datetime-local"
              value={fight.date}
              onChange={e => setFight({ ...fight, date: e.target.value })}
            />
            <Button type="submit">Add Fight</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
