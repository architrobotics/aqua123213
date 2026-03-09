import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight, Activity, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ai } from '../lib/gemini';
import { useApp } from '../context/AppContext';

const steps = [
  { id: 'welcome', title: 'Welcome to Aqua' },
  { id: 'body', title: 'About You' },
  { id: 'lifestyle', title: 'Your Lifestyle' },
  { id: 'goals', title: 'Skin Goals' },
  { id: 'analyzing', title: 'Analyzing...' },
  { id: 'result', title: 'Your Hydration Plan' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    weight: '65',
    height: '170',
    age: '25',
    activity: 'Moderate',
    climate: 'Temperate',
    skinGoal: 'Clear skin',
  });
  const [result, setResult] = useState<{ goal: number; tips: string[] } | null>(null);

  const handleNext = async () => {
    if (currentStep === 3) {
      setCurrentStep(4);
      setIsAnalyzing(true);
      await analyzeData();
      setIsAnalyzing(false);
      setCurrentStep(5);
    } else if (currentStep === steps.length - 1) {
      // Save to Context
      saveProfile({
        id: 'user_1',
        weight: Number(formData.weight),
        height: Number(formData.height),
        age: Number(formData.age),
        activity_level: formData.activity as any,
        climate: formData.climate as any,
        skin_goal: formData.skinGoal as any,
        water_goal: result?.goal || 2500,
      });
      navigate('/');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const analyzeData = async () => {
    try {
      const prompt = `
        User details:
        Weight: ${formData.weight}kg
        Height: ${formData.height}cm
        Age: ${formData.age}
        Activity: ${formData.activity}
        Climate: ${formData.climate}
        Skin goal: ${formData.skinGoal}

        Calculate the optimal daily water intake in ml.
        Return ONLY a JSON object with this exact structure:
        {
          "goal": 2600,
          "tips": [
            "Drink 400ml after waking up",
            "Sip water throughout the day for clear skin"
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setResult(data);
      }
    } catch (error) {
      console.error('Failed to analyze', error);
      // Fallback
      setResult({
        goal: 2500,
        tips: ["Drink water regularly", "Stay hydrated for glowing skin"],
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      {/* Progress Bar */}
      <div className="mb-8 flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-1 flex-col"
        >
          {currentStep === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary">
                <Droplet size={48} className="fill-primary" />
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-slate-800">
                Aqua
              </h1>
              <p className="mb-12 text-lg text-text-secondary">
                Your AI-powered hydration assistant for glowing skin and optimal wellness.
              </p>
              <Button size="lg" className="w-full max-w-xs" onClick={handleNext}>
                Get Started <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-1 flex-col">
              <h2 className="mb-2 font-display text-3xl font-bold text-slate-800">About You</h2>
              <p className="mb-8 text-text-secondary">Help us calculate your baseline.</p>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full rounded-2xl border-none bg-white p-4 text-lg shadow-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full rounded-2xl border-none bg-white p-4 text-lg shadow-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full rounded-2xl border-none bg-white p-4 text-lg shadow-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="mt-auto pt-8">
                <Button size="lg" className="w-full" onClick={handleNext}>Continue</Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-1 flex-col">
              <h2 className="mb-2 font-display text-3xl font-bold text-slate-800">Lifestyle</h2>
              <p className="mb-8 text-text-secondary">How active are you?</p>
              
              <div className="grid gap-4">
                {['Low', 'Moderate', 'High', 'Very High'].map((level) => (
                  <Card
                    key={level}
                    className={`cursor-pointer border-2 p-5 transition-all ${
                      formData.activity === level ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'
                    }`}
                    onClick={() => setFormData({ ...formData, activity: level })}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        formData.activity === level ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Activity size={24} />
                      </div>
                      <span className="text-lg font-medium text-slate-800">{level}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <h3 className="mb-4 mt-8 font-display text-xl font-bold text-slate-800">Climate</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Cold', 'Temperate', 'Hot', 'Humid'].map((climate) => (
                  <Card
                    key={climate}
                    className={`cursor-pointer border-2 p-4 text-center transition-all ${
                      formData.climate === climate ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'
                    }`}
                    onClick={() => setFormData({ ...formData, climate })}
                  >
                    <MapPin size={24} className={`mx-auto mb-2 ${formData.climate === climate ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="font-medium text-slate-800">{climate}</span>
                  </Card>
                ))}
              </div>
              
              <div className="mt-auto pt-8">
                <Button size="lg" className="w-full" onClick={handleNext}>Continue</Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-1 flex-col">
              <h2 className="mb-2 font-display text-3xl font-bold text-slate-800">Skin Goals</h2>
              <p className="mb-8 text-text-secondary">What do you want to achieve?</p>
              
              <div className="grid gap-4">
                {['Acne reduction', 'Clear skin', 'Hydration', 'General wellness'].map((goal) => (
                  <Card
                    key={goal}
                    className={`cursor-pointer border-2 p-5 transition-all ${
                      formData.skinGoal === goal ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'
                    }`}
                    onClick={() => setFormData({ ...formData, skinGoal: goal })}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        formData.skinGoal === goal ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Sparkles size={24} />
                      </div>
                      <span className="text-lg font-medium text-slate-800">{goal}</span>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="mt-auto pt-8">
                <Button size="lg" className="w-full" onClick={handleNext}>Analyze Profile</Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary border-t-transparent"
              />
              <h2 className="mb-4 font-display text-3xl font-bold text-slate-800">Gemini is analyzing...</h2>
              <p className="text-lg text-text-secondary">Calculating your optimal hydration profile for {formData.skinGoal.toLowerCase()}.</p>
            </div>
          )}

          {currentStep === 5 && result && (
            <div className="flex flex-1 flex-col">
              <div className="mb-8 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20 text-secondary-dark">
                  <CheckCircle2 size={40} />
                </div>
              </div>
              <h2 className="mb-2 text-center font-display text-3xl font-bold text-slate-800">Your Plan is Ready</h2>
              <p className="mb-8 text-center text-text-secondary">Based on your profile, here is your daily goal.</p>
              
              <Card className="mb-8 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-8 text-white">
                <span className="mb-2 text-primary-100">Daily Target</span>
                <span className="font-display text-6xl font-bold tracking-tighter">{result.goal}</span>
                <span className="mt-1 font-medium text-primary-100">ml / day</span>
              </Card>

              <h3 className="mb-4 font-display text-xl font-bold text-slate-800">AI Recommendations</h3>
              <ul className="space-y-3">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <Sparkles size={20} className="mt-0.5 shrink-0 text-primary" />
                    <span className="text-slate-700">{tip}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto pt-8">
                <Button size="lg" className="w-full" onClick={handleNext}>Start Tracking</Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
