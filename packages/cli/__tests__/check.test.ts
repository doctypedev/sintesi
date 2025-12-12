import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { checkCommand } from '../src/commands/check';
import { SmartChecker } from '../src/services/smart-checker';
import { Logger } from '../src/utils/logger'; // Import Logger to mock it
import * as fs from 'fs';

// Mock dependencies
vi.mock('../src/services/smart-checker');
vi.mock('fs');
vi.mock('../src/utils/logger'); // Auto-mock first

describe('CLI: check command', () => {
  let mockSmartCheckerInstance: any;

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock fs functions
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

    // Setup Logger mock implementation
    // We mock the constructor to return an object with spy methods
    (Logger as unknown as Mock).mockImplementation(() => ({
      header: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      success: vi.fn(),
      newline: vi.fn(),
      divider: vi.fn(),
      log: vi.fn(),
      getVerbose: vi.fn(),
    }));

    // Setup SmartChecker mock
    mockSmartCheckerInstance = {
      checkReadme: vi.fn(),
    };
    vi.mocked(SmartChecker).mockImplementation(() => mockSmartCheckerInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass success=true when SmartChecker detects no drift', async () => {
    // Setup mock return
    mockSmartCheckerInstance.checkReadme.mockResolvedValue({
      hasDrift: false
    });

    const result = await checkCommand({
      verbose: false,
      smart: true,
      base: 'main'
    });

    expect(result.success).toBe(true);
    expect(result.driftedEntries).toBe(0);
    expect(mockSmartCheckerInstance.checkReadme).toHaveBeenCalledWith({ baseBranch: 'main' });
  });

  it('should pass success=false when SmartChecker detects drift', async () => {
    // Setup mock return
    mockSmartCheckerInstance.checkReadme.mockResolvedValue({
      hasDrift: true,
      reason: 'Missing docs',
      suggestion: 'Update docs'
    });

    const result = await checkCommand({
      verbose: false,
      smart: true,
      base: 'main'
    });

    expect(result.success).toBe(false);
    expect(result.driftedEntries).toBe(1);
    expect(mockSmartCheckerInstance.checkReadme).toHaveBeenCalledWith({ baseBranch: 'main' });
    
    // Should verify it tries to write context file
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should default to smart check even if not explicitly enabled (as it is the only check)', async () => {
    // Setup mock return
    mockSmartCheckerInstance.checkReadme.mockResolvedValue({
      hasDrift: false
    });

    const result = await checkCommand({
      verbose: false,
      // smart option omitted, but command should run it
    });

    expect(result.success).toBe(true);
    expect(SmartChecker).toHaveBeenCalled(); // Should still instantiate SmartChecker
  });
});
