import React from 'react';
import { PermissionEditor as HeadlessPermissionEditor, PermissionEditorProps } from '@/ui/headless/permission/PermissionEditor';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/primitives/table';
import { CheckCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';

export interface StyledPermissionEditorProps extends Omit<PermissionEditorProps, 'render'> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function PermissionEditor({
  title = 'Permission Management',
  description = 'Manage permissions for your application',
  footer,
  className,
  ...headlessProps
}: StyledPermissionEditorProps) {
  return (
    <HeadlessPermissionEditor
      {...headlessProps}
      render={({
        permissions,
        refreshPermissions,
        syncPermissions,
        filterValue,
        setFilterValue,
        permissionGroups,
        isLoading,
        error,
        successMessage,
      }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircledIcon className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search permissions"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                disabled={isLoading}
              />
              <Button variant="outline" onClick={refreshPermissions} disabled={isLoading}>
                Refresh
              </Button>
              <Button variant="outline" onClick={syncPermissions} disabled={isLoading}>
                Sync
              </Button>
            </div>
            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <h3 className="font-medium">{group.name}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.permissions.map((permission) => (
                        <TableRow
                          key={typeof permission === 'string' ? permission : permission.name}
                        >
                          <TableCell className="font-medium">
                            {typeof permission === 'string' ? permission : permission.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
              {permissions.length === 0 && (
                <p className="text-sm text-center text-gray-500">No permissions found.</p>
              )}
            </div>
          </CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      )}
    />
  );
}

export default PermissionEditor;
