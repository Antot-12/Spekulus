"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Label } from './label';
import { Slider } from './slider';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { RotateCcw, Maximize2, Copy, ArrowLeftRight, ArrowUpDown, ZoomIn, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

type ImagePositionEditorProps = {
  imageId: number | null;
  // Card view initial values
  initialCardX?: number;
  initialCardY?: number;
  initialCardZoom?: number;
  // Profile view initial values
  initialProfileX?: number;
  initialProfileY?: number;
  initialProfileZoom?: number;
  onPositionChange: (settings: {
    cardX: number;
    cardY: number;
    cardZoom: number;
    profileX: number;
    profileY: number;
    profileZoom: number;
  }) => void;
};

export function ImagePositionEditor({
  imageId,
  initialCardX = 50,
  initialCardY = 20,
  initialCardZoom = 1,
  initialProfileX = 50,
  initialProfileY = 30,
  initialProfileZoom = 1,
  onPositionChange,
}: ImagePositionEditorProps) {
  // Card view state
  const [cardPosX, setCardPosX] = useState(initialCardX);
  const [cardPosY, setCardPosY] = useState(initialCardY);
  const [cardZoom, setCardZoom] = useState(initialCardZoom);

  // Profile view state
  const [profilePosX, setProfilePosX] = useState(initialProfileX);
  const [profilePosY, setProfilePosY] = useState(initialProfileY);
  const [profileZoom, setProfileZoom] = useState(initialProfileZoom);

  const [activeTab, setActiveTab] = useState<string>("card");

  useEffect(() => {
    setCardPosX(initialCardX);
    setCardPosY(initialCardY);
    setCardZoom(initialCardZoom);
    setProfilePosX(initialProfileX);
    setProfilePosY(initialProfileY);
    setProfileZoom(initialProfileZoom);
  }, [initialCardX, initialCardY, initialCardZoom, initialProfileX, initialProfileY, initialProfileZoom]);

  const notifyChange = (updates: Partial<{
    cardX: number; cardY: number; cardZoom: number;
    profileX: number; profileY: number; profileZoom: number;
  }>) => {
    const newSettings = {
      cardX: updates.cardX ?? cardPosX,
      cardY: updates.cardY ?? cardPosY,
      cardZoom: updates.cardZoom ?? cardZoom,
      profileX: updates.profileX ?? profilePosX,
      profileY: updates.profileY ?? profilePosY,
      profileZoom: updates.profileZoom ?? profileZoom,
    };
    onPositionChange(newSettings);
  };

  const handleCardXChange = (value: number[]) => {
    setCardPosX(value[0]);
    notifyChange({ cardX: value[0] });
  };

  const handleCardYChange = (value: number[]) => {
    setCardPosY(value[0]);
    notifyChange({ cardY: value[0] });
  };

  const handleCardZoomChange = (value: number[]) => {
    setCardZoom(value[0]);
    notifyChange({ cardZoom: value[0] });
  };

  const handleProfileXChange = (value: number[]) => {
    setProfilePosX(value[0]);
    notifyChange({ profileX: value[0] });
  };

  const handleProfileYChange = (value: number[]) => {
    setProfilePosY(value[0]);
    notifyChange({ profileY: value[0] });
  };

  const handleProfileZoomChange = (value: number[]) => {
    setProfileZoom(value[0]);
    notifyChange({ profileZoom: value[0] });
  };

  const resetCard = () => {
    setCardPosX(50);
    setCardPosY(20);
    setCardZoom(1);
    notifyChange({ cardX: 50, cardY: 20, cardZoom: 1 });
  };

  const resetProfile = () => {
    setProfilePosX(50);
    setProfilePosY(30);
    setProfileZoom(1);
    notifyChange({ profileX: 50, profileY: 30, profileZoom: 1 });
  };

  const copyCardToProfile = () => {
    setProfilePosX(cardPosX);
    setProfilePosY(cardPosY);
    setProfileZoom(cardZoom);
    notifyChange({ profileX: cardPosX, profileY: cardPosY, profileZoom: cardZoom });
  };

  const copyProfileToCard = () => {
    setCardPosX(profilePosX);
    setCardPosY(profilePosY);
    setCardZoom(profileZoom);
    notifyChange({ cardX: profilePosX, cardY: profilePosY, cardZoom: profileZoom });
  };

  const quickAdjust = (view: 'card' | 'profile', adjustment: 'centerX' | 'centerY' | 'topFocus' | 'zoomIn' | 'zoomOut') => {
    if (view === 'card') {
      switch (adjustment) {
        case 'centerX':
          setCardPosX(50);
          notifyChange({ cardX: 50 });
          break;
        case 'centerY':
          setCardPosY(50);
          notifyChange({ cardY: 50 });
          break;
        case 'topFocus':
          setCardPosY(20);
          notifyChange({ cardY: 20 });
          break;
        case 'zoomIn':
          const newCardZoomIn = Math.min(cardZoom + 0.1, 2);
          setCardZoom(newCardZoomIn);
          notifyChange({ cardZoom: newCardZoomIn });
          break;
        case 'zoomOut':
          const newCardZoomOut = Math.max(cardZoom - 0.1, 0.5);
          setCardZoom(newCardZoomOut);
          notifyChange({ cardZoom: newCardZoomOut });
          break;
      }
    } else {
      switch (adjustment) {
        case 'centerX':
          setProfilePosX(50);
          notifyChange({ profileX: 50 });
          break;
        case 'centerY':
          setProfilePosY(50);
          notifyChange({ profileY: 50 });
          break;
        case 'topFocus':
          setProfilePosY(30);
          notifyChange({ profileY: 30 });
          break;
        case 'zoomIn':
          const newProfileZoomIn = Math.min(profileZoom + 0.1, 2);
          setProfileZoom(newProfileZoomIn);
          notifyChange({ profileZoom: newProfileZoomIn });
          break;
        case 'zoomOut':
          const newProfileZoomOut = Math.max(profileZoom - 0.1, 0.5);
          setProfileZoom(newProfileZoomOut);
          notifyChange({ profileZoom: newProfileZoomOut });
          break;
      }
    }
  };

  if (!imageId) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-center p-8 text-muted-foreground">
          <Maximize2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No image selected</p>
          <p className="text-sm mt-1">Upload or choose an image to adjust positioning.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-primary" />
            <span>Image Positioning & Cropping</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">Adjust how the image appears in different contexts. Card view is for the creators list, profile view is for the detail page.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <span className="w-4 h-3 border border-current rounded-sm" />
              Card View
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <span className="w-3 h-3 border border-current rounded-full" />
              Profile View
            </TabsTrigger>
          </TabsList>

          {/* Card View Tab */}
          <TabsContent value="card" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Preview</Label>
                  <Badge variant="outline" className="text-xs">Creators List</Badge>
                </div>
                <div className="relative h-72 w-full bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-xl border-2 border-primary/30 shadow-lg">
                  <Image
                    src={`/api/images/${imageId}`}
                    alt="Card preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    style={{
                      objectPosition: `${cardPosX}% ${cardPosY}%`,
                      transform: `scale(${cardZoom})`,
                    }}
                  />
                  {/* Crosshair overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  How users see this image on the creators page
                </p>
              </div>

              {/* Card Controls */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Horizontal Position
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">{cardPosX}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quickAdjust('card', 'centerX')}
                        className="h-7 text-xs"
                      >
                        Center
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[cardPosX]}
                    onValueChange={handleCardXChange}
                    min={0}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Vertical Position
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">{cardPosY}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quickAdjust('card', 'topFocus')}
                        className="h-7 text-xs"
                      >
                        Top Focus
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[cardPosY]}
                    onValueChange={handleCardYChange}
                    min={0}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Zoom Level
                    </Label>
                    <span className="text-sm font-mono text-muted-foreground">{cardZoom.toFixed(2)}x</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => quickAdjust('card', 'zoomOut')}
                      className="h-8 px-3"
                    >
                      -
                    </Button>
                    <Slider
                      value={[cardZoom]}
                      onValueChange={handleCardZoomChange}
                      min={0.5}
                      max={2}
                      step={0.05}
                      className="flex-1 cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => quickAdjust('card', 'zoomIn')}
                      className="h-8 px-3"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Zoom in to focus on the face, zoom out to show more context
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={resetCard} className="flex-1 gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyCardToProfile} className="flex-1 gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    Copy to Profile
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Profile View Tab */}
          <TabsContent value="profile" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Preview</Label>
                  <Badge variant="outline" className="text-xs">Detail Page</Badge>
                </div>
                <div className="relative h-72 w-72 mx-auto bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-full border-4 border-primary/30 shadow-xl">
                  <Image
                    src={`/api/images/${imageId}`}
                    alt="Profile preview"
                    fill
                    sizes="288px"
                    className="object-cover"
                    style={{
                      objectPosition: `${profilePosX}% ${profilePosY}%`,
                      transform: `scale(${profileZoom})`,
                    }}
                  />
                  {/* Crosshair overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  How users see this image on the detail page
                </p>
              </div>

              {/* Profile Controls */}
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Horizontal Position
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">{profilePosX}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quickAdjust('profile', 'centerX')}
                        className="h-7 text-xs"
                      >
                        Center
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[profilePosX]}
                    onValueChange={handleProfileXChange}
                    min={0}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      Vertical Position
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">{profilePosY}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quickAdjust('profile', 'topFocus')}
                        className="h-7 text-xs"
                      >
                        Top Focus
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[profilePosY]}
                    onValueChange={handleProfileYChange}
                    min={0}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Zoom Level
                    </Label>
                    <span className="text-sm font-mono text-muted-foreground">{profileZoom.toFixed(2)}x</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => quickAdjust('profile', 'zoomOut')}
                      className="h-8 px-3"
                    >
                      -
                    </Button>
                    <Slider
                      value={[profileZoom]}
                      onValueChange={handleProfileZoomChange}
                      min={0.5}
                      max={2}
                      step={0.05}
                      className="flex-1 cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => quickAdjust('profile', 'zoomIn')}
                      className="h-8 px-3"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust zoom to fit the face perfectly in the circular frame
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={resetProfile} className="flex-1 gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyProfileToCard} className="flex-1 gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    Copy to Card
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex gap-3">
            <div className="text-primary mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Quick Tips:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use crosshairs in preview to see the center point</li>
                <li>Switch tabs to configure each view independently</li>
                <li>Use +/- buttons for precise zoom adjustments</li>
                <li>Copy settings between views for consistency</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
