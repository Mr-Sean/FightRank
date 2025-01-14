import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function StarRating({ rating, onChange, readOnly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-6 h-6 transition-all duration-200",
            (hoverRating || rating) >= star
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-400",
            !readOnly && "cursor-pointer hover:scale-110"
          )}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          onClick={() => !readOnly && onChange?.(star)}
        />
      ))}
    </div>
  );
}
