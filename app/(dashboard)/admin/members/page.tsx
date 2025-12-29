import { getStudioMembers } from "@/app/actions/admin-actions";
import { getUserIdOrRedirect } from "@/lib/auth-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanBadge } from "@/components/plan-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function getStatusBadgeVariant(status: string | null): "default" | "secondary" | "destructive" {
  if (status === "active") {
    return "default"; // Green (we'll use custom className)
  }
  return "destructive"; // Red
}

function getStatusBadgeClassName(status: string | null): string {
  if (status === "active") {
    return "bg-green-100 text-green-800 hover:bg-green-100";
  }
  return "";
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function AdminMembersPage() {
  const adminUserId = await getUserIdOrRedirect();
  const members = await getStudioMembers(adminUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all members registered to your studio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Studio Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No members found for this studio.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={member.plan} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(member.subscriptionStatus)}
                        className={getStatusBadgeClassName(member.subscriptionStatus)}
                      >
                        {member.subscriptionStatus || "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(member.createdAt, "MMM d, yyyy", { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

