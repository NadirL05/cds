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
