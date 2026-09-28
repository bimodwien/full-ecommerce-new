import { toast } from 'sonner';
import { createOrder } from '@/helpers/fetch-order';
import { TCart } from '@/models/cart.model';
import { AppDispatch } from '@/libraries/redux/store';
import { decrementCartCountBy } from '@/libraries/redux/slices/cart.slice';

type Navigate = (url: string) => void;

function openSnap(snapToken: string, orderUrl: string, go: Navigate) {
  window.snap!.pay(snapToken, {
    onSuccess: () => {
      toast.success('Payment successful.');
      go(orderUrl);
    },
    onPending: () => {
      toast.info('Payment pending.');
      go(orderUrl);
    },
    onError: () => {
      toast.error('Payment failed.');
      go(orderUrl);
    },
    onClose: () => {
      toast.warning(
        'Payment closed. You can finish the payment from this order.',
      );
      go(orderUrl);
    },
  });
}

type PlaceOrderDeps = {
  dispatch: AppDispatch;
  go: Navigate;
  onPlaced: () => void;
};

// Creates the order(s) for these carts, then opens the Midtrans Snap popup.
export async function placeOrder(carts: TCart[], deps: PlaceOrderDeps) {
  try {
    const { orders, snapToken, paymentInitError } = await createOrder(
      carts.map((c) => c.id),
    );
    // Checkout is split per seller, so land on the list when there's more than one order
    const orderUrl = orders.length === 1 ? `/order/${orders[0].id}` : '/order';
    deps.onPlaced();
    deps.dispatch(decrementCartCountBy(carts.length));

    if (paymentInitError || !snapToken) {
      toast.error(
        'Order created, but payment setup failed. Retry from Order History.',
      );
      return deps.go(orderUrl);
    }
    if (!window.snap) {
      toast.error('Payment is not ready yet, please try again.');
      return deps.go(orderUrl);
    }
    openSnap(snapToken, orderUrl, deps.go);
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to start checkout.');
  }
}
