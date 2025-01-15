import { formatDistanceToNow } from "date-fns";

interface CommentProps {
  username: string;
  content: string;
  createdAt: string;
}

export function Comment({ username, content, createdAt }: CommentProps) {
  return (
    <div className="border-b border-border/50 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{username}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  );
}
