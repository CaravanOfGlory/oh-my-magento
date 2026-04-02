import type { BuiltinSkill } from "../types"

export const hyvaThemeSkill: BuiltinSkill = {
  name: "hyva-theme",
  description: "Hyvä theme development — Alpine.js components, Tailwind CSS, ViewModels, and Luma-to-Hyvä migration",
  template: `# Hyvä Theme Development

You are an expert at Hyvä theme development for Magento 2. Hyvä replaces Luma's jQuery/KnockoutJS/RequireJS stack with Alpine.js + Tailwind CSS.

## Hyvä Theme Structure
\`\`\`
app/design/frontend/{Vendor}/{theme}/
├── registration.php
├── theme.xml                        # Parent: Hyva/default
├── etc/view.xml                     # Image sizes, etc.
├── Magento_Theme/
│   ├── layout/default.xml           # Override default layout
│   └── templates/root.phtml         # Root template
├── Magento_Catalog/
│   ├── layout/catalog_product_view.xml
│   └── templates/product/view.phtml
├── web/
│   ├── tailwind/
│   │   ├── tailwind.config.js       # Tailwind configuration
│   │   └── tailwind-source.css      # @tailwind directives + custom CSS
│   └── css/styles.css               # Compiled output (do not edit)
└── Hyva_Theme/                      # Override Hyvä base templates
\`\`\`

## Alpine.js Component Pattern
\`\`\`html
<!-- In .phtml template -->
<div x-data="initProductGallery()"
     x-init="init()"
     @private-content-loaded.window="onPrivateContentLoaded($event.detail)">
    <template x-for="image in images" :key="image.id">
        <img :src="image.url" :alt="image.alt" @click="selectImage(image)">
    </template>
</div>

<script>
function initProductGallery() {
    return {
        images: [],
        selectedImage: null,
        init() {
            this.images = window.hyva.getProductGalleryImages();
        },
        selectImage(image) {
            this.selectedImage = image;
        },
        onPrivateContentLoaded(data) {
            // Handle customer-specific data
        }
    }
}
</script>
\`\`\`

## ViewModels (Hyvä Best Practice)
\`\`\`php
// Instead of Block classes, use ViewModels
namespace Vendor\\Module\\ViewModel;

use Magento\\Framework\\View\\Element\\Block\\ArgumentInterface;

class ProductInfo implements ArgumentInterface
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository,
        private readonly PricingHelper $pricingHelper,
    ) {}

    public function getFormattedPrice(ProductInterface $product): string
    {
        return $this->pricingHelper->currency($product->getFinalPrice(), true, false);
    }
}
\`\`\`
\`\`\`xml
<!-- Layout XML: inject ViewModel -->
<block name="product.info.custom"
       template="Vendor_Module::product/info.phtml">
    <arguments>
        <argument name="view_model" xsi:type="object">Vendor\\Module\\ViewModel\\ProductInfo</argument>
    </arguments>
</block>
\`\`\`

## Tailwind CSS Workflow
\`\`\`bash
# In theme directory
npm install
npm run watch     # Development (with hot reload)
npm run build     # Production (purged + minified)
\`\`\`

## Key Hyvä Conventions
- **No jQuery**: Use vanilla JS or Alpine.js
- **No KnockoutJS**: Replace with Alpine.js x-data components
- **No RequireJS**: Use ES modules or inline scripts
- **ViewModels over Blocks**: Always prefer ArgumentInterface ViewModels
- **Private Content**: Use \`@private-content-loaded.window\` for customer-specific data
- **SVG Icons**: Use \`\$hyvaicons->renderHtml('icon-name')\` from HeroIcons ViewModel
- **Tailwind purge**: Ensure phtml templates are in purge paths in tailwind.config.js
- **hyva.* JS API**: Use \`window.hyva\` namespace for cart, customer, messages utilities

## Luma → Hyvä Migration Checklist
1. Replace \`data-bind="..."\` KnockoutJS bindings with Alpine.js \`x-data\`/\`x-bind\`
2. Replace \`require(['jquery'], ...)\` with vanilla JS or Alpine
3. Convert Block classes to ViewModels
4. Replace CSS classes with Tailwind utilities
5. Update layout XML: remove Luma-specific blocks, add Hyvä equivalents
6. Test private content sections (cart, customer, wishlist)
`,
}
