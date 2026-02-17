'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceSettingsTab } from '@/components/settings/voice-settings-tab';
import { DisplayPreferencesTab } from '@/components/settings/display-preferences-tab';
import { PrivacyDataTab } from '@/components/settings/privacy-data-tab';
import { AboutTab } from '@/components/settings/about-tab';
import { Settings, Mic, Palette, Shield, Info } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your DentalGemma experience
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          <VoiceSettingsTab />
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <DisplayPreferencesTab />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <PrivacyDataTab />
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <AboutTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
