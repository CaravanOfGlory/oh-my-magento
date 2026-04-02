export const MAGENTO_PAYMENT_SETUP_TEMPLATE = `Set up a payment gateway integration for Magento 2.

This command will:
1. Create payment method module skeleton
2. Generate payment gateway adapter, configuration, and frontend components
3. Support both Luma checkout and Hyva Checkout integration

HUMAN-IN-THE-LOOP PROTOCOL:
Payment integrations handle sensitive financial data. This command will:
- Present the architecture plan BEFORE generating any code
- Wait for approval on the payment flow design
- Require confirmation before creating API credential configuration

Components generated:
- Payment method model (implements MethodInterface)
- Gateway adapter (command pattern: authorize, capture, void, refund)
- system.xml configuration (API keys, mode toggle, allowed countries)
- Payment info block and form templates
- Frontend JS for card tokenization (if applicable)
- Hyva Checkout payment renderer component (if Hyva detected)
- CSP whitelist for payment provider domains

Arguments:
- Gateway name (e.g. "stripe", "adyen", "braintree-custom")
- Optional: --sandbox-only (only generate sandbox/test configuration)
- Optional: --hyva-only (skip Luma templates, Hyva Checkout only)
- Optional: --hosted (use hosted payment page redirect flow)`
