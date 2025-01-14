import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1514898661705-b3fe699aa09e')`,
        }}
      >
        <div className="absolute inset-0 bg-[url('/cage-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Rate & Discover MMA Fights
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join the community of MMA fans rating and discussing the best fights across all promotions.
            </p>
            <div className="flex gap-4">
              <Link href="/fights">
                <Button size="lg" className="bg-blue-900 hover:bg-blue-800">
                  Browse Fights
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Top Promotions</h3>
              <p className="text-muted-foreground">
                Find and rate fights from the biggest MMA promotions worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-blue-900 mb-4" />
              <h3 className="text-xl font-bold mb-2">Community Ratings</h3>
              <p className="text-muted-foreground">
                See how other fans rated fights and share your own ratings.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <Calendar className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Upcoming Events</h3>
              <p className="text-muted-foreground">
                Stay updated with the latest MMA events and schedule.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
