import {
  SubscriptionManager as HeadlessSubscriptionManager,
  type SubscriptionManagerProps,
} from '@/ui/headless/payment/SubscriptionManager';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Alert } from '@/ui/primitives/alert';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export type StyledSubscriptionManagerProps = Omit<SubscriptionManagerProps, 'render'>;

export function SubscriptionManager(props: StyledSubscriptionManagerProps) {
  return (
    <HeadlessSubscriptionManager
      {...props}
      render={({ activeSubscription, isLoading, error, cancelSubscription }) => {
        if (isLoading) {
          return <div>Loading subscription details...</div>;
        }

        if (error) {
          return <Alert variant="destructive">{error}</Alert>;
        }

        return (
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              {activeSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{activeSubscription.plan.name}</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Status: {activeSubscription.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Price: ${activeSubscription.plan.price}/{activeSubscription.plan.interval}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Renews on {new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={cancelSubscription}
                    className="w-full"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No active subscription</p>
                  <Button className="mt-4">Choose a Plan</Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      }}
    />
  );
}