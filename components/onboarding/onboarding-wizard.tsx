"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitOnboardingData, type OnboardingData } from "@/app/actions/onboarding-actions";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  userId: string;
  initialData?: {
    firstName?: string;
    lastName?: string;
  };
}

type GoalType = "RAFFERMIR" | "PRISE_MASSE" | "PERTE_POIDS" | "SE_MUSCLER";
type LevelType = "DEBUTANT" | "INTERMEDIAIRE" | "CONFIRME";
type FrequencyType = "UNE_DEUX" | "TROIS_QUATRE" | "CINQ_PLUS";

const GOALS: { value: GoalType; label: string; emoji: string }[] = [
  { value: "RAFFERMIR", label: "Raffermir", emoji: "💪" },
  { value: "PRISE_MASSE", label: "Prise de masse", emoji: "🏋️" },
  { value: "PERTE_POIDS", label: "Perte de poids", emoji: "🔥" },
  { value: "SE_MUSCLER", label: "Se muscler", emoji: "💥" },
];

const LEVELS: { value: LevelType; label: string; description: string }[] = [
  { value: "DEBUTANT", label: "Débutant", description: "Je débute le sport" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire", description: "Je pratique régulièrement" },
  { value: "CONFIRME", label: "Confirmé", description: "Je suis un sportif aguerri" },
];

const FREQUENCIES: { value: FrequencyType; label: string }[] = [
  { value: "UNE_DEUX", label: "1-2 fois / semaine" },
  { value: "TROIS_QUATRE", label: "3-4 fois / semaine" },
  { value: "CINQ_PLUS", label: "5+ fois / semaine" },
];

export function OnboardingWizard({ userId, initialData }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 - Profile
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    age: "",
    height: "",
    weight: "",
    city: "",
    department: "",
    phoneNumber: "",

    // Step 2 - Sport
    goal: "" as GoalType | "",
    level: "" as LevelType | "",
    frequency: "" as FrequencyType | "",

    // Step 3 - Nutrition
    eatsMeat: true,
    eatsFish: true,
    eatsEggs: true,
    veggies: "",
    starches: "",
    drinks: "",
    dietaryRestrictions: "",
  });

  const totalSteps = 3;

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const data: OnboardingData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        city: formData.city || null,
        department: formData.department || null,
        phoneNumber: formData.phoneNumber || null,
        goal: formData.goal || null,
        level: formData.level || null,
        frequency: formData.frequency || null,
        eatsMeat: formData.eatsMeat,
        eatsFish: formData.eatsFish,
        eatsEggs: formData.eatsEggs,
        veggies: formData.veggies ? formData.veggies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        starches: formData.starches ? formData.starches.split(",").map((s) => s.trim()).filter(Boolean) : [],
        drinks: formData.drinks ? formData.drinks.split(",").map((s) => s.trim()).filter(Boolean) : [],
        dietaryRestrictions: formData.dietaryRestrictions || null,
      };

      const result = await submitOnboardingData(userId, data);

      if (result.success) {
        toast.success("Profil complété avec succès !");
        router.push("/member");
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
    }
    return true;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all",
                currentStep === step
                  ? "border-[#ff5500] bg-[#ff5500] text-white"
                  : currentStep > step
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400"
              )}
            >
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-[#ff5500] to-orange-400 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>Profil</span>
          <span>Objectifs</span>
          <span>Nutrition</span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-zinc-800 bg-zinc-950/80">
        <CardHeader>
          <CardTitle className="text-xl text-white">
            {currentStep === 1 && "Vos informations personnelles"}
            {currentStep === 2 && "Vos objectifs sportifs"}
            {currentStep === 3 && "Vos préférences alimentaires"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Ces informations nous permettent de personnaliser votre programme."}
            {currentStep === 2 && "Dites-nous ce que vous souhaitez accomplir."}
            {currentStep === 3 && "Nous adapterons votre plan nutritionnel en conséquence."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Profile & Contact */}
          {currentStep === 1 && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="Jean"
                    className="bg-zinc-900 border-zinc-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Dupont"
                    className="bg-zinc-900 border-zinc-800"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Paris"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    placeholder="75"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Téléphone</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    min="10"
                    max="99"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="28"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="120"
                    max="220"
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                    placeholder="175"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="30"
                    max="200"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    placeholder="72"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Sport Goals */}
          {currentStep === 2 && (
            <>
              <div className="space-y-3">
                <Label>Votre objectif principal</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => updateField("goal", g.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all",
                        formData.goal === g.value
                          ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                      )}
                    >
                      <span className="text-2xl">{g.emoji}</span>
                      <span className="font-medium">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Votre niveau actuel</Label>
                <div className="grid gap-3">
                  {LEVELS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => updateField("level", l.value)}
                      className={cn(
                        "flex flex-col p-4 rounded-lg border-2 text-left transition-all",
                        formData.level === l.value
                          ? "border-[#ff5500] bg-[#ff5500]/10"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                      )}
                    >
                      <span className="font-medium text-white">{l.label}</span>
                      <span className="text-sm text-zinc-400">{l.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Fréquence d'entraînement souhaitée</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => updateField("frequency", f.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all",
                        formData.frequency === f.value
                          ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Nutrition */}
          {currentStep === 3 && (
            <>
              <div className="space-y-3">
                <Label>Régime alimentaire</Label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: "eatsMeat" as const, label: "Je mange de la viande", emoji: "🥩" },
                    { key: "eatsFish" as const, label: "Je mange du poisson", emoji: "🐟" },
                    { key: "eatsEggs" as const, label: "Je mange des oeufs", emoji: "🥚" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateField(item.key, !formData[item.key])}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
                        formData[item.key]
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400"
                      )}
                    >
                      <span>{item.emoji}</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="veggies">Légumes préférés</Label>
                <p className="text-xs text-zinc-500">Séparez par des virgules (ex: brocolis, carottes, épinards)</p>
                <Input
                  id="veggies"
                  value={formData.veggies}
                  onChange={(e) => updateField("veggies", e.target.value)}
                  placeholder="brocolis, carottes, épinards, haricots verts"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starches">Féculents préférés</Label>
                <p className="text-xs text-zinc-500">Séparez par des virgules (ex: riz, pâtes, pommes de terre)</p>
                <Input
                  id="starches"
                  value={formData.starches}
                  onChange={(e) => updateField("starches", e.target.value)}
                  placeholder="riz, pâtes, pommes de terre, quinoa"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drinks">Boissons habituelles</Label>
                <p className="text-xs text-zinc-500">Séparez par des virgules (ex: eau, thé, café)</p>
                <Input
                  id="drinks"
                  value={formData.drinks}
                  onChange={(e) => updateField("drinks", e.target.value)}
                  placeholder="eau, thé vert, café"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions">Restrictions / Allergies</Label>
                <Textarea
                  id="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => updateField("dietaryRestrictions", e.target.value)}
                  placeholder="Indiquez vos allergies ou restrictions alimentaires..."
                  className="bg-zinc-900 border-zinc-800 resize-none"
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Précédent
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="bg-[#ff5500] hover:bg-[#ff6600] text-white"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#ff5500] hover:bg-[#ff6600] text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                Terminer
                <Check className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
