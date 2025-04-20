'use client';

import { useEffect } from 'react';
import { useCompanyProfileStore } from '@/lib/stores/companyProfileStore';
import { CompanyAddress } from '@/types/company';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddressCard } from '@/components/company/AddressCard';
import { AddressDialog } from '@/components/company/AddressDialog';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyAddressesPage() {
  const { addresses, isLoading, error, fetchAddresses, addAddress, updateAddress, deleteAddress } = useCompanyProfileStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CompanyAddress | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddClick = () => {
    setSelectedAddress(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (address: CompanyAddress) => {
    setSelectedAddress(address);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(addressId);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedAddress(null);
  };

  const handleAddressSubmit = async (data: Partial<CompanyAddress>) => {
    if (selectedAddress) {
      await updateAddress(selectedAddress.id, data);
    } else {
      await addAddress(data);
    }
    handleDialogClose();
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company Addresses</CardTitle>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : addresses?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No addresses added yet. Click the button above to add your first address.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses?.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditClick(address)}
                  onDelete={() => handleDeleteClick(address.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        address={selectedAddress}
        onSubmit={handleAddressSubmit}
      />
    </div>
  );
} 