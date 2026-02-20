import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ArrowLeft, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Admin() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [event, setEvent] = useState({
    title: "",
    promotion: "UFC",
    date: "",
  });

  const [fight, setFight] = useState({
    eventId: "",
    fighter1: "",
    fighter2: "",
  });

  const { data: events } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error("Failed to create event");

      toast({ title: "Success", description: "Event created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEvent({ title: "", promotion: "UFC", date: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateFight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/fights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: parseInt(fight.eventId),
          fighter1: fight.fighter1,
          fighter2: fight.fighter2,
        }),
      });

      if (!response.ok) throw new Error("Failed to create fight");

      toast({ title: "Success", description: "Fight created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/events", parseInt(fight.eventId), "fights"] });
      setFight({ eventId: fight.eventId, fighter1: "", fighter2: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/fights">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="ml-auto">
          <Button variant="outline" onClick={async () => { await logout(); setLocation("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Create Event</h2>
            <p className="text-sm text-muted-foreground">Add a new MMA event (e.g. UFC 300)</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <Input
                placeholder="Event Title (e.g. UFC 300)"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                required
              />
              <Select
                value={event.promotion}
                onValueChange={(value) => setEvent({ ...event, promotion: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select promotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UFC">UFC</SelectItem>
                  <SelectItem value="PFL">PFL</SelectItem>
                  <SelectItem value="Rizin">Rizin</SelectItem>
                  <SelectItem value="One FC">One FC</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                required
              />
              <Button type="submit" className="w-full">Create Event</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Add Fight to Event</h2>
            <p className="text-sm text-muted-foreground">Add a fight matchup to an existing event</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFight} className="space-y-4">
              <Select
                value={fight.eventId}
                onValueChange={(value) => setFight({ ...fight, eventId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((evt: any) => (
                    <SelectItem key={evt.id} value={String(evt.id)}>
                      {evt.title} ({evt.promotion})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Fighter 1"
                value={fight.fighter1}
                onChange={(e) => setFight({ ...fight, fighter1: e.target.value })}
                required
              />
              <Input
                placeholder="Fighter 2"
                value={fight.fighter2}
                onChange={(e) => setFight({ ...fight, fighter2: e.target.value })}
                required
              />
              <Button type="submit" className="w-full" disabled={!fight.eventId}>
                Add Fight
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}