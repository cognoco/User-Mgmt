import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/primitives/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/ui/primitives/card';
import {
  InviteMemberForm as InviteMemberFormHeadless,
  InviteMemberFormProps as HeadlessProps
} from '@/ui/headless/team/InviteMemberForm';

export interface InviteMemberFormProps {
  teamId: string;
  onInviteSent?: () => void;
}

export function InviteMemberForm({ teamId, onInviteSent }: InviteMemberFormProps) {
  return (
    <InviteMemberFormHeadless teamId={teamId} onInviteSent={onInviteSent}>
      {({
        email,
        role,
        setEmail,
        setRole,
        handleSubmit,
        isSubmitting,
        error
      }) => (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>
              Send an invitation to add a new member to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email address</label>
                <Input
                  placeholder="colleague@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Sending invitation...' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </InviteMemberFormHeadless>
  );
}
