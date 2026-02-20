'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/app-store';
import { Palette, Sun, Moon, Monitor, Type, Zap, Contrast, Eye } from 'lucide-react';
import type { Theme } from '@/types';

export function DisplayPreferencesTab() {
  const { settings, updateSettings } = useAppStore();

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    switch (settings.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'medium':
        root.classList.add('text-base');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
    }
  }, [settings.fontSize]);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.reduceAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.colorBlindMode) {
      root.classList.add('color-blind-mode');
    } else {
      root.classList.remove('color-blind-mode');
    }
  }, [settings.reduceAnimations, settings.highContrast, settings.colorBlindMode]);

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize });
  };

  const handleReduceAnimationsChange = (checked: boolean) => {
    updateSettings({ reduceAnimations: checked });
  };

  const handleHighContrastChange = (checked: boolean) => {
    updateSettings({ highContrast: checked });
  };

  const handleColorBlindModeChange = (checked: boolean) => {
    updateSettings({ colorBlindMode: checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Display Preferences
        </CardTitle>
        <CardDescription>
          Customize the appearance and accessibility of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Size Selector */}
        <div className="space-y-3">
          <Label className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Size
          </Label>
          <RadioGroup
            value={settings.fontSize}
            onValueChange={(value) => handleFontSizeChange(value as 'small' | 'medium' | 'large')}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="small"
                id="font-small"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-small"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-sm font-medium">Small</span>
                <span className="text-xs text-muted-foreground mt-1">Aa</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="medium"
                id="font-medium"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-medium"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-sm font-medium">Medium</span>
                <span className="text-base text-muted-foreground mt-1">Aa</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="large"
                id="font-large"
                className="peer sr-only"
              />
              <Label
                htmlFor="font-large"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-sm font-medium">Large</span>
                <span className="text-lg text-muted-foreground mt-1">Aa</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Accessibility Options */}
        <div className="space-y-4 pt-2">
          <Label className="text-base">Accessibility</Label>
          
          {/* Reduce Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-animations" className="flex items-center gap-2 cursor-pointer">
                <Zap className="h-4 w-4" />
                Reduce Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimize motion and transitions
              </p>
            </div>
            <Switch
              id="reduce-animations"
              checked={settings.reduceAnimations}
              onCheckedChange={handleReduceAnimationsChange}
            />
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="flex items-center gap-2 cursor-pointer">
                <Contrast className="h-4 w-4" />
                High Contrast Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={handleHighContrastChange}
            />
          </div>

          {/* Color Blind Friendly Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="color-blind-mode" className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                Color Blind Friendly Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use patterns and shapes in addition to colors
              </p>
            </div>
            <Switch
              id="color-blind-mode"
              checked={settings.colorBlindMode}
              onCheckedChange={handleColorBlindModeChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
