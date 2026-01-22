"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserProfile } from "@/app/actions/member-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileFormClientProps {
  userId: string;
  initialData: {
    firstName: string;
    lastName: string;
    goals: string[];
    medicalNotes: string | null | undefined;
    height: number | null | undefined;
    weight: number | null | undefined;
    gender: string | null | undefined;
    birthDate: Date | null | undefined;
  };
}

const AVAILABLE_GOALS = [
  "Weight Loss",
  "Muscle",
  "Back Pain",
  "Endurance",
  "Rehabilitation",
  "Flexibility",
];

export function ProfileFormClient({ userId, initialData }: ProfileFormClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    goals: initialData.goals || [],
    medicalNotes: initialData.medicalNotes || "",
    height: initialData.height?.toString() || "",
    weight: initialData.weight?.toString() || "",
    gender: initialData.gender || "",
    birthDate: initialData.birthDate
      ? new Date(initialData.birthDate).toISOString().split("T")[0]
      : "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUserProfile(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        goals: formData.goals,
        medicalNotes: formData.medicalNotes || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender || null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  function toggleGoal(goal: string) {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information and fitness goals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <Label>Fitness Goals</Label>
              <p className="text-sm text-muted-foreground">
                Select all that apply to you
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {AVAILABLE_GOALS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={goal}
                      checked={formData.goals.includes(goal)}
                      onChange={() => toggleGoal(goal)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={goal}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Notes */}
            <div className="space-y-2">
              <Label htmlFor="medicalNotes">Medical Notes</Label>
              <p className="text-sm text-muted-foreground">
                Important medical information or contraindications (confidential)
              </p>
              <Textarea
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, medicalNotes: e.target.value }))
                }
                rows={4}
                placeholder="e.g., Knee injury, Asthma, etc."
                className="resize-none"
              />
            </div>

            {/* Health Metrics Section */}
            <div className="border-t pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Health Metrics</h3>
                <p className="text-sm text-muted-foreground">
                  Ces informations permettent de calculer votre IMC et suivre votre progression
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="gender-male"
                      name="gender"
                      value="MALE"
                      checked={formData.gender === "MALE"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, gender: e.target.value }))
                      }
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="gender-male" className="text-sm font-normal cursor-pointer">
                      Homme
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="gender-female"
                      name="gender"
                      value="FEMALE"
                      checked={formData.gender === "FEMALE"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, gender: e.target.value }))
                      }
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="gender-female" className="text-sm font-normal cursor-pointer">
                      Femme
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="gender-other"
                      name="gender"
                      value="OTHER"
                      checked={formData.gender === "OTHER"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, gender: e.target.value }))
                      }
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="gender-other" className="text-sm font-normal cursor-pointer">
                      Autre
                    </Label>
                  </div>
                </div>
              </div>

              {/* Height and Weight */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="120"
                    max="220"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, height: e.target.value }))
                    }
                    placeholder="175"
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, weight: e.target.value }))
                    }
                    placeholder="72"
                  />
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, birthDate: e.target.value }))
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
