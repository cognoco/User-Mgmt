/**
 * Styled Role Manager Component
 * 
 * This component provides a default styled implementation of the headless RoleManager.
 * It uses the headless component for behavior and adds UI rendering with Shadcn UI components.
 */

import React from 'react';
import { RoleManager as HeadlessRoleManager, RoleManagerProps } from '../../headless/permission/RoleManager';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ExclamationTriangleIcon, CheckCircledIcon, PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';

export interface StyledRoleManagerProps extends Omit<RoleManagerProps, 'render'> {
  /**
   * Optional title for the role manager
   */
  title?: string;
  
  /**
   * Optional description for the role manager
   */
  description?: string;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

export function RoleManager({
  title = 'Role Management',
  description = 'Create and manage roles and their permissions',
  footer,
  className,
  ...headlessProps
}: StyledRoleManagerProps) {
  return (
    <HeadlessRoleManager
      {...headlessProps}
      render={({
        roles,
        permissions,
        permissionCategories,
        selectedRole,
        setSelectedRole,
        roleForm,
        updateRoleForm,
        handleCreateRole,
        handleUpdateRole,
        handleDeleteRole,
        isLoading,
        error,
        isSuccess,
        successMessage,
        confirmationState,
        setConfirmationState,
        handleConfirmDelete,
        cancelConfirmation,
        isEditMode,
        setIsEditMode,
        resetRoleForm,
        togglePermission,
        selectAllPermissionsInCategory,
        unselectAllPermissionsInCategory,
        isPermissionSelected,
        getPermissionsCountByCategory
      }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircledIcon className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage || 'Operation completed successfully'}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Roles List Panel */}
              <div className="md:col-span-1 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Roles</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      resetRoleForm();
                      setIsEditMode(false);
                      setSelectedRole(null);
                    }}
                    disabled={isLoading}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> New Role
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow 
                            key={role.id}
                            className={selectedRole?.id === role.id ? 'bg-slate-100' : ''}
                          >
                            <TableCell 
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedRole(role);
                                updateRoleForm('name', role.name);
                                updateRoleForm('description', role.description);
                                updateRoleForm('permissions', role.permissions);
                                setIsEditMode(true);
                              }}
                            >
                              <div>
                                <p className="font-medium">{role.name}</p>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                  {role.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {!role.isSystem && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={isLoading}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmationState({ 
                                          roleId: role.id, 
                                          roleName: role.name,
                                          isOpen: true 
                                        });
                                      }}
                                    >
                                      <TrashIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </DialogTrigger>
                                  {confirmationState.isOpen && confirmationState.roleId === role.id && (
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Delete Role</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete the "{confirmationState.roleName}" role? This action cannot be undone and may affect users with this role.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter className="flex space-x-2 justify-end">
                                        <Button
                                          variant="outline"
                                          onClick={cancelConfirmation}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleConfirmDelete(role.id)}
                                        >
                                          Delete Role
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  )}
                                </Dialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {roles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                              No roles defined
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              
              {/* Role Editor Panel */}
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-lg font-medium">
                  {isEditMode ? `Edit Role: ${selectedRole?.name}` : 'Create New Role'}
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={roleForm.name}
                      onChange={(e) => updateRoleForm('name', e.target.value)}
                      disabled={isLoading || (isEditMode && selectedRole?.isSystem)}
                      placeholder="e.g., Admin, Editor, Viewer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea
                      id="roleDescription"
                      value={roleForm.description}
                      onChange={(e) => updateRoleForm('description', e.target.value)}
                      disabled={isLoading || (isEditMode && selectedRole?.isSystem)}
                      placeholder="Describe the purpose and responsibilities of this role"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Permissions</Label>
                      {selectedRole?.isSystem && (
                        <p className="text-sm text-amber-600">
                          System roles have fixed permissions
                        </p>
                      )}
                    </div>
                    
                    <Tabs defaultValue={permissionCategories[0]?.id || "all"} className="w-full">
                      <TabsList className="flex flex-wrap">
                        {permissionCategories.map((category) => (
                          <TabsTrigger key={category.id} value={category.id}>
                            {category.name} ({getPermissionsCountByCategory(category.id)})
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {permissionCategories.map((category) => (
                        <TabsContent key={category.id} value={category.id} className="space-y-4 pt-4">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">{category.description}</p>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => selectAllPermissionsInCategory(category.id)}
                                disabled={isLoading || (isEditMode && selectedRole?.isSystem)}
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unselectAllPermissionsInCategory(category.id)}
                                disabled={isLoading || (isEditMode && selectedRole?.isSystem)}
                              >
                                Deselect All
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissions
                              .filter(p => p.category === category.id)
                              .map((permission) => (
                                <div key={permission.id} className="flex items-start space-x-2 p-2 border rounded-md">
                                  <Checkbox
                                    id={`permission-${permission.id}`}
                                    checked={isPermissionSelected(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                    disabled={isLoading || (isEditMode && selectedRole?.isSystem)}
                                  />
                                  <div className="space-y-1">
                                    <Label
                                      htmlFor={`permission-${permission.id}`}
                                      className="font-medium"
                                    >
                                      {permission.name}
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    {isEditMode ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            resetRoleForm();
                            setIsEditMode(false);
                            setSelectedRole(null);
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleUpdateRole(selectedRole?.id)}
                          disabled={isLoading || !roleForm.name || (selectedRole?.isSystem)}
                        >
                          {isLoading ? 'Saving...' : 'Update Role'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleCreateRole}
                        disabled={isLoading || !roleForm.name}
                      >
                        {isLoading ? 'Creating...' : 'Create Role'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      )}
    />
  );
}
