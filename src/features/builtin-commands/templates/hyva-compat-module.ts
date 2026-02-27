export const HYVA_COMPAT_MODULE_TEMPLATE = `Create a Hyva compatibility module for a Luma-dependent Magento extension.

This command will:
1. Load skill "hyva-compat-module" for migration patterns
2. Analyze the target module's frontend dependencies (jQuery, KnockoutJS, RequireJS)
3. Create a compat module skeleton with proper sequence dependencies
4. Generate replacement templates using Alpine.js and Tailwind CSS

Process:
1. Scan target module for frontend assets:
   - Layout XML files
   - phtml templates with KnockoutJS bindings
   - RequireJS modules and jQuery widgets
   - Block classes with template logic
2. Present migration plan with file-by-file analysis
3. Generate compat module:
   - registration.php
   - etc/module.xml (depends on target module + Hyva_Theme)
   - Replacement layout XML
   - Alpine.js phtml templates (replacing KO templates)
   - ViewModels (replacing Block classes)
4. Verify FPC compatibility

Arguments:
- Target module name (e.g. "Vendor_Module" or path to module)
- Optional: --output=Vendor_HyvaCompatModule (custom compat module name)
- Optional: --templates-only (skip ViewModel generation, only convert templates)
- Optional: --dry-run (show migration plan without generating files)`
