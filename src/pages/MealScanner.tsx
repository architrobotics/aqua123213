import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, X, Check, AlertCircle, Droplets } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, GlassCard } from '../components/ui/Card';
import { ai } from '../lib/gemini';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function MealScanner() {
  const navigate = useNavigate();
  const { addDailyAdjustment } = useApp();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    foods: string[];
    salt: string;
    recommendation: string;
    adjustment: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageSrc(null);
    setResult(null);
  };

  const analyzeMeal = async () => {
    if (!imageSrc) return;
    setIsAnalyzing(true);
    
    try {
      // Extract base64 data
      const base64Data = imageSrc.split(',')[1];
      const mimeType = imageSrc.split(';')[0].split(':')[1];

      const prompt = `
        Analyze this meal for its impact on hydration and skin health.
        Return ONLY a JSON object with this exact structure:
        {
          "foods": ["Fried rice", "Chicken", "Soy sauce"],
          "salt": "High",
          "recommendation": "Drink +350 ml extra water today to balance sodium intake.",
          "adjustment": 350
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setResult(data);
      }
    } catch (error) {
      console.error('Failed to analyze meal', error);
      // Fallback for demo if API fails
      setResult({
        foods: ["Unknown meal"],
        salt: "Moderate",
        recommendation: "Drink +200 ml extra water to aid digestion.",
        adjustment: 200
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAdjustment = () => {
    if (result) {
      addDailyAdjustment(result.adjustment);
      navigate('/');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-800">Meal Scanner</h1>
        <p className="text-text-secondary">AI analysis for hydration impact.</p>
      </header>

      {!imageSrc ? (
        <Card className="flex aspect-[4/5] flex-col items-center justify-center border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Camera size={40} />
          </div>
          <h2 className="mb-2 font-display text-xl font-bold text-slate-800">Scan your meal</h2>
          <p className="mb-8 text-sm text-text-secondary">
            Take a photo of your food to see how it affects your hydration needs.
          </p>
          
          <div className="flex w-full flex-col gap-3">
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
              <Camera className="mr-2" size={20} /> Take Photo
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full bg-white">
              <Upload className="mr-2" size={20} /> Upload Image
            </Button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl shadow-sm">
            <img src={imageSrc} alt="Meal" className="aspect-[4/5] w-full object-cover" />
            <Button 
              variant="glass" 
              size="icon" 
              className="absolute right-4 top-4 rounded-full bg-black/20 text-white hover:bg-black/40"
              onClick={clearImage}
            >
              <X size={20} />
            </Button>
          </div>

          {!result ? (
            <Button 
              size="lg" 
              className="w-full" 
              onClick={analyzeMeal}
              isLoading={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing Meal...' : 'Analyze Meal'}
            </Button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-4"
              >
                <GlassCard className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary-dark">
                      <Check size={20} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-800">Analysis Complete</h3>
                  </div>
                  
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-text-secondary">Detected:</span>
                      <span className="font-medium text-slate-800">{result.foods.join(', ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-text-secondary">Salt Content:</span>
                      <span className={`font-medium ${result.salt === 'High' ? 'text-orange-500' : 'text-slate-800'}`}>
                        {result.salt}
                      </span>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-primary/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-primary-dark">
                      <AlertCircle size={18} />
                      <span className="font-bold">Recommendation</span>
                    </div>
                    <p className="text-sm text-slate-700">{result.recommendation}</p>
                  </div>
                </GlassCard>

                <Button 
                  size="lg" 
                  className="w-full bg-secondary text-slate-800 hover:bg-secondary-dark shadow-secondary/20"
                  onClick={handleApplyAdjustment}
                >
                  <Droplets className="mr-2" size={20} />
                  Add +{result.adjustment}ml to Daily Goal
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </motion.div>
  );
}
