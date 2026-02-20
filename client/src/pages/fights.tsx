import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Comment } from "@/components/Comment";
import { useUser } from "@/hooks/use-user";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Fights() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedFight, setSelectedFight] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [fightToDelete, setFightToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setNewComment("");
  }, [selectedFight]);

  const { data: events, isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ["/api/events"],
  });

  const { data: fights, isLoading: fightsLoading } = useQuery({
    queryKey: ["/api/events", selectedEvent, "fights"],
    queryFn: async () => {
      if (!selectedEvent) return [];
      const response = await fetch(`/api/events/${selectedEvent}/fights`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch fights");
      return response.json();
    },
    enabled: !!selectedEvent,
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/fights", selectedFight, "comments"],
    queryFn: async () => {
      if (!selectedFight) return [];
      const response = await fetch(`/api/fights/${selectedFight}/comments`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!selectedFight,
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { fightId: number; content: string }) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to post comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fights", selectedFight, "comments"] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fightId, rating }),
      });

      if (!response.ok) throw new Error("Failed to submit rating");

      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEvent, "fights"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleComment = async (fightId: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate({ fightId, content: newComment });
  };

  const deleteMutation = useMutation({
    mutationFn: async (fightId: number) => {
      const response = await fetch(`/api/fights/${fightId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete fight");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEvent, "fights"] });
      toast({
        title: "Success",
        description: "Fight deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (fightId: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to delete fights",
        variant: "destructive",
      });
      return;
    }
    setFightToDelete(fightId);
  };

  const confirmDelete = async () => {
    if (fightToDelete) {
      await deleteMutation.mutateAsync(fightToDelete);
      setFightToDelete(null);
    }
  };

  const filteredEvents = events?.filter((event: any) =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.promotion.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const currentEvent = events?.find((e: any) => e.id === selectedEvent);

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1552072092-7f9b8d63efcb'), url('/cage-pattern.svg')`
      }}
    >
      <div className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost" className="text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              {user && (
                <Link href="/admin">
                  <Button variant="outline">
                    Manage Events & Fights
                  </Button>
                </Link>
              )}
            </div>
            <h1 className="text-3xl font-bold text-center text-yellow-500">
              {selectedEvent && currentEvent
                ? currentEvent.title
                : "MMA Events"}
            </h1>
            {selectedEvent && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedFight(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </div>
            )}
            {!selectedEvent && (
              <div className="flex justify-center">
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-md"
                />
              </div>
            )}
          </div>

          {!selectedEvent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsLoading && (
                <p className="text-center text-muted-foreground col-span-full">Loading events...</p>
              )}
              {filteredEvents.map((event: any) => (
                <Card
                  key={event.id}
                  className="bg-card/30 backdrop-blur transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-primary"
                  onClick={() => setSelectedEvent(event.id)}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        {event.promotion}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Click to view fights
                    </p>
                  </CardContent>
                </Card>
              ))}
              {!eventsLoading && filteredEvents.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full">
                  No events found. {user ? "Create one in the admin panel!" : "Check back later!"}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fightsLoading && (
                <p className="text-center text-muted-foreground col-span-full">Loading fights...</p>
              )}
              {fights?.map((fight: any) => (
                <Card
                  key={fight.id}
                  className={`bg-card/30 backdrop-blur transition-all duration-200 ${
                    selectedFight === fight.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedFight(fight.id)}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">
                        {fight.fighter1} vs {fight.fighter2}
                      </h3>
                      {user && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(fight.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
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
                      {selectedFight === fight.id && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Comments</h4>
                          <ScrollArea className="h-[200px] rounded-md border p-4">
                            <div className="space-y-4">
                              {comments?.map((comment: any) => (
                                <Comment
                                  key={comment.id}
                                  username={comment.username}
                                  content={comment.content}
                                  createdAt={comment.createdAt}
                                />
                              ))}
                              {(!comments || comments.length === 0) && (
                                <p className="text-sm text-muted-foreground">No comments yet</p>
                              )}
                            </div>
                          </ScrollArea>
                          {user && (
                            <div className="mt-4 space-y-2">
                              <Textarea
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <Button
                                onClick={() => handleComment(fight.id)}
                                className="w-full"
                                disabled={commentMutation.isPending}
                              >
                                Post Comment
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!fightsLoading && (!fights || fights.length === 0) && (
                <p className="text-center text-muted-foreground col-span-full">
                  No fights for this event yet. {user ? "Add some in the admin panel!" : "Check back later!"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!fightToDelete} onOpenChange={(open) => { if (!open) setFightToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this fight?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fight and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFightToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}