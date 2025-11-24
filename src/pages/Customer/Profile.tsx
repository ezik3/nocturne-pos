import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    age: "",
    relationship_status: "",
    location: "",
    avatar_url: "",
    selected_background: "dark",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
      } else if (data) {
        setProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          age: data.age?.toString() || "",
          relationship_status: data.relationship_status || "",
          location: data.location || "",
          avatar_url: data.avatar_url || "",
          selected_background: data.selected_background || "dark",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("customer_profiles")
      .upsert({
        user_id: user.id,
        display_name: profile.display_name,
        bio: profile.bio,
        age: profile.age ? parseInt(profile.age) : null,
        relationship_status: profile.relationship_status,
        location: profile.location,
        avatar_url: profile.avatar_url,
        selected_background: profile.selected_background,
      });

    if (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } else {
      toast.success("Profile saved successfully!");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const backgrounds = [
    { value: "dark", label: "Dark", class: "bg-gray-900" },
    { value: "purple", label: "Purple Gradient", class: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" },
    { value: "white", label: "Light Geometric", class: "bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100" },
    { value: "geometric", label: "Blue Geometric", class: "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Your Profile</CardTitle>
                <CardDescription>Customize your Joint Vibe experience</CardDescription>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile Info</TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.display_name?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      placeholder="25"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="Brisbane, Australia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship_status">Relationship Status</Label>
                    <Input
                      id="relationship_status"
                      value={profile.relationship_status}
                      onChange={(e) =>
                        setProfile({ ...profile, relationship_status: e.target.value })
                      }
                      placeholder="Single, Taken, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Your Feed Background</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select a background that matches your vibe
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {backgrounds.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => setProfile({ ...profile, selected_background: bg.value })}
                        className={cn(
                          "relative h-32 rounded-lg border-4 transition-all",
                          bg.class,
                          profile.selected_background === bg.value
                            ? "border-primary scale-105"
                            : "border-transparent hover:border-border"
                        )}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                          <span className="text-white font-medium">{bg.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Appearance"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
