'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/app-store';
import { Mic, Volume2, Gauge, Languages } from 'lucide-react';
import type { VoiceMode } from '@/types';

export function VoiceSettingsTab() {
  const { settings, updateSettings } = useAppStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleVoiceModeChange = (mode: VoiceMode) => {
    updateSettings({
      voiceSettings: {
        ...settings.voiceSettings,
        mode,
      },
    });
  };

  const handleLanguageChange = (language: string) => {
    updateSettings({
      voiceSettings: {
        ...settings.voiceSettings,
        language,
      },
    });
  };

  const handleVoiceChange = (voice: string) => {
    updateSettings({
      voiceSettings: {
        ...settings.voiceSettings,
        voice,
      },
    });
  };

  const handleSpeechRateChange = (value: number[]) => {
    updateSettings({
      voiceSettings: {
        ...settings.voiceSettings,
        speechRate: value[0],
      },
    });
  };

  const handlePitchChange = (value: number[]) => {
    updateSettings({
      voiceSettings: {
        ...settings.voiceSettings,
        pitch: value[0],
      },
    });
  };

  const testVoice = () => {
    if (isTesting) return;

    setIsTesting(true);
    const utterance = new SpeechSynthesisUtterance(
      'Hello, this is a test of your voice settings.'
    );
    
    utterance.rate = settings.voiceSettings.speechRate;
    utterance.pitch = settings.voiceSettings.pitch;
    utterance.lang = settings.voiceSettings.language;

    if (settings.voiceSettings.voice) {
      const selectedVoice = voices.find(v => v.name === settings.voiceSettings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onend = () => setIsTesting(false);
    utterance.onerror = () => setIsTesting(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Settings
        </CardTitle>
        <CardDescription>
          Configure voice consultation preferences and speech synthesis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Mode Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-mode">Voice Mode</Label>
              <p className="text-sm text-muted-foreground">
                Standard uses Web Speech API, Enhanced uses Gemini Native Audio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Standard</span>
              <Switch
                id="voice-mode"
                checked={settings.voiceSettings.mode === 'enhanced'}
                onCheckedChange={(checked: boolean) =>
                  handleVoiceModeChange(checked ? 'enhanced' : 'standard')
                }
              />
              <span className="text-sm text-muted-foreground">Enhanced</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Language
          </Label>
          <Select
            value={settings.voiceSettings.language}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="es-ES">Spanish</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
              <SelectItem value="it-IT">Italian</SelectItem>
              <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
              <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
              <SelectItem value="ja-JP">Japanese</SelectItem>
              <SelectItem value="ko-KR">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label htmlFor="voice" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Voice
          </Label>
          <Select
            value={settings.voiceSettings.voice || 'system-default'}
            onValueChange={(value) => handleVoiceChange(value === 'system-default' ? '' : value)}
          >
            <SelectTrigger id="voice">
              <SelectValue placeholder="Select voice (default)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system-default">Default Voice</SelectItem>
              {voices
                .filter(v => v.lang.startsWith(settings.voiceSettings.language.split('-')[0]))
                .map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="speech-rate" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Speech Rate
            </Label>
            <span className="text-sm text-muted-foreground">
              {settings.voiceSettings.speechRate.toFixed(1)}x
            </span>
          </div>
          <Slider
            id="speech-rate"
            min={0.5}
            max={2.0}
            step={0.1}
            value={[settings.voiceSettings.speechRate]}
            onValueChange={handleSpeechRateChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slower (0.5x)</span>
            <span>Normal (1.0x)</span>
            <span>Faster (2.0x)</span>
          </div>
        </div>

        {/* Pitch Adjustment Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pitch">Pitch</Label>
            <span className="text-sm text-muted-foreground">
              {settings.voiceSettings.pitch.toFixed(1)}
            </span>
          </div>
          <Slider
            id="pitch"
            min={0.5}
            max={2.0}
            step={0.1}
            value={[settings.voiceSettings.pitch]}
            onValueChange={handlePitchChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lower (0.5)</span>
            <span>Normal (1.0)</span>
            <span>Higher (2.0)</span>
          </div>
        </div>

        {/* Test Voice Button */}
        <div className="pt-4">
          <Button
            onClick={testVoice}
            disabled={isTesting}
            className="w-full"
            variant="outline"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {isTesting ? 'Testing Voice...' : 'Test Voice'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
