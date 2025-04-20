import { CompanyAddress } from '@/types/company';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface AddressCardProps {
  address: CompanyAddress;
  onEdit: (address: CompanyAddress) => void;
  onDelete: (address: CompanyAddress) => void;
}

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-medium">{address.street_address}</p>
            {address.street_address2 && (
              <p className="text-sm text-muted-foreground">{address.street_address2}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p className="text-sm text-muted-foreground">{address.country}</p>
            {address.is_default && (
              <p className="text-sm text-primary">Default Address</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(address)}
              aria-label="Edit address"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address)}
              aria-label="Delete address"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 