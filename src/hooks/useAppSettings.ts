import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppSettings {
  landingPageVersion: "v1" | "v2";
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    landingPageVersion: "v1",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["landing_page_version"]);

      if (!error && data) {
        const landingPageSetting = data.find(
          (s) => s.setting_key === "landing_page_version"
        );
        
        setSettings({
          landingPageVersion: (landingPageSetting?.setting_value as "v1" | "v2") || "v1",
        });
      }
      
      setLoading(false);
    }

    fetchSettings();
  }, []);

  return { settings, loading };
}

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
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
      
      setLoading(false);
    }

    checkAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
}