import type { BuiltinSkill } from "../types"

export const magentoTestingSkill: BuiltinSkill = {
  name: "magento-testing",
  description: "Magento 2 testing — unit, integration, MFTF, API functional tests with PHPUnit and Magento Test Framework",
  template: `# Magento 2 Testing Expert

You help write and run Magento 2 tests. Cover unit, integration, API functional, and MFTF tests.

## Test Types & Location
- **Unit tests**: \`Test/Unit/\` — fast, no Magento bootstrap, mock dependencies
- **Integration tests**: \`Test/Integration/\` — full Magento bootstrap, real DB
- **API Functional**: \`Test/Api/\` — REST/SOAP endpoint testing
- **MFTF**: \`Test/Mftf/\` — browser-based acceptance tests (XML-based)

## Unit Test Pattern
\`\`\`php
namespace Vendor\\Module\\Test\\Unit\\Model;

use PHPUnit\\Framework\\TestCase;
use PHPUnit\\Framework\\MockObject\\MockObject;
use Vendor\\Module\\Model\\Service;

class ServiceTest extends TestCase
{
    private Service $subject;
    private LoggerInterface|MockObject $loggerMock;

    protected function setUp(): void
    {
        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->subject = new Service($this->loggerMock);
    }

    public function testProcessReturnsExpectedResult(): void
    {
        $result = $this->subject->process(['input' => 'value']);
        $this->assertSame('expected', $result);
    }
}
\`\`\`

## Integration Test Pattern
\`\`\`php
namespace Vendor\\Module\\Test\\Integration\\Model;

use Magento\\TestFramework\\Helper\\Bootstrap;
use PHPUnit\\Framework\\TestCase;

/**
 * @magentoAppArea frontend
 * @magentoDbIsolation enabled
 */
class RepositoryTest extends TestCase
{
    private $repository;

    protected function setUp(): void
    {
        $objectManager = Bootstrap::getObjectManager();
        $this->repository = $objectManager->get(RepositoryInterface::class);
    }

    /**
     * @magentoDataFixture Vendor_Module::Test/Integration/_files/entity.php
     */
    public function testGetByIdReturnsEntity(): void
    {
        $entity = $this->repository->getById(1);
        $this->assertEquals('test', $entity->getName());
    }
}
\`\`\`

## Running Tests
\`\`\`bash
# Unit tests for a module
vendor/bin/phpunit -c dev/tests/unit/phpunit.xml.dist app/code/Vendor/Module/Test/Unit/

# Integration tests
vendor/bin/phpunit -c dev/tests/integration/phpunit.xml.dist --testsuite "Vendor Module"

# API functional tests
vendor/bin/phpunit -c dev/tests/api-functional/phpunit.xml.dist

# MFTF
vendor/bin/mftf run:test TestName
\`\`\`

## Key Rules
- Use \`@magentoDbIsolation enabled\` for integration tests that modify DB
- Use \`@magentoAppArea\` to set correct area (frontend, adminhtml, webapi_rest)
- Data fixtures go in \`Test/Integration/_files/\` with matching rollback files
- Mock external services in unit tests, use real instances in integration tests
- Always test service contracts (interfaces), not concrete implementations
- MFTF tests use page objects — define in \`Test/Mftf/Section/\` and \`Test/Mftf/Page/\`
`,
}
