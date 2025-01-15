import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const handleJoin = () => {
    setLocation(user ? "/fights" : "/auth");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1552072092-7f9b8d63efcb')`
      }}
    >
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">MMA Ratings</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Rate and discuss your favorite MMA fights with fellow fans.
        </p>
        <Button onClick={handleJoin} size="lg">
          Join Now
        </Button>
      </div>
    </div>
  );
}