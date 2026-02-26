"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Timer,
  Target,
  Moon,
  Utensils,
  Coffee,
  Sun,
  Cookie,
  Flame,
  Zap,
  Repeat,
  MessageSquare,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { validateDailyAction } from "@/app/actions/gamification-actions";
import type { SportDay, NutritionDay, Exercise, Meal } from "@/app/actions/plan-actions";

// ==========================================
// VALIDATE DAY BUTTON (GAMIFICATION)
// ==========================================

function ValidateDayButton({
  userId,
  actionType,
}: {
  userId: string | undefined;
  actionType: "SPORT" | "NUTRITION";
}) {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleValidate = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await validateDailyAction(userId, actionType);
      if (result.success) {
        confetti();
        toast.success("+10 Points ! Super travail 🔥");
        setValidated(true);
      } else {
        toast.error(result.error ?? "Une erreur est survenue");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="pt-4 border-t border-border/50">
      <Button
        onClick={handleValidate}
        disabled={loading || validated}
        className={validated ? "bg-green-600 hover:bg-green-600" : ""}
        size="lg"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : validated ? (
          <CheckCircle className="mr-2 h-4 w-4" />
        ) : null}
        {validated ? "Journée validée" : "✅ Valider ma journée"}
      </Button>
    </div>
  );
}

// ==========================================
// SPORT PLAN DISPLAY
// ==========================================

interface SportPlanDisplayProps {
  data: SportDay[];
  className?: string;
  userId?: string;
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50",
        "bg-gradient-to-br from-background/80 to-background/40",
        "backdrop-blur-sm transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
              {index + 1}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{exercise.name}</h4>
              {exercise.note && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {exercise.note}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Repeat className="h-3 w-3 mr-1" />
            {exercise.sets} séries
          </Badge>
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            <Zap className="h-3 w-3 mr-1" />
            {exercise.reps} reps
          </Badge>
          {exercise.restTime && (
            <Badge variant="outline" className="text-muted-foreground">
              <Timer className="h-3 w-3 mr-1" />
              {exercise.restTime}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function SportDayContent({
  day,
  userId,
}: {
  day: SportDay;
  userId?: string;
}) {
  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {day.isRestDay ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Moon className="h-6 w-6 text-blue-500" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{day.dayName}</h3>
            {day.focus && (
              <p className="text-sm text-muted-foreground">{day.focus}</p>
            )}
          </div>
        </div>
        {day.isRestDay && (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Jour de repos
          </Badge>
        )}
      </div>

      {/* Exercises Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {day.exercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} index={index} />
        ))}
      </div>

      <ValidateDayButton userId={userId} actionType="SPORT" />
    </div>
  );
}

export function SportPlanDisplay({ data, className, userId }: SportPlanDisplayProps) {
  const [activeDay, setActiveDay] = useState("0");
  
  const dayShortNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Programme de la Semaine
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
          <div className="border-b bg-muted/30">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              {data.map((day, index) => (
                <TabsTrigger
                  key={index}
                  value={String(index)}
                  className={cn(
                    "relative flex-1 rounded-none border-b-2 border-transparent py-3 px-2 sm:px-4",
                    "data-[state=active]:border-primary data-[state=active]:bg-background",
                    "transition-all duration-200",
                    day.isRestDay && "text-blue-500"
                  )}
                >
                  <span className="hidden sm:inline">{day.dayName}</span>
                  <span className="sm:hidden">{dayShortNames[index]}</span>
                  {day.isRestDay && (
                    <Moon className="ml-1 h-3 w-3 hidden sm:inline-block" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {data.map((day, index) => (
            <TabsContent
              key={index}
              value={String(index)}
              className="p-4 sm:p-6 mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <SportDayContent day={day} userId={userId} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ==========================================
// NUTRITION PLAN DISPLAY
// ==========================================

interface NutritionPlanDisplayProps {
  data: NutritionDay[];
  className?: string;
  userId?: string;
}

const mealIcons = {
  breakfast: Sun,
  lunch: Utensils,
  snack: Cookie,
  dinner: Moon,
};

const mealLabels = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  snack: "Collation",
  dinner: "Dîner",
};

const mealColors = {
  breakfast: "from-yellow-500/10 to-orange-500/5 border-yellow-500/20",
  lunch: "from-green-500/10 to-emerald-500/5 border-green-500/20",
  snack: "from-purple-500/10 to-pink-500/5 border-purple-500/20",
  dinner: "from-blue-500/10 to-indigo-500/5 border-blue-500/20",
};

const mealIconColors = {
  breakfast: "text-yellow-500 bg-yellow-500/10",
  lunch: "text-green-500 bg-green-500/10",
  snack: "text-purple-500 bg-purple-500/10",
  dinner: "text-blue-500 bg-blue-500/10",
};

function MealCard({ 
  meal, 
  type 
}: { 
  meal: Meal; 
  type: "breakfast" | "lunch" | "snack" | "dinner" 
}) {
  const Icon = mealIcons[type];
  
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border",
        "bg-gradient-to-br backdrop-blur-sm transition-all duration-300",
        "hover:shadow-lg",
        mealColors[type]
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", mealIconColors[type])}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {mealLabels[type]}
              </p>
              <h4 className="font-semibold text-foreground">{meal.name}</h4>
            </div>
          </div>
          {meal.calories && (
            <Badge variant="secondary" className="bg-background/50">
              <Flame className="h-3 w-3 mr-1 text-orange-500" />
              {meal.calories} kcal
            </Badge>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
        
        {/* Items */}
        {meal.items && meal.items.length > 0 && (
          <div className="space-y-1.5">
            {meal.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                <span className="text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Protein badge */}
        {meal.protein && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <Badge variant="outline" className="text-xs">
              Protéines: {meal.protein}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function NutritionDayContent({
  day,
  userId,
}: {
  day: NutritionDay;
  userId?: string;
}) {
  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5">
            <Coffee className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{day.dayName}</h3>
            <p className="text-sm text-muted-foreground">Plan nutritionnel</p>
          </div>
        </div>
        {day.totalCalories && (
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            <Flame className="h-3 w-3 mr-1" />
            {day.totalCalories} kcal/jour
          </Badge>
        )}
      </div>

      {/* Meals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <MealCard meal={day.meals.breakfast} type="breakfast" />
        <MealCard meal={day.meals.lunch} type="lunch" />
        <MealCard meal={day.meals.snack} type="snack" />
        <MealCard meal={day.meals.dinner} type="dinner" />
      </div>

      <ValidateDayButton userId={userId} actionType="NUTRITION" />
    </div>
  );
}

export function NutritionPlanDisplay({ data, className, userId }: NutritionPlanDisplayProps) {
  const [activeDay, setActiveDay] = useState("0");
  
  const dayShortNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b bg-gradient-to-r from-green-500/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-green-500" />
          Plan Alimentaire de la Semaine
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
          <div className="border-b bg-muted/30">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              {data.map((day, index) => (
                <TabsTrigger
                  key={index}
                  value={String(index)}
                  className={cn(
                    "relative flex-1 rounded-none border-b-2 border-transparent py-3 px-2 sm:px-4",
                    "data-[state=active]:border-green-500 data-[state=active]:bg-background",
                    "transition-all duration-200"
                  )}
                >
                  <span className="hidden sm:inline">{day.dayName}</span>
                  <span className="sm:hidden">{dayShortNames[index]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {data.map((day, index) => (
            <TabsContent
              key={index}
              value={String(index)}
              className="p-4 sm:p-6 mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <NutritionDayContent day={day} userId={userId} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ==========================================
// COMBINED EXPORTS
// ==========================================

interface PlanDisplayProps {
  type: "SPORT" | "NUTRITION";
  sportData?: SportDay[] | null;
  nutritionData?: NutritionDay[] | null;
  className?: string;
  userId?: string;
}

export function PlanDisplay({ type, sportData, nutritionData, className, userId }: PlanDisplayProps) {
  if (type === "SPORT" && sportData) {
    return <SportPlanDisplay data={sportData} className={className} userId={userId} />;
  }
  
  if (type === "NUTRITION" && nutritionData) {
    return <NutritionPlanDisplay data={nutritionData} className={className} userId={userId} />;
  }
  
  return (
    <Card className={className}>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground">
          Aucun plan disponible pour le moment.
        </p>
      </CardContent>
    </Card>
  );
}
