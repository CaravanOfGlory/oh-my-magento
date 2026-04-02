import type { BuiltinSkill } from "../types"

export const magentoXmlConfigSkill: BuiltinSkill = {
  name: "magento-xml-config",
  description: "Magento 2 XML configuration — di.xml, system.xml, layout XML, events.xml and all config scopes",
  template: `# Magento 2 XML Configuration Expert

You are an expert at Magento 2 XML configuration files. Help users write correct XML config with proper scope, merge rules, and validation.

## Configuration Scopes
- **global**: \`etc/di.xml\`, \`etc/events.xml\` — loaded for all areas
- **frontend**: \`etc/frontend/di.xml\`, \`etc/frontend/routes.xml\` — storefront only
- **adminhtml**: \`etc/adminhtml/di.xml\`, \`etc/adminhtml/routes.xml\` — admin only
- **webapi_rest** / **webapi_soap**: API-specific configuration
- **crontab**: \`etc/crontab.xml\` — cron scope

## di.xml (Dependency Injection)
\`\`\`xml
<!-- Bind interface to implementation -->
<preference for="Vendor\\Module\\Api\\ServiceInterface"
            type="Vendor\\Module\\Model\\Service" />

<!-- Constructor argument injection -->
<type name="Vendor\\Module\\Model\\Service">
  <arguments>
    <argument name="logger" xsi:type="object">Psr\\Log\\LoggerInterface</argument>
    <argument name="config" xsi:type="array">
      <item name="key" xsi:type="string">value</item>
    </argument>
  </arguments>
</type>

<!-- Plugins (Interceptors) -->
<type name="Magento\\Catalog\\Model\\Product">
  <plugin name="vendor_module_product_plugin"
          type="Vendor\\Module\\Plugin\\ProductPlugin"
          sortOrder="10" />
</type>

<!-- Virtual types -->
<virtualType name="CustomLogger" type="Magento\\Framework\\Logger\\Monolog">
  <arguments>
    <argument name="name" xsi:type="string">custom</argument>
  </arguments>
</virtualType>
\`\`\`

## system.xml (Admin Configuration)
\`\`\`xml
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Config:etc/system_file.xsd">
  <system>
    <tab id="vendor_tab" translate="label" sortOrder="100">
      <label>Vendor</label>
    </tab>
    <section id="vendor_module" translate="label" showInDefault="1" showInWebsite="1" showInStore="1">
      <label>Module Settings</label>
      <tab>vendor_tab</tab>
      <resource>Vendor_Module::config</resource>
      <group id="general" translate="label" sortOrder="10" showInDefault="1">
        <label>General</label>
        <field id="enabled" translate="label" type="select" sortOrder="10" showInDefault="1">
          <label>Enable</label>
          <source_model>Magento\\Config\\Model\\Config\\Source\\Yesno</source_model>
        </field>
      </group>
    </section>
  </system>
</config>
\`\`\`

## Layout XML
\`\`\`xml
<!-- Add block to page -->
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
  <body>
    <referenceContainer name="content">
      <block class="Vendor\\Module\\Block\\Custom"
             name="vendor.module.custom"
             template="Vendor_Module::custom.phtml" />
    </referenceContainer>
  </body>
</page>
\`\`\`

## Key Rules
- Always include \`xsi:noNamespaceSchemaLocation\` with correct URN
- Plugin \`sortOrder\` determines execution order (lower = earlier)
- Use \`<preference>\` sparingly — prefer plugins for modifying behavior
- Layout XML merges: later-loaded modules override earlier ones
- Never use \`ObjectManager::getInstance()\` directly — always use DI
- Validate XML against XSD: \`bin/magento dev:urn-catalog:generate\`
`,
}
