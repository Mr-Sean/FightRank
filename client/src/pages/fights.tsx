import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Comment } from "@/components/Comment";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Fights() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedFight, setSelectedFight] = useState<number | null>(null);
  const [editingFight, setEditingFight] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = async (fight: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to edit fights",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/fights/${fight.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fight),
      });

      if (!response.ok) throw new Error("Failed to update fight");

      toast({
        title: "Success",
        description: "Fight updated successfully!",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/fights"] });
      setEditingFight(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const { data: fights } = useQuery({
    queryKey: ["/api/fights"],
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/fights", selectedFight, "comments"],
    queryFn: async () => {
      if (!selectedFight) return [];
      const response = await fetch(`/api/fights/${selectedFight}/comments`);
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

      queryClient.invalidateQueries({ queryKey: ["/api/fights"] });
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

  const filteredFights = fights?.filter((fight: any) =>
    fight.title.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1552072092-7f9b8d63efcb'), url('/cage-pattern.svg')`
      }}
    >
      <div className="relative py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-4">MMA Fights</h1>
            {user && (
              <Button onClick={() => (window.location.href = "/admin")} variant="outline">
                Add New Fight
              </Button>
            )}
            <Input
              placeholder="Search fights..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFights.map((fight: any) => (
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
                  {editingFight?.id === fight.id ? (
                    <div className="space-y-2">
                      <Select
                        value={editingFight.promotion}
                        onValueChange={(value) =>
                          setEditingFight({ ...editingFight, promotion: value })
                        }
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
                        value={editingFight.title}
                        onChange={(e) =>
                          setEditingFight({ ...editingFight, title: e.target.value })
                        }
                      />
                      <Input
                        value={editingFight.fighter1}
                        onChange={(e) =>
                          setEditingFight({ ...editingFight, fighter1: e.target.value })
                        }
                      />
                      <Input
                        value={editingFight.fighter2}
                        onChange={(e) =>
                          setEditingFight({ ...editingFight, fighter2: e.target.value })
                        }
                      />
                      <Input
                        type="date"
                        value={editingFight.date.split("T")[0]}
                        onChange={(e) =>
                          setEditingFight({ ...editingFight, date: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleEdit(editingFight)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingFight(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold">{fight.title}</h3>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingFight(fight)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {fight.fighter1} vs {fight.fighter2} •{" "}
                        {new Date(fight.date).toLocaleDateString()}
                      </p>
                    </>
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
}