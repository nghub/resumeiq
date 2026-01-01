import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Layout, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [landingPageVersion, setLandingPageVersion] = useState<"v1" | "v2">("v1");
  const [saving, setSaving] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
      setCheckingAdmin(false);
    }

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  // Fetch current landing page setting
  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "landing_page_version")
        .maybeSingle();

      if (!error && data) {
        setLandingPageVersion(data.setting_value as "v1" | "v2");
      }
    }

    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  // Save landing page setting
  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from("app_settings")
      .update({ setting_value: landingPageVersion })
      .eq("setting_key", "landing_page_version");

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings saved",
        description: `Landing page switched to ${landingPageVersion === "v1" ? "Classic" : "Modern"} version.`,
      });
    }
  };

  // Loading state
  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You must be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              You don't have permission to access admin settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">Manage application configuration</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Landing Page
              </CardTitle>
              <CardDescription>
                Choose which landing page design to show to visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="space-y-1">
                  <Label htmlFor="landing-toggle" className="text-base font-medium">
                    Modern Landing Page (V2)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable the new dark theme landing page with enhanced visuals
                  </p>
                </div>
                <Switch
                  id="landing-toggle"
                  checked={landingPageVersion === "v2"}
                  onCheckedChange={(checked) => 
                    setLandingPageVersion(checked ? "v2" : "v1")
                  }
                />
              </div>

              <div className="flex gap-4">
                <div 
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    landingPageVersion === "v1" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setLandingPageVersion("v1")}
                >
                  <div className="font-medium mb-1">Classic (V1)</div>
                  <p className="text-sm text-muted-foreground">
                    Original landing page design with gradient hero
                  </p>
                </div>
                <div 
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    landingPageVersion === "v2" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setLandingPageVersion("v2")}
                >
                  <div className="font-medium mb-1">Modern (V2)</div>
                  <p className="text-sm text-muted-foreground">
                    New design with stats, features grid, and score preview
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}