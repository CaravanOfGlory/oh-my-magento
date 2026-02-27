import type { BuiltinSkill } from "../types"

export const hyvaCheckoutSkill: BuiltinSkill = {
  name: "hyva-checkout",
  description: "Hyvä Checkout development — React-based checkout, custom steps, payment integration, and Magewire components",
  template: `# Hyvä Checkout Development

You are an expert at Hyvä Checkout for Magento 2. Hyvä Checkout uses React (Preact) with a modular step-based architecture, replacing Magento's default KnockoutJS checkout.

## Architecture Overview
- **Frontend**: React (Preact) components with hooks
- **State Management**: React Context + useReducer
- **API Layer**: REST API calls to Magento backend
- **Server Components**: Magewire (LiveWire for Magento) for server-rendered interactive components
- **Styling**: Tailwind CSS (inherits from Hyvä theme)

## Checkout Step Structure
\`\`\`
Hyvä Checkout
├── Login / Email Step
├── Shipping Address Step
├── Shipping Method Step
├── Payment Method Step
│   ├── Built-in payment renderers
│   └── Custom payment method components
└── Order Summary + Place Order
\`\`\`

## Custom Payment Method Integration
\`\`\`jsx
// React component for custom payment method
const CustomPaymentMethod = ({ method, selected, onSelect }) => {
    const [cardData, setCardData] = useState({});

    return (
        <div className="border rounded-lg p-4">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="radio"
                    name="payment_method"
                    value={method.code}
                    checked={selected}
                    onChange={() => onSelect(method.code)}
                />
                <span className="font-medium">{method.title}</span>
            </label>
            {selected && (
                <div className="mt-4 space-y-3">
                    {/* Payment-specific fields */}
                </div>
            )}
        </div>
    );
};
\`\`\`

## Magewire Components (Server-Side Interactive)
\`\`\`php
namespace Vendor\\Module\\Magewire;

use Magewire\\Component;

class ShippingEstimator extends Component
{
    public string $postcode = '';
    public array $rates = [];

    public function updatedPostcode(string $value): void
    {
        if (strlen($value) >= 5) {
            $this->rates = $this->estimateShipping($value);
        }
    }

    private function estimateShipping(string $postcode): array
    {
        // Call shipping rate estimation
    }
}
\`\`\`
\`\`\`html
<!-- In phtml template -->
<div wire:component="shipping-estimator">
    <input type="text" wire:model.debounce.300ms="postcode" placeholder="ZIP Code">
    <template x-for="rate in $wire.rates">
        <div x-text="rate.carrier_title + ': ' + rate.price"></div>
    </template>
</div>
\`\`\`

## Key Conventions
- **Payment methods**: Register via \`payment_method_renderer\` in checkout config
- **Address validation**: Hook into address step's \`onAddressChange\` callback
- **Order totals**: Use \`totals\` context provider for real-time price updates
- **Custom fields**: Add via checkout layout XML + React field components
- **CSP**: Ensure third-party payment JS domains are in CSP whitelist
- **Guest checkout**: Always handle both guest and logged-in flows
- **Error handling**: Use checkout message system for user-facing errors

## Testing Checkout Customizations
1. Test guest checkout flow end-to-end
2. Test logged-in customer with saved addresses
3. Test with multiple shipping methods
4. Test payment failure and retry scenarios
5. Test order placement with various product types (simple, configurable, bundle, virtual)
`,
}
