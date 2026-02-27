import type { BuiltinSkill } from "../types"

export const hyvaCompatModuleSkill: BuiltinSkill = {
  name: "hyva-compat-module",
  description:
    "Hyvä compatibility module development — converting Luma-dependent extensions to work with Hyvä theme (Alpine.js + Tailwind)",
  template: `# Hyvä Compatibility Module Development

You create Hyvä compatibility modules that make Luma-dependent Magento extensions work with the Hyvä theme. This is the most common Hyvä development task.

## What Is a Hyvä Compat Module?
When a third-party Magento extension uses Luma frontend (jQuery, KnockoutJS, RequireJS), it won't work with Hyvä out of the box. A compat module provides alternative Hyvä-native templates and JS.

## Compat Module Structure
\`\`\`
hyva-compat-vendor-module/
├── registration.php
├── composer.json
├── etc/
│   ├── module.xml              # Depends on both original module + Hyva_Theme
│   └── frontend/di.xml         # Override ViewModels if needed
├── src/
│   └── ViewModel/              # New ViewModels replacing Block logic
└── view/
    └── frontend/
        ├── layout/
        │   └── {handle}.xml    # Override layout handles from original module
        └── templates/
            └── {path}/         # Replacement phtml templates
\`\`\`

## module.xml — Declare Dependencies
\`\`\`xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="Vendor_HyvaCompatOriginalModule">
        <sequence>
            <module name="Original_Module"/>
            <module name="Hyva_Theme"/>
        </sequence>
    </module>
</config>
\`\`\`

## Migration Patterns

### KnockoutJS → Alpine.js
\`\`\`html
<!-- BEFORE (Luma/KnockoutJS) -->
<div data-bind="scope: 'component'">
    <span data-bind="text: price"></span>
    <button data-bind="click: addToCart">Add</button>
</div>

<!-- AFTER (Hyvä/Alpine.js) -->
<div x-data="initComponent()">
    <span x-text="price"></span>
    <button @click="addToCart()">Add</button>
</div>
<script>
function initComponent() {
    return {
        price: '0.00',
        async addToCart() {
            const response = await fetch('/rest/V1/cart/add', { ... });
            window.dispatchEvent(new CustomEvent('reload-customer-section-data'));
        }
    }
}
</script>
\`\`\`

### jQuery Widget → Vanilla JS
\`\`\`javascript
// BEFORE (Luma)
$.widget('vendor.customWidget', {
    _create: function() { ... },
    _onClick: function() { ... }
});

// AFTER (Hyvä) — plain Alpine.js component or vanilla JS class
function initCustomWidget(config) {
    return {
        init() { /* replaces _create */ },
        onClick() { /* replaces _onClick */ }
    }
}
\`\`\`

### Block → ViewModel
\`\`\`php
// BEFORE: Block class with template logic
class CustomBlock extends Template {
    public function getItems() { return $this->collection->getItems(); }
}

// AFTER: ViewModel (injectable, testable, no template coupling)
class CustomViewModel implements ArgumentInterface {
    public function __construct(private readonly CollectionFactory $factory) {}
    public function getItems(): array { return $this->factory->create()->getItems(); }
}
\`\`\`

## Compat Module Checklist
1. Identify all frontend templates/layout XML in original module
2. List all JS dependencies (jQuery plugins, KnockoutJS components, RequireJS modules)
3. Create compat module skeleton with proper sequence dependencies
4. Rewrite each template: replace KO bindings with Alpine.js
5. Rewrite each JS component: replace jQuery/KO with Alpine.js/vanilla JS
6. Convert Block classes to ViewModels where possible
7. Replace CSS with Tailwind utilities
8. Test: page loads, interactions work, AJAX calls succeed, FPC compatible
9. Verify no \`cacheable="false"\` blocks remain

## Common Pitfalls
- Forgetting \`private-content-loaded\` event for customer-specific data
- Missing CSRF token in AJAX POST requests (\`window.hyva.getFormKey()\`)
- Not handling the Alpine.js lifecycle (x-init vs x-data timing)
- Leaving RequireJS \`define()\` / \`require()\` calls that break in Hyvä
- Not purging Tailwind CSS after adding new templates (update purge config)
`,
}
