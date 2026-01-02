import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Layout, Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSettings() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [landingPageVersion, setLandingPageVersion] = useState<"v1" | "v2">("v1");
  const [saving, setSaving] = useState(false);
  
  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading2, setAuthLoading2] = useState(false);

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

  // Email/password sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading2(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setAuthLoading2(false);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Email/password sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading2(true);
    
    const redirectUrl = `${window.location.origin}/admin-settings`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    setAuthLoading2(false);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "You can now sign in with your credentials.",
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>
              Sign in to access the admin settings panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={authLoading2}>
                    {authLoading2 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={authLoading2}>
                    {authLoading2 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => signInWithGoogle()} 
              className="w-full gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")} 
              className="w-full"
            >
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