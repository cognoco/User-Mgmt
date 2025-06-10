import React, { useState } from "react";
import {
  InvitationManager as HeadlessInvitationManager,
  InvitationManagerProps,
} from "@/ui/headless/team/InvitationManager";
import { Input } from "@/ui/primitives/input";
import { Button } from "@/ui/primitives/button";
import { Label } from "@/ui/primitives/label";
import { Alert, AlertDescription } from "@/ui/primitives/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/primitives/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/primitives/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/primitives/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/primitives/dialog";
import {
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { InvitationStatus, TeamInvitation } from "@/core/team/models";

export interface StyledInvitationManagerProps
  extends Omit<InvitationManagerProps, "render"> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

interface ConfirmationState {
  invitationId: string;
  email: string;
  isOpen: boolean;
}

export function InvitationManager({
  title = "Manage Team Invitations",
  description = "Send and manage invitations to your team",
  footer,
  className,
  ...headlessProps
}: StyledInvitationManagerProps) {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>(
    {
      invitationId: "",
      email: "",
      isOpen: false,
    },
  );

  const cancelConfirmation = () =>
    setConfirmationState({ invitationId: "", email: "", isOpen: false });

  return (
    <HeadlessInvitationManager
      {...headlessProps}
      render={({
        teamInvitations,
        emailValue,
        setEmailValue,
        roleValue,
        setRoleValue,
        handleSendInvitation,
        resendInvitation,
        cancelInvitation,
        isLoading,
        error,
        successMessage,
        formErrors,
        touched,
        handleBlur,
        availableRoles,
      }) => {
        const pendingInvitations = teamInvitations.filter(
          (inv) => inv.status === InvitationStatus.PENDING,
        );
        const sentInvitations = teamInvitations.filter(
          (inv) => inv.status !== InvitationStatus.PENDING,
        );

        const handleConfirmCancel = async (id: string) => {
          await cancelInvitation(id);
          cancelConfirmation();
        };

        return (
          <Card className={className}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircledIcon className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage || "Operation completed successfully"}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="send" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="send">Send Invitation</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({pendingInvitations.length})
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    Sent ({sentInvitations.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="send" className="space-y-6 pt-4">
                  <form onSubmit={handleSendInvitation} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        disabled={isLoading}
                        placeholder="colleague@example.com"
                      />
                      {touched.email && formErrors.email && (
                        <p className="text-sm text-red-500">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select
                        value={roleValue}
                        onValueChange={(value) => setRoleValue(value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="invite-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {touched.role && formErrors.role && (
                        <p className="text-sm text-red-500">
                          {formErrors.role}
                        </p>
                      )}
                    </div>

                    {formErrors.form && (
                      <Alert variant="destructive">
                        <AlertDescription>{formErrors.form}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="pending" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-lg font-medium">
                        Pending Invitations
                      </h3>
                      <p className="text-sm text-gray-500">
                        Invitations that have been sent but not yet accepted
                      </p>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInvitations.map(
                          (invitation: TeamInvitation) => (
                            <TableRow key={invitation.id}>
                              <TableCell>{invitation.email}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {invitation.role}
                                </span>
                              </TableCell>
                              <TableCell>{invitation.sentAt}</TableCell>
                              <TableCell>{invitation.expiresAt}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      resendInvitation(invitation.id)
                                    }
                                    disabled={isLoading}
                                  >
                                    Resend
                                  </Button>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isLoading}
                                        onClick={() =>
                                          setConfirmationState({
                                            invitationId: invitation.id,
                                            email: invitation.email,
                                            isOpen: true,
                                          })
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    </DialogTrigger>
                                    {confirmationState.isOpen &&
                                      confirmationState.invitationId ===
                                        invitation.id && (
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Cancel Invitation
                                            </DialogTitle>
                                            <DialogDescription>
                                              Are you sure you want to cancel
                                              the invitation sent to{" "}
                                              {confirmationState.email}? This
                                              action cannot be undone.
                                            </DialogDescription>
                                          </DialogHeader>
                                          <DialogFooter className="flex space-x-2 justify-end">
                                            <Button
                                              variant="outline"
                                              onClick={cancelConfirmation}
                                            >
                                              No, Keep Invitation
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              onClick={() =>
                                                handleConfirmCancel(
                                                  invitation.id,
                                                )
                                              }
                                            >
                                              Yes, Cancel Invitation
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      )}
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )}

                        {pendingInvitations.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 text-gray-500"
                            >
                              No pending invitations
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="sent" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-lg font-medium">Sent Invitations</h3>
                      <p className="text-sm text-gray-500">
                        History of invitations that have been accepted or
                        expired
                      </p>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sentInvitations.map((invitation: TeamInvitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell>{invitation.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {invitation.role}
                              </span>
                            </TableCell>
                            <TableCell>{invitation.sentAt}</TableCell>
                            <TableCell>{invitation.status}</TableCell>
                            <TableCell>
                              {invitation.completedAt || "-"}
                            </TableCell>
                          </TableRow>
                        ))}

                        {sentInvitations.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 text-gray-500"
                            >
                              No sent invitations history
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            {footer && <CardFooter>{footer}</CardFooter>}
          </Card>
        );
      }}
    />
  );
}
