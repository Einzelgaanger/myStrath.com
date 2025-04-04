import { BadgeRank } from "@/components/ui/badge-rank";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const allRanks = [
  "Starlet Scholar",
  "Knowledge Keeper",
  "Insight Voyager",
  "Wisdom Weaver",
  "Truth Hunter",
  "Galactic Sage",
  "Cosmic Intellect",
  "Eternal Guardian",
  "Phoenix Prodigy",
  "Celestial Champion"
];

export function BadgeAnimationShowcase() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-gradient-blue">Badge Rank Animations Showcase</CardTitle>
        <CardDescription>
          Explore the different badge animations for each rank level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="default" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="none">No Animation</TabsTrigger>
            <TabsTrigger value="default">Default Animation</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Animation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="none" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allRanks.map((rank) => (
                <div key={rank} className="flex flex-col items-center justify-center bg-card/50 p-4 rounded-lg border">
                  <BadgeRank 
                    rank={rank} 
                    className="mb-2 text-xs"
                    animated={false}
                  />
                  <BadgeRank 
                    rank={rank} 
                    showBadgeIcon 
                    className="mb-2 text-xs"
                    animated={false}
                  />
                  <span className="text-xs text-muted-foreground mt-2">{rank}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="default" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allRanks.map((rank) => (
                <div key={rank} className="flex flex-col items-center justify-center bg-card/50 p-4 rounded-lg border">
                  <BadgeRank 
                    rank={rank} 
                    className="mb-2 text-xs"
                    animated={true}
                    animationType="default"
                  />
                  <BadgeRank 
                    rank={rank} 
                    showBadgeIcon 
                    className="mb-2 text-xs"
                    animated={true}
                    animationType="default"
                  />
                  <span className="text-xs text-muted-foreground mt-2">{rank}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allRanks.map((rank) => (
                <div key={rank} className="flex flex-col items-center justify-center bg-card/50 p-4 rounded-lg border">
                  <BadgeRank 
                    rank={rank} 
                    className="mb-2 text-xs"
                    animated={true}
                    animationType="advanced"
                  />
                  <BadgeRank 
                    rank={rank} 
                    showBadgeIcon 
                    className="mb-2 text-xs"
                    animated={true}
                    animationType="advanced"
                  />
                  <span className="text-xs text-muted-foreground mt-2">{rank}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}